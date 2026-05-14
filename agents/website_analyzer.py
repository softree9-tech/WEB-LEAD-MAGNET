import os
import base64
import time
import re
import requests
import concurrent.futures
from urllib.parse import urljoin
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
from core.llm import generate_response
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from core.models import WebsiteAnalyzerOutput
from core.state import AgentState
import socket
import ssl
from datetime import datetime

def check_ssl_certificate(url: str) -> dict:
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url if url.startswith('http') else f"https://{url}")
        hostname = parsed.hostname
        if not hostname:
            return {"valid": False, "days_remaining": 0, "https_enforced": False}
        
        context = ssl.create_default_context()
        try:
            redirect_test = requests.get(f"http://{hostname}", timeout=5, allow_redirects=False)
            https_enforced = redirect_test.status_code in [301, 302, 307, 308] and redirect_test.headers.get('Location', '').startswith('https://')
        except Exception:
            https_enforced = True

        with socket.create_connection((hostname, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                expire_date_str = cert.get('notAfter')
                expire_date = datetime.strptime(expire_date_str, '%b %d %H:%M:%S %Y %Z')
                days_remaining = (expire_date - datetime.utcnow()).days
                return {"valid": days_remaining > 0, "days_remaining": max(0, days_remaining), "https_enforced": https_enforced}
    except Exception:
        return {"valid": False, "days_remaining": 0, "https_enforced": False}

def calculate_revenue_leak(metrics: dict) -> dict:
    """
    Heuristically estimates revenue leak based on performance, SEO, and conversion factors.
    Returns: amount, severity, explanation, visitors_lost, leads_lost
    """
    # Baselines for a "typical" prospect website
    base_monthly_revenue = 10000 
    base_monthly_visitors = 2000
    base_conversion_rate = 0.03 # 3%

    leak_percent = 0.0
    
    # 1. Performance Leak (Speed)
    load_time = float(metrics.get("load_time", 0.0))
    if load_time > 2.5:
        # Every second above 2.5s costs ~10% conversion/traffic
        speed_leak = min(0.4, (load_time - 2.5) * 0.12)
        leak_percent += speed_leak

    # 2. SEO Leak (Visibility)
    seo_score = metrics.get("seo_score", 100)
    if seo_score < 80:
        seo_leak = (80 - seo_score) / 100 * 0.35
        leak_percent += seo_leak

    # 3. Conversion Leak (Capture/CTA)
    if not metrics.get("has_lead_capture"):
        leak_percent += 0.25
    if not metrics.get("has_cta"):
        leak_percent += 0.15
    if not metrics.get("has_newsletter"):
        leak_percent += 0.05

    # 4. Trust Leak (Security/Signals)
    if not metrics.get("seo_ssl"):
        leak_percent += 0.20
    if metrics.get("trust") == "Weak":
        leak_percent += 0.10
    
    # Cap total leak at 85% to stay "realistic"
    leak_percent = min(0.85, leak_percent)
    
    amount = int(base_monthly_revenue * leak_percent)
    visitors_lost = int(base_monthly_visitors * (leak_percent * 0.6)) # Traffic is only part of the leak
    leads_lost = int((base_monthly_visitors * base_conversion_rate) * leak_percent)

    severity = "Low"
    if amount > 4000: severity = "Critical"
    elif amount > 2500: severity = "High"
    elif amount > 1000: severity = "Moderate"

    # Emotional explanation
    explanations = []
    if load_time > 3.0: explanations.append("slow load speeds causing bounce")
    if seo_score < 60: explanations.append("poor search visibility")
    if not metrics.get("has_lead_capture"): explanations.append("missing lead capture paths")
    if not metrics.get("seo_ssl"): explanations.append("security warnings scaring visitors")
    
    if not explanations:
        explanation = "minor technical inefficiencies and missed conversion opportunities."
    else:
        explanation = f"due to {', '.join(explanations[:2])} and weak conversion optimization."

    return {
        "amount": amount,
        "severity": severity,
        "explanation": f"You are likely losing ~${amount:,}/month {explanation}",
        "visitors_lost": visitors_lost,
        "leads_lost": leads_lost
    }

def calculate_missing_leads_metrics(elements: dict) -> dict:
    """Calculates missing opportunities count and conversion loss."""
    total_checks = 7
    present_count = sum(1 for v in elements.values() if v)
    missing_count = total_checks - present_count
    
    # Heuristic conversion loss based on missing key elements
    loss_map = {
        "cta_presence": 20,
        "contact_form": 25,
        "newsletter_signup": 10,
        "chat_whatsapp": 15,
        "demo_booking": 15,
        "sticky_cta": 10,
        "popup_lead_capture": 15
    }
    
    total_loss = 0
    for key, value in elements.items():
        if not value:
            total_loss += loss_map.get(key, 0)
            
    # Cap at 90%
    total_loss = min(90, total_loss)
    
    missing_items = [k.replace("_", " ").title() for k, v in elements.items() if not v]
    
    return {
        "missing_count": missing_count,
        "missing_items": missing_items,
        "conversion_loss_percent": total_loss,
    }

def calculate_industry_percentile(metrics: dict) -> dict:
    """
    Heuristically compares the website against industry standards.
    Returns: percentile, competitiveness, tier
    """
    seo = metrics.get("seo_score", 0)
    perf = metrics.get("performance_score", 0)
    
    trust_str = metrics.get("trust", "")
    trust_score = 90 if trust_str == "Strong" else (60 if trust_str == "Moderate" else 40)
    
    design_val = 90 if metrics.get("design") == "Modern" else 60
    message_val = 80 if metrics.get("message") == "Clear" else 50
    mobile_val = 80 if metrics.get("seo_mobile") else 30
    cta_val = 90 if metrics.get("cta") == "Strong" else 40
    ux_score = (design_val + message_val + mobile_val + cta_val) / 4

    readiness_str = metrics.get("readiness_level", "Low")
    readiness_score = 90 if readiness_str == "High" else (60 if readiness_str == "Medium" else 30)

    # Simple average weighting
    average_score = (seo + perf + trust_score + ux_score + readiness_score) / 5
    
    # Map average score (0-100) to a percentile (1-99)
    # Heuristic: Score of 80 is ~85th percentile, 50 is ~30th percentile
    percentile = int(max(1, min(99, (average_score - 15) * 1.3)))
    
    if percentile >= 85:
        tier = "Industry Leading"
        competitiveness = "High"
    elif percentile >= 60:
        tier = "Competitive"
        competitiveness = "Moderate-High"
    elif percentile >= 30:
        tier = "Below Average"
        competitiveness = "Moderate-Low"
    else:
        tier = "Critical"
        competitiveness = "Low"

    return {
        "percentile": percentile,
        "tier": tier,
        "competitiveness": competitiveness
    }

def check_newsletter(soup) -> bool:
    forms = soup.find_all("form")

    keywords = [
        "subscribe",
        "newsletter",
        "sign up",
        "join",
        "email updates",
        "mailing list",
        "stay updated",
        "get updates",
        "email alerts",
        "weekly updates"
    ]

    for f in forms:
        text = f.get_text().lower()

        if any(k in text for k in keywords):
            return True

    return False

def extract_last_modified(headers: dict, html: str) -> str:
    if headers and 'last-modified' in headers:
        return headers['last-modified']
    meta_match = re.search(r'property="article:modified_time"\s+content="([^"]+)"', html)
    if meta_match: return meta_match.group(1)[:10]
    copyright_match = re.search(r'(?:Copyright|©).*?(201[0-9]|202[0-5])', html, re.IGNORECASE)
    if copyright_match: return f"Outdated (© {copyright_match.group(1)})"
    return "Unknown"

def _run_lighthouse(url: str, strategy: str, categories: list) -> dict:
    """Runs a single Lighthouse audit via the PageSpeed API."""
    try:
        api_key = os.environ.get("GOOGLE_API_KEY", "")
        cat_params = "&".join([f"category={c}" for c in categories])
        api_url = f"https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={url}&strategy={strategy}&{cat_params}"
        if api_key:
            api_url += f"&key={api_key}"
        res = requests.get(api_url, timeout=60)
        if res.status_code == 200:
            return res.json().get('lighthouseResult', {})
    except Exception as e:
        print(f"Lighthouse {strategy} Error: {e}")
    return {}

def _extract_top_issues(data: dict, category_id: str) -> list:
    issues = []
    try:
        audits = data.get('audits', {})
        category = data.get('categories', {}).get(category_id, {})
        audit_refs = category.get('auditRefs', [])
        sorted_refs = sorted(audit_refs, key=lambda x: x.get('weight', 0), reverse=True)
        for ref in sorted_refs:
            audit = audits.get(ref.get('id', ''), {})
            score = audit.get('score')
            if score is not None and score < 0.9:
                t = audit.get('title', '')
                d = audit.get('displayValue', '')
                if t: issues.append(f"{t} ({d})" if d else t)
            if len(issues) >= 2: break
    except Exception: pass
    return issues

def get_google_pagespeed(url: str) -> dict:
    """Runs desktop + mobile Lighthouse audits in parallel, returns all scores."""
    result = {
        "speed": 0.0, "lighthouse_seo": 0, 
        "lighthouse_performance": 0, "lighthouse_accessibility": 0,
        "mobile_performance": 0,
        "api_success": False,
        "issues": {"performance": [], "accessibility": [], "seo": [], "mobile": []}
    }
    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            desktop_future = executor.submit(_run_lighthouse, url, "desktop", ["seo", "performance", "accessibility"])
            mobile_future = executor.submit(_run_lighthouse, url, "mobile", ["performance"])
            
            desktop_data = desktop_future.result(timeout=65)
            mobile_data = mobile_future.result(timeout=65)
        
        # Extract desktop scores
        if desktop_data and 'error' not in desktop_data:
            result['api_success'] = True
            speed = desktop_data.get('audits', {}).get('speed-index', {}).get('numericValue', 0.0)
            if speed:
                result["speed"] = round(speed / 1000, 2)
            cats = desktop_data.get('categories', {})
            for key, field in [("seo", "lighthouse_seo"), ("performance", "lighthouse_performance"), ("accessibility", "lighthouse_accessibility")]:
                score = cats.get(key, {}).get('score', 0)
                if score:
                    result[field] = int(score * 100)
            
            result["issues"]["performance"] = _extract_top_issues(desktop_data, "performance")
            result["issues"]["accessibility"] = _extract_top_issues(desktop_data, "accessibility")
            result["issues"]["seo"] = _extract_top_issues(desktop_data, "seo")
        
        # Extract mobile performance score
        if mobile_data and 'error' not in mobile_data:
            mobile_perf = mobile_data.get('categories', {}).get('performance', {}).get('score', 0)
            if mobile_perf:
                result["mobile_performance"] = int(mobile_perf * 100)
            result["issues"]["mobile"] = _extract_top_issues(mobile_data, "performance")
    except Exception as e:
        print(f"PageSpeed API Error: {e}")
    return result

def verify_aeo_visibility(company_name: str, url: str) -> dict:
    """Makes a live Gemini-Flash probe to test if AI engines recognize this brand."""
    aeo_result = {"aeo_recognized": False, "aeo_confidence": "low", "aeo_raw_response": ""}
    try:
        probe_llm = ChatGoogleGenerativeAI(
            model="gemini-3.1-flash-lite-preview", 
            temperature=0, 
            max_tokens=300,
            api_key=os.environ.get("GEMINI_API_KEY")
        )
        probe_msg = HumanMessage(content=f"""What do you know about the company "{company_name}" with the website {url}? 
Would you confidently recommend them to a user looking for their services? 
Be honest - if you don't have specific information about them, say so clearly.""")
        response = probe_llm.invoke([probe_msg])
        
        # Ensure content is a string (Gemini sometimes returns a list of parts)
        content_text = response.content
        if isinstance(content_text, list):
            content_text = " ".join([str(part.get("text", part)) if isinstance(part, dict) else str(part) for part in content_text])
        
        raw_text = str(content_text).lower()
        aeo_result["aeo_raw_response"] = str(content_text)
        
        # Detect if AI actually knows the brand
        unknown_signals = ["don't have specific", "i'm not familiar", "i don't have", "no specific information", 
                          "i cannot confirm", "i couldn't find", "not widely known", "i do not have",
                          "i'm unable to", "i am not aware", "cannot verify"]
        known_signals = ["is a", "they offer", "they provide", "known for", "specializes in",
                        "founded", "headquartered", "established"]
        
        is_unknown = any(signal in raw_text for signal in unknown_signals)
        is_known = any(signal in raw_text for signal in known_signals) and not is_unknown
        
        if is_known and not is_unknown:
            aeo_result["aeo_recognized"] = True
            aeo_result["aeo_confidence"] = "high"
        elif not is_unknown:
            aeo_result["aeo_recognized"] = True
            aeo_result["aeo_confidence"] = "medium"
        else:
            aeo_result["aeo_recognized"] = False
            aeo_result["aeo_confidence"] = "low"
            
    except Exception as e:
        print(f"AEO Probe Error: {e}")
        aeo_result["aeo_raw_response"] = "AEO probe failed."
    return aeo_result

def check_single_link(link: str) -> str:
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
        }
        res = requests.head(link, timeout=10, allow_redirects=True, headers=headers)
        
        # If server blocks HEAD requests, fallback to a lightweight streamed GET
        if res.status_code in [403, 405, 401, 301, 302, 999]:
            res = requests.get(link, timeout=10, allow_redirects=True, headers=headers, stream=True)
            res.raw.close()
            
        # Only explicitly flag pure dead pages to ensure 0 False Positives
        if res.status_code == 404 or res.status_code >= 500:
            return link
    except Exception:
        # If the server times out or throws an SSL error due to our rapid 15 thread burst, 
        # silently ignore it so we do not embarrass the salesperson with a False Positive.
        return ""
    return ""

def count_broken_links(html: str, base_url: str) -> list:
    soup = BeautifulSoup(html, "html.parser")
    raw_links = [a.get('href') for a in soup.find_all('a', href=True)]
    
    valid_links = set()
    for link in raw_links:
        link = link.strip()
        if not link or link.startswith(('mailto:', 'tel:', 'javascript:', '#')): 
            continue
        try:
            full_url = urljoin(base_url, link)
            if full_url.startswith('http'):
                valid_links.add(full_url)
        except Exception:
            pass
            
    links_to_test = list(valid_links)[:50]
    broken_list = []
    if links_to_test:
        with concurrent.futures.ThreadPoolExecutor(max_workers=15) as executor:
            results = executor.map(check_single_link, links_to_test)
            for dead_link in results:
                if dead_link: broken_list.append(dead_link)
    return {"broken_list": broken_list, "total": len(links_to_test)}

def extract_tech_stack(html: str, headers: dict) -> str:
    html_lower = html.lower()
    stack = []
    
    if 'wp-content' in html_lower or 'wordpress' in html_lower: stack.append('WordPress')
    if 'elementor' in html_lower: stack.append('Elementor')
    if 'cdn.shopify.com' in html_lower or 'shopify' in html_lower: stack.append('Shopify')
    if 'data-wf-site' in html_lower or 'webflow' in html_lower: stack.append('Webflow')
    if 'squarespace' in html_lower: stack.append('Squarespace')
    if 'wix.com website builder' in html_lower: stack.append('Wix')
    if 'magento' in html_lower: stack.append('Magento')
    if 'drupal' in html_lower: stack.append('Drupal')
    
    if 'id="__next"' in html_lower or '__next_data__' in html_lower or '_next/static' in html_lower: stack.append('Next.js')
    if '__nuxt__' in html_lower or '_nuxt' in html_lower: stack.append('Nuxt.js')
    if 'data-reactroot' in html_lower or 'react' in html_lower or 'react-dom' in html_lower: stack.append('React')
    if 'ng-app' in html_lower or '_ngcontent' in html_lower or 'angular' in html_lower: stack.append('Angular')
    if 'data-v-' in html_lower or 'vue' in html_lower: stack.append('Vue.js')
    if 'svelte' in html_lower: stack.append('Svelte')
    
    if 'bootstrap' in html_lower: stack.append('Bootstrap')
    if 'tailwind' in html_lower: stack.append('Tailwind CSS')
    
    if headers:
        server = headers.get('server', '').lower()
        if 'nginx' in server: stack.append('Nginx')
        if 'apache' in server: stack.append('Apache')
        if 'cloudflare' in server: stack.append('Cloudflare')
        
        powered = headers.get('x-powered-by', '').lower()
        if 'php' in powered: stack.append('PHP')
        if 'express' in powered: stack.append('Express.js')
        if 'next' in powered: stack.append('Next.js')

    # Remove duplicates
    seen = set()
    stack = [x for x in stack if not (x in seen or seen.add(x))]
    
    return ", ".join(stack[:3]) if stack else "Custom HTML / Native"

def check_analytics(html: str) -> dict:
    html_lower = html.lower()
    
    # LinkedIn Detection: icon, profile link, social anchor tag, or tracking script
    linkedin_present = any(x in html_lower for x in [
        "linkedin.com",
        "fa-linkedin",
        "linkedin icon",
        "snap.licdn.com"
    ])
    
    # Facebook Detection: icon, profile link, social anchor tag, Pixel, or fbevents.js
    facebook_present = any(x in html_lower for x in [
        "facebook.com",
        "fb icon",
        "fa-facebook",
        "fbevents.js"
    ])
    
    return {
        "google_analytics": "google-analytics.com" in html_lower or "gtag(" in html_lower,
        "tag_manager": "googletagmanager.com/gtm.js" in html_lower,
        "facebook_pixel": facebook_present,
        "linkedin_tag": linkedin_present,
        "facebook_present": facebook_present,
        "linkedin_present": linkedin_present
    }

def check_lead_capture(soup: BeautifulSoup, html: str = "") -> bool:
    """Check for contact forms, mailto/tel links, chat widgets, and popup/modal forms."""
    forms = soup.find_all("form")
    mailtos = soup.find_all("a", href=lambda href: href and href.startswith("mailto:"))
    tels = soup.find_all("a", href=lambda href: href and ("tel:" in href))
    
    if forms or mailtos or tels:
        return True
    
    # Check for popup/modal form triggers and chat widgets in the raw HTML
    html_lower = html.lower() if html else ""
    popup_signals = [
        "contact-form", "contact_form", "contactform",
        "popup-form", "modal-form", "dialog",
        "start a conversation", "send inquiry", "get in touch",
        "request a quote", "book a demo", "schedule a call",
        "tawk.to", "intercom", "drift", "hubspot", "crisp",
        "livechat", "zendesk", "freshdesk", "tidio",
        "calendly", "typeform",
        "open-modal", "openmodal", "show-modal", "showmodal",
    ]
    if any(signal in html_lower for signal in popup_signals):
        return True
    
    # Check for buttons/links that look like contact triggers
    for btn in soup.find_all(["button", "a"]):
        btn_text = btn.get_text().lower().strip()
        btn_class = " ".join(btn.get("class", [])).lower()
        if any(kw in btn_text for kw in ["contact", "get in touch", "inquiry", "enquiry", "talk to", "reach out", "book a", "schedule"]):
            return True
        if any(kw in btn_class for kw in ["contact", "cta", "inquiry", "modal-trigger"]):
            return True
    
    return False

def check_cta_presence(soup: BeautifulSoup, html: str = "") -> bool:
    """Technical check for the presence of CTA buttons/links on the page."""
    cta_keywords = [
        "get started", "sign up", "start free", "try free", "buy now",
        "learn more", "contact us", "request demo", "book a demo",
        "schedule", "get a quote", "free trial", "download",
        "subscribe", "join", "register", "apply now",
        "send inquiry", "start a conversation", "talk to us",
        "explore", "see pricing", "view plans",
    ]
    
    for el in soup.find_all(["button", "a"]):
        text = el.get_text().lower().strip()
        el_class = " ".join(el.get("class", [])).lower()
        
        # Check text contents for CTA keywords
        if any(kw in text for kw in cta_keywords):
            return True
        # Check class names for CTA-like classes
        if any(kw in el_class for kw in ["cta", "btn-primary", "btn-cta", "hero-btn", "action-btn"]):
            return True
    
    return False

def check_conversion_elements(soup: BeautifulSoup, html: str = "") -> dict:
    """Detailed check for specific conversion elements."""
    html_lower = html.lower() if html else ""
    
    # 1. Contact Form
    has_form = bool(soup.find_all("form"))
    
    # 2. Newsletter
    has_newsletter = check_newsletter(soup)
    
    # 3. Chat/WhatsApp
    chat_signals = ["tawk.to", "intercom", "drift", "hubspot", "crisp", "livechat", "zendesk", "freshdesk", "tidio", "whatsapp", "wa.me"]
    has_chat = any(signal in html_lower for signal in chat_signals)
    
    # 4. Demo/Booking
    booking_keywords = ["book a demo", "schedule a call", "calendly", "book now", "request demo", "demo request", "schedule demo"]
    has_booking = any(kw in html_lower for kw in booking_keywords)
    
    # 5. Sticky CTA
    # Looking for classes that suggest fixed/sticky positioning for buttons or bars
    sticky_signals = ["sticky", "fixed", "floating", "bottom-bar", "top-bar"]
    has_sticky_cta = False
    for el in soup.find_all(["div", "section", "button", "a"]):
        el_class = " ".join(el.get("class", [])).lower()
        if any(signal in el_class for signal in sticky_signals) and ("cta" in el_class or "button" in el_class or "btn" in el_class):
            has_sticky_cta = True
            break
            
    # 6. Popup Lead Capture
    popup_signals = ["modal", "popup", "dialog", "exit-intent", "optinmonster", "poptin", "sumo"]
    has_popup = any(signal in html_lower for signal in popup_signals)
    
    # 7. CTA Presence
    has_cta = check_cta_presence(soup, html)
    
    elements = {
        "cta_presence": has_cta,
        "contact_form": has_form,
        "newsletter_signup": has_newsletter,
        "chat_whatsapp": has_chat,
        "demo_booking": has_booking,
        "sticky_cta": has_sticky_cta,
        "popup_lead_capture": has_popup
    }
    
    return elements

def check_image_alt_tags(soup: BeautifulSoup) -> dict:
    images = soup.find_all("img")
    if not images:
        return {"total": 0, "missing_alt": 0, "percent_missing": 0}
    missing_alt = [img for img in images if not img.get("alt") or img.get("alt").strip() == ""]
    return {
        "total": len(images), 
        "missing_alt": len(missing_alt), 
        "percent_missing": int((len(missing_alt) / len(images)) * 100)
    }

def check_social_links(soup: BeautifulSoup) -> bool:
    social_urls = ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com']
    for a in soup.find_all("a", href=True):
        href = a['href'].lower()
        if any(s in href for s in social_urls):
            # Check for dummy template links
            if href.endswith(('.com', '.com/', '#')) or '/your-page' in href:
                return True
    return False

def website_analyzer_agent(state: AgentState) -> AgentState:
    url = state.get('raw_website', '').strip()
    print(f"--- Lead Magnet Analyzer processing {url} ---")
    
    if url and not url.startswith(('http://', 'https://')):
        url = 'https://' + url

    text_content = ""
    b64_image = ""
    b64_image_mobile = ""
    error_msg = None
    
    # SEO Variables
    seo_ssl = {"valid": False, "days_remaining": 0, "https_enforced": False}
    seo_mobile = False
    seo_meta_desc = False
    seo_h1 = False
    load_time = 0.0
    lighthouse_seo = 0
    lighthouse_performance = 0
    lighthouse_accessibility = 0
    mobile_performance = 0
    tech_stack = "Unknown"
    last_modified = "Unknown"
    aeo_probe = {"aeo_recognized": False, "aeo_confidence": "low", "aeo_raw_response": ""}
    analytics_data = {"google_analytics": False, "tag_manager": False, "facebook_pixel": False, "linkedin_tag": False}
    has_lead_capture = False
    has_cta = False
    has_newsletter = False
    image_alt_data = {"total": 0, "missing_alt": 0, "percent_missing": 0}
    has_dead_socials = False
    conversion_elements = {
        "cta_presence": False,
        "contact_form": False,
        "newsletter_signup": False,
        "chat_whatsapp": False,
        "demo_booking": False,
        "sticky_cta": False,
        "popup_lead_capture": False
    }
    
    if url:
        company_name = state.get('raw_company', '') or url

        # ─── INDEPENDENT ASYNC I/O (runs regardless of browser success) ───────
        executor = concurrent.futures.ThreadPoolExecutor(max_workers=3)
        lighthouse_future = executor.submit(get_google_pagespeed, url)
        aeo_future = executor.submit(verify_aeo_visibility, company_name, url)
        ssl_future = executor.submit(check_ssl_certificate, url)

        # ─── PLAYWRIGHT BROWSER SCRAPE (may fail on Cloudflare sites) ─────────
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.set_extra_http_headers({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
                
                response = page.goto(url, wait_until="domcontentloaded", timeout=20000)
                html = page.content()
                headers = response.headers if response else {}
                tech_stack = extract_tech_stack(html, headers)
                last_modified = extract_last_modified(headers, html)
                link_data = count_broken_links(html, url)
                broken_links = link_data["broken_list"]
                total_links = link_data["total"]
                
                analytics_data = check_analytics(html)
                
                soup = BeautifulSoup(html, "html.parser")
                has_lead_capture = check_lead_capture(soup, html)
                has_cta = check_cta_presence(soup, html)
                has_newsletter = check_newsletter(soup)
                image_alt_data = check_image_alt_tags(soup)
                has_dead_socials = check_social_links(soup)
                conversion_elements = check_conversion_elements(soup, html)
                
                # Extract SEO Metrics before stripping code
                seo_mobile = bool(soup.find("meta", attrs={"name": "viewport"}))
                seo_meta_desc = bool(soup.find("meta", attrs={"name": "description"}))
                seo_h1 = bool(soup.find("h1"))
                seo_title = bool(soup.find("title"))
                seo_canonical = bool(soup.find("link", attrs={"rel": "canonical"}))
                seo_og = bool(soup.find("meta", attrs={"property": "og:title"}))
                
                # Check for duplicate meta tags
                has_duplicate_meta = len(soup.find_all("title")) > 1 or len(soup.find_all("meta", attrs={"name": "description"})) > 1
                
                # Clean for LLM
                for script in soup(["script", "style", "nav", "footer"]):
                    script.extract()
                text_content = soup.get_text(separator=' ', strip=True)
                
                # Full-page desktop screenshot
                screenshot_bytes = page.screenshot(type="jpeg", quality=60, full_page=True)
                b64_image = base64.b64encode(screenshot_bytes).decode('utf-8')
                
                # Mobile emulation screenshot
                page.set_viewport_size({"width": 375, "height": 812})
                time.sleep(1)
                mobile_screenshot_bytes = page.screenshot(type="jpeg", quality=60, full_page=True)
                b64_image_mobile = base64.b64encode(mobile_screenshot_bytes).decode('utf-8')
                
                browser.close()
                text_content = f"--- RAW TEXT CONTENT ---\n{text_content}"
        except Exception as e:
            print(f"Browser scrape failed for {url}: {e}")
            error_msg = str(e)
            # Fallback: attempt plain HTTP scrape to get at least HTML meta data
            try:
                fallback_res = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
                html = fallback_res.text
                headers = dict(fallback_res.headers)
                tech_stack = extract_tech_stack(html, headers)
                last_modified = extract_last_modified(headers, html)
                analytics_data = check_analytics(html)
                soup = BeautifulSoup(html, "html.parser")
                has_lead_capture = check_lead_capture(soup, html)
                has_cta = check_cta_presence(soup, html)
                has_newsletter = check_newsletter(soup)
                image_alt_data = check_image_alt_tags(soup)
                has_dead_socials = check_social_links(soup)
                conversion_elements = check_conversion_elements(soup, html)
                seo_mobile = bool(soup.find("meta", attrs={"name": "viewport"}))
                seo_meta_desc = bool(soup.find("meta", attrs={"name": "description"}))
                seo_h1 = bool(soup.find("h1"))
                seo_title = bool(soup.find("title"))
                seo_canonical = bool(soup.find("link", attrs={"rel": "canonical"}))
                seo_og = bool(soup.find("meta", attrs={"property": "og:title"}))
                has_duplicate_meta = len(soup.find_all("title")) > 1 or len(soup.find_all("meta", attrs={"name": "description"})) > 1
                for script in soup(["script", "style", "nav", "footer"]):
                    script.extract()
                text_content = f"--- RAW TEXT CONTENT (HTTP fallback) ---\n{soup.get_text(separator=' ', strip=True)}"
                print(f"HTTP fallback scrape succeeded for {url}")
            except Exception as e2:
                print(f"HTTP fallback also failed for {url}: {e2}")

        # ─── COLLECT INDEPENDENT API RESULTS (with safety) ───────────────────
        try:
            pagespeed_data = lighthouse_future.result(timeout=70)
        except Exception as e:
            print(f"Lighthouse Future Error: {e}")
            pagespeed_data = {"speed": 0.0, "lighthouse_seo": 0, "lighthouse_performance": 0, "lighthouse_accessibility": 0, "mobile_performance": 0, "issues": {}, "api_success": False}
            
        try:
            aeo_probe = aeo_future.result(timeout=30)
        except Exception as e:
            print(f"AEO Future Error: {e}")
            aeo_probe = {"aeo_recognized": False, "aeo_confidence": "low", "aeo_raw_response": "AI Probe failed."}
            
        try:
            seo_ssl = ssl_future.result(timeout=10)
        except Exception as e:
            print(f"SSL Future Error: {e}")
            seo_ssl = {"valid": False, "days_remaining": 0, "https_enforced": False}
            
        executor.shutdown(wait=False)

        load_time = pagespeed_data["speed"]
        lighthouse_seo = pagespeed_data["lighthouse_seo"]
        lighthouse_performance = pagespeed_data["lighthouse_performance"]
        lighthouse_accessibility = pagespeed_data["lighthouse_accessibility"]
        mobile_performance = pagespeed_data["mobile_performance"]
        if load_time == 0.0:
            try:
                fast_res = requests.get(url, timeout=10)
                load_time = round(fast_res.elapsed.total_seconds(), 2)
            except Exception:
                load_time = 2.5
    else:
        error_msg = "No URL provided."


    llm = ChatGoogleGenerativeAI(
        model="gemini-3.1-flash-lite-preview", 
        temperature=0,
        api_key=os.environ.get("GEMINI_API_KEY")
    )
    structured_llm = llm.with_structured_output(WebsiteAnalyzerOutput)

    # Estimate SEO if Lighthouse failed
    estimated_seo = lighthouse_seo
    if estimated_seo == 0:
        base_seo = 40
        if seo_mobile: base_seo += 15
        if seo_meta_desc: base_seo += 10
        if seo_h1: base_seo += 10
        if isinstance(seo_ssl, dict) and seo_ssl.get("valid"): base_seo += 15
        if load_time < 3.0: base_seo += 10
        estimated_seo = min(100, base_seo)

    # Only skip LLM entirely if we have NO data at all (no screenshot AND no text)
    if error_msg and not text_content:
        result_dict = {
            "design": "Unknown",
            "cta": "Unknown",
            "message": "Unknown",
            "trust": "Unknown",
            "speed": "Unknown",
            "score": 10,
            "rebranding_pitch": "Your website is currently unreachable. If customers can't load your site, they're bouncing to your competitors before they even see your brand.",
            "seo_score": estimated_seo,
            "seo_status": "Your current technical setup is bleeding organic traffic. Core vitals need optimization.",
            "seo_improvement": "Improve page load speed, fix mobile responsiveness, and enforce structured meta tags.",
            "aeo_score": 50 if aeo_probe.get("aeo_recognized") else 0,
            "aeo_status": "AI models recognize your brand, but your lack of structured data makes you a 'secondary' recommendation." if aeo_probe.get("aeo_recognized") else "Your brand is currently invisible to major AI engines like ChatGPT and Gemini.",
            "aeo_improvement": "Implement advanced Schema.org markup to turn your text-based content into machine-readable data points for LLMs." if aeo_probe.get("aeo_recognized") else "Launch a digital PR campaign to establish AI visibility.",
            "first_impression_score": 3,
            "first_impression_verdict": "Poor",
            "first_impression_explanation": "Website is unreachable — visitors see nothing, killing trust instantly.",
            "missing_leads_insight": "Critical: Website is unreachable, preventing any lead generation or conversion.",
            "conversion_readiness_level": "Low"
        }
    else:
        # Adjust system message based on whether we have screenshots or only text
        has_screenshots = bool(b64_image)
        
        if has_screenshots:
            visual_instruction = """Analyze the provided full-page website screenshot and text content to infer:
- Design quality (Modern, Outdated, Clean, Cluttered)
- CTA presence (Strong, Weak, Missing - based on visual prominence across the whole page)
- Messaging Clarity (Clear, Confusing, Jargon-heavy)
- Trust Signals (Strong, Weak, Missing - meticulously scan the entire page image and text specifically for Client Reviews, Testimonials, Case Studies, partner logos, or awards!)
- Mobile vs Desktop UI (Observe both provided images. Does the mobile view appear broken or fundamentally unoptimized compared to the desktop view?)"""
        else:
            visual_instruction = """Analyze the provided text content and technical metrics to infer:
- Design quality (Modern, Outdated, Clean, Cluttered) - infer from the tech stack, text structure, and meta tags
- CTA presence (Strong, Weak, Missing - infer from the text content for call-to-action phrases)
- Messaging Clarity (Clear, Confusing, Jargon-heavy)
- Trust Signals (Strong, Weak, Missing - scan the text specifically for Client Reviews, Testimonials, Case Studies, partner mentions, or awards!)"""

        system_msg = SystemMessage(content=f"""You are an elite Digital Marketing agency owner auditing a prospect's website to sell them a WEBSITE REDEVELOPMENT + SEO OPTIMIZATION project.

Tasks:
{visual_instruction}

Then, based on the VERIFIED Google Lighthouse data provided below, generate comprehensive Search Visibility metrics:
1. rebranding_pitch: Write 2-3 aggressive sentences. Reference SPECIFIC Lighthouse scores (Performance, Accessibility, Mobile) to expose how their website is technically failing. Tie each flaw to lost revenue. Example: 'Your site scores 38/100 on Google Performance and 45/100 on Mobile — meaning over half your visitors abandon before your page even loads. A modern, optimized redesign would immediately recover this lost traffic.'
2. seo_score (0-100), seo_status, seo_improvement: If a Google Lighthouse SEO score is provided, use it as the base (adjust slightly based on speed/meta/H1 findings). If Lighthouse score is 0 (API unavailable), calculate from the technical metrics. If speed is >4s, score MUST be low.
3. aeo_score (0-100), aeo_status, aeo_improvement: Base the AEO score STRICTLY on the LIVE AEO PROBE RESULTS provided. If AI Recognition is False, the score MUST be below 25. If True with low confidence, score 25-50. If True with high confidence, score 50-80+. Use the raw AI response to craft specific, actionable improvement advice.

Finally, compute the Internal Lead Score (0-10) where a HIGHER score means a WORSE website (making them a HOTTER lead for our agency to pitch). Factor in ALL Lighthouse scores — low Performance, Accessibility, or Mobile scores should push the lead score higher.

Additionally, generate a 'First Impression Score' (0-10) from the perspective of a first-time visitor.
Analyze:
- Branding (Modern vs Outdated)
- Layout (Professional vs Cluttered)
- CTA Clarity (Obvious vs Hidden)
- Professionalism (Trustworthy vs Amateur)
- Trust Indicators (Reviews/Logos/Social proof)
- Readability (Contrast/Font size)
- Mobile Feel (Fluid vs Broken)

Assign a verdict: Excellent (9-10), Good (7-8), Average (5-6), Poor (0-4).
Provide a short, concise, and emotionally impactful AI explanation (e.g., "Website feels outdated and lacks strong trust signals.").

Also provide a `conversion_readiness_level` (High, Medium, Low) based on the conversion elements present.

Finally, provide an `industry_insight`: compare this website to top industry performers. 1-sentence aggressive insight into why they are winning or losing compared to the top 10% of competitors.
""")

        human_msg_content = [
            {
                "type": "text", 
                "text": f"""Evaluate website: {url}
                
                TECHNICAL SEO AUDIT (Extracted via BeautifulSoup):
                - Page Load Speed: {load_time}s (Industry standard is <2.5s)
                - Mobile Viewport Found: {seo_mobile}
                - Meta Description Found: {seo_meta_desc}
                - Primary H1 Tag Found: {seo_h1}
                - Secure SSL Active: {seo_ssl}
                - Google Lighthouse SEO Score: {lighthouse_seo}/100 {'(Official)' if lighthouse_seo > 0 else '(API unavailable - calculate from metrics above)'}
                - Google Lighthouse Performance Score: {lighthouse_performance}/100 {'(Official)' if lighthouse_performance > 0 else '(API unavailable)'}
                - Google Lighthouse Accessibility Score: {lighthouse_accessibility}/100 {'(Official)' if lighthouse_accessibility > 0 else '(API unavailable)'}
                - Google Mobile Performance Score: {mobile_performance}/100 {'(Official)' if mobile_performance > 0 else '(API unavailable)'}
                - Analytics/Tracking Installed: {any(analytics_data.values())}
                - Visible Lead Capture (Forms/Phone/Email): {has_lead_capture}
                - Dead/Template Social Links Found: {has_dead_socials}
                - Images Missing Alt Text: {image_alt_data['percent_missing']}% ({image_alt_data['missing_alt']}/{image_alt_data['total']} images)
                
                CONVERSION ELEMENTS PRESENT:
                - CTA Buttons: {conversion_elements['cta_presence']}
                - Contact Form: {conversion_elements['contact_form']}
                - Newsletter: {conversion_elements['newsletter_signup']}
                - Chat/WhatsApp Widget: {conversion_elements['chat_whatsapp']}
                - Demo/Booking Buttons: {conversion_elements['demo_booking']}
                - Sticky CTA: {conversion_elements['sticky_cta']}
                - Popup Lead Capture: {conversion_elements['popup_lead_capture']}
                
                LIVE AEO PROBE RESULTS (Verified by asking Gemini about this brand):
                - AI Recognition: {aeo_probe['aeo_recognized']}
                - AI Confidence Level: {aeo_probe['aeo_confidence']}
                - Raw AI Response: \"{aeo_probe['aeo_raw_response'][:500]}\"
                
                VISIBLE TEXT (Top 8000 chars):
                {text_content[:8000]}"""
            }
        ]
        
        # Attach screenshots only if available
        if b64_image:
            human_msg_content.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64_image}"}})
        if b64_image_mobile:
            human_msg_content.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64_image_mobile}"}})
            
        human_msg = HumanMessage(content=human_msg_content)

        try:
            result = structured_llm.invoke([system_msg, human_msg])
            
            speed_cat = "Fast" if load_time < 2.5 else "Ok" if load_time < 5.0 else "Slow"
            
            result_dict = {
                "design": result.design,
                "cta": result.cta,
                "message": result.message,
                "trust": result.trust,
                "speed": speed_cat,
                "score": result.score,
                "rebranding_pitch": result.rebranding_pitch,
                "seo_score": result.seo_score,
                "seo_status": result.seo_status,
                "seo_improvement": result.seo_improvement,
                "aeo_score": result.aeo_score,
                "aeo_status": result.aeo_status,
                "aeo_improvement": result.aeo_improvement,
                "first_impression_score": result.first_impression_score,
                "first_impression_verdict": result.first_impression_verdict,
                "first_impression_explanation": result.first_impression_explanation,
                "conversion_readiness_level": result.conversion_readiness_level,
                "missing_leads_insight": result.missing_leads_insight,
                "industry_insight": result.industry_insight
            }
        except Exception as e:
            print("LLM Error:", e)
            result_dict = {
                "design": "Unknown", "cta": "Unknown", "message": "Unknown", "trust": "Unknown",
                "speed": "Unknown", "score": 10,
                "rebranding_pitch": "Analysis partially failed, but your website's technical foundation needs urgent optimization to capture high-intent traffic.",
                "seo_score": estimated_seo, 
                "seo_status": "Your current technical setup is bleeding organic traffic. Core vitals need optimization.", 
                "seo_improvement": "Improve page load speed, fix mobile responsiveness, and enforce structured meta tags.",
                "aeo_score": 50 if aeo_probe.get("aeo_recognized") else 0, 
                "aeo_status": "AI models recognize your brand, but your lack of structured data makes you a 'secondary' recommendation." if aeo_probe.get("aeo_recognized") else "Your brand is currently invisible to major AI engines like ChatGPT and Gemini.", 
                "aeo_improvement": "Implement advanced Schema.org markup to turn your text-based content into machine-readable data points for LLMs." if aeo_probe.get("aeo_recognized") else "Launch a digital PR campaign to establish AI visibility.",
                "first_impression_score": 5,
                "first_impression_verdict": "Average",
                "first_impression_explanation": "Analysis partially failed — initial signals suggest the site lacks polish and professional trust cues.",
                "conversion_readiness_level": "Low",
                "missing_leads_insight": "Analysis failed to extract specific conversion gaps.",
                "industry_insight": "Compared to industry leaders, this site lacks the technical infrastructure required for high-level competition."
            }

    # Format the payload directly for the React frontend Lead Magnet report
    output_row = {
        "website": url if url else state.get("raw_website", ""),
        "final_score": result_dict.get("score", 0),
        "design": result_dict.get("design", ""),
        "cta": result_dict.get("cta", ""),
        "message": result_dict.get("message", ""),
        "trust": result_dict.get("trust", ""),
        "speed": result_dict.get("speed", ""),
        "seo_meta_desc": seo_meta_desc,
        "seo_h1": seo_h1,
        "seo_title": locals().get('seo_title', False),
        "seo_canonical": locals().get('seo_canonical', False),
        "seo_og": locals().get('seo_og', False),
        "seo_mobile": seo_mobile,
        "seo_ssl": seo_ssl.get("valid", False) if isinstance(seo_ssl, dict) else False,
        "ssl_days_remaining": seo_ssl.get("days_remaining", 0) if isinstance(seo_ssl, dict) else 0,
        "ssl_enforced": seo_ssl.get("https_enforced", False) if isinstance(seo_ssl, dict) else False,
        "load_time": str(load_time),
        "lighthouse_seo": lighthouse_seo,
        "lighthouse_performance": lighthouse_performance,
        "lighthouse_accessibility": lighthouse_accessibility,
        "mobile_performance": mobile_performance,
        "lighthouse_issues": locals().get("pagespeed_data", {}).get("issues", {}),
        "lighthouse_api_success": locals().get("pagespeed_data", {}).get("api_success", False),
        "tech_stack": tech_stack,
        "last_modified": last_modified,
        "broken_links": locals().get('broken_links', []),
        "total_links": locals().get('total_links', 0),
        "has_analytics": locals().get('analytics_data', {}),
        "has_lead_capture": locals().get('has_lead_capture', False),
        "has_newsletter": locals().get('has_newsletter', False),
        "image_percent_missing_alt": locals().get('image_alt_data', {}).get('percent_missing', 0),
        "has_dead_socials": locals().get('has_dead_socials', False),
        "rebranding_pitch": result_dict.get("rebranding_pitch", ""),
        "first_impression_score": result_dict.get("first_impression_score", 0),
        "first_impression_verdict": result_dict.get("first_impression_verdict", "Unknown"),
        "first_impression_explanation": result_dict.get("first_impression_explanation", ""),
        "seo_score": result_dict.get("seo_score", 0),
        "seo_status": result_dict.get("seo_status", ""),
        "seo_improvement": result_dict.get("seo_improvement", ""),
        "aeo_score": result_dict.get("aeo_score", 0),
        "aeo_status": result_dict.get("aeo_status", ""),
        "aeo_improvement": result_dict.get("aeo_improvement", ""),
        "aeo_probe_response": aeo_probe.get("aeo_raw_response", ""),
        "has_cta": has_cta,
        "has_duplicate_meta": locals().get('has_duplicate_meta', False)
    }

    # ─── REVENUE LEAK CALCULATION ──────────────────────────────────────────
    leak_metrics = {
        "load_time": load_time,
        "seo_score": output_row.get("seo_score", 0),
        "has_lead_capture": has_lead_capture,
        "has_cta": has_cta,
        "has_newsletter": has_newsletter,
        "seo_ssl": output_row.get("seo_ssl", False),
        "trust": output_row.get("trust", "")
    }
    rev_leak = calculate_revenue_leak(leak_metrics)
    
    output_row["revenue_leak_amount"] = rev_leak["amount"]
    output_row["revenue_leak_severity"] = rev_leak["severity"]
    output_row["revenue_leak_explanation"] = rev_leak["explanation"]
    output_row["visitors_lost"] = rev_leak["visitors_lost"]
    output_row["leads_lost"] = rev_leak["leads_lost"]

    # --- MISSING LEADS METRICS ---
    missing_metrics = calculate_missing_leads_metrics(conversion_elements)
    output_row["missing_opportunities_count"] = missing_metrics["missing_count"]
    output_row["missing_opportunities_list"] = missing_metrics["missing_items"]
    output_row["estimated_conversion_loss_percent"] = missing_metrics["conversion_loss_percent"]
    output_row["conversion_readiness_level"] = result_dict.get("conversion_readiness_level", "Low")
    output_row["missing_leads_insight"] = result_dict.get("missing_leads_insight", "")
    output_row["industry_insight"] = result_dict.get("industry_insight", "")
    output_row["conversion_elements"] = conversion_elements

    # --- INDUSTRY PERCENTILE RANK ---
    industry_metrics = {
        "seo_score": output_row.get("seo_score", 0),
        "performance_score": lighthouse_performance,
        "trust": output_row.get("trust", ""),
        "design": output_row.get("design", ""),
        "message": output_row.get("message", ""),
        "seo_mobile": seo_mobile,
        "cta": output_row.get("cta", ""),
        "readiness_level": output_row.get("conversion_readiness_level", "Low")
    }
    industry_rank = calculate_industry_percentile(industry_metrics)
    output_row["industry_percentile"] = industry_rank["percentile"]
    output_row["industry_tier"] = industry_rank["tier"]
    output_row["industry_competitiveness"] = industry_rank["competitiveness"]

    return {"output_row": output_row}
