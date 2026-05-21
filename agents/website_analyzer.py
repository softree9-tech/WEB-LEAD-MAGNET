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
from core.security import is_safe_url
import socket
import ssl
from datetime import datetime
import json

def check_ssl_certificate(url: str) -> dict:
    if not is_safe_url(url):
        return {"valid": False, "days_remaining": 0, "https_enforced": False}
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
    annual_loss = amount * 12
    visitors_lost = int(base_monthly_visitors * (leak_percent * 0.6)) # Traffic is only part of the leak
    leads_lost = int((base_monthly_visitors * base_conversion_rate) * leak_percent)

    severity = "Low"
    if amount > 4000: severity = "Critical"
    elif amount > 2500: severity = "High"
    elif amount > 1000: severity = "Moderate"

    urgency = "Immediate" if severity in ["Critical", "High"] else "30-60 Days" if severity == "Moderate" else "90+ Days"

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
        "annual_loss": annual_loss,
        "severity": severity,
        "urgency": urgency,
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

def check_schema_markup(soup: BeautifulSoup) -> dict:
    """Detects JSON-LD schema types in the page."""
    schema_tags = soup.find_all("script", type="application/ld+json")
    detected_types = set()
    
    target_schemas = [
        "FAQPage",
        "LocalBusiness",
        "Review",
        "Organization",
        "Product",
        "BreadcrumbList",
        "Article"
    ]
    
    for tag in schema_tags:
        try:
            data = json.loads(tag.string)
            
            def extract_types(obj):
                if isinstance(obj, dict):
                    t = obj.get("@type")
                    if t:
                        if isinstance(t, list):
                            detected_types.update(t)
                        else:
                            detected_types.add(t)
                    for val in obj.values():
                        extract_types(val)
                elif isinstance(obj, list):
                    for item in obj:
                        extract_types(item)
            
            extract_types(data)
        except Exception:
            continue
            
    results = {}
    for s in target_schemas:
        is_present = any(s.lower() in dt.lower() for dt in detected_types)
        results[s] = is_present
        
    return results

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
    if not is_safe_url(url):
        return {}
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
    if not is_safe_url(url):
        return {"aeo_recognized": False, "aeo_confidence": "low", "aeo_raw_response": "Unsafe URL"}
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
    if not is_safe_url(link):
        return ""
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

    if not is_safe_url(url):
        print(f"--- Unsafe URL blocked: {url} ---")
        return {"output_row": {"error": "Invalid or unsafe website URL", "website": url}}

    text_content = ""
    b64_image = ""
    b64_image_mobile = ""
    captured_screenshots = []
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
    schema_data = {
        "FAQPage": False,
        "LocalBusiness": False,
        "Review": False,
        "Organization": False,
        "Product": False,
        "BreadcrumbList": False,
        "Article": False
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
                schema_data = check_schema_markup(soup)
                
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
                
                # Mobile emulation screenshot (Small Android)
                page.set_viewport_size({"width": 360, "height": 640})
                time.sleep(1)
                mobile_screenshot_bytes = page.screenshot(type="jpeg", quality=60, full_page=False)
                b64_image_mobile = base64.b64encode(mobile_screenshot_bytes).decode('utf-8')

                # Section-by-section mobile walkthrough screenshot capture
                captured_screenshots = []
                try:
                    sections_js = """() => {
                        const els = Array.from(document.querySelectorAll('header, footer, section, [role="main"] > div, body > div'));
                        const results = [];
                        const processed = new Set();
                        
                        const isVisible = (el) => {
                            const style = window.getComputedStyle(el);
                            return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && el.getBoundingClientRect().height > 50;
                        };
                        
                        for (const el of els) {
                            if (!isVisible(el)) continue;
                            
                            let hasParentProcessed = false;
                            for (const p of processed) {
                                if (p.contains(el)) {
                                    hasParentProcessed = true;
                                    break;
                                }
                            }
                            if (hasParentProcessed) continue;
                            
                            const rect = el.getBoundingClientRect();
                            const y = rect.top + window.scrollY;
                            const height = rect.height;
                            const text = el.innerText.trim().replace(/\\s+/g, ' ');
                            
                            results.push({
                                tagName: el.tagName.toLowerCase(),
                                id: el.id || '',
                                className: el.className || '',
                                text: text.substring(0, 400),
                                y: y,
                                height: height
                            });
                            processed.add(el);
                        }
                        
                        results.sort((a, b) => a.y - b.y);
                        
                        if (results.length < 3) {
                            const totalHeight = document.documentElement.scrollHeight;
                            const viewportHeight = 640;
                            const slices = [];
                            for (let y = 0; y < totalHeight; y += viewportHeight) {
                                slices.push({
                                    tagName: 'div',
                                    id: `slice-${y}`,
                                    className: '',
                                    text: `Scroll position ${y}px`,
                                    y: y,
                                    height: Math.min(viewportHeight, totalHeight - y)
                                });
                            }
                            return slices;
                        }
                        
                        return results;
                    }"""
                    sections = page.evaluate(sections_js)
                    sections = sections[:10]  # Limit to 10 sections max
                    
                    for idx, sec in enumerate(sections):
                        page.evaluate(f"window.scrollTo(0, {sec['y']})")
                        time.sleep(0.3)
                        sec_screenshot = page.screenshot(type="jpeg", quality=45, full_page=False)
                        b64_sec = base64.b64encode(sec_screenshot).decode('utf-8')
                        captured_screenshots.append({
                            "index": idx,
                            "tagName": sec["tagName"],
                            "text": sec["text"],
                            "b64_image": b64_sec
                        })
                except Exception as ex:
                    print("Error capturing mobile sections:", ex)

                if not captured_screenshots:
                    captured_screenshots.append({
                        "index": 0,
                        "tagName": "div",
                        "text": "Mobile Home Screen",
                        "b64_image": b64_image_mobile
                    })
                
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
                schema_data = check_schema_markup(soup)
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
            "executive_summary": "Website is offline or blocking access, presenting a critical brand risk.",
            "business_risk_insight": "Total loss of online presence and credibility.",
            "strategic_opportunity_insight": "Immediate restoration and technical hardening required.",
            "executive_ai_recommendation": "Investigate hosting or DNS configuration immediately.",
            "brand_credibility_insight": "Brand reputation is actively being damaged by downtime.",
            "missing_leads_insight": "Critical: Website is unreachable, preventing any lead generation or conversion.",
            "conversion_readiness_level": "Low",
            "mobile_sections": [
                {
                    "name": "Hero Section",
                    "insight": "Website is unreachable. Mobile viewport hero section could not be analyzed.",
                    "risk": "Critical",
                    "b64_image": ""
                },
                {
                    "name": "Conversion CTA",
                    "insight": "No active mobile forms or buttons could be evaluated.",
                    "risk": "Critical",
                    "b64_image": ""
                }
            ]
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

Additionally, generate an EXECUTIVE PRESENCE INTELLIGENCE assessment. Provide:
- `executive_summary`: A concise AI summary (e.g. “The website creates a credible first impression, but conversion infrastructure and AI-search optimization remain below industry-leading standards.”) based on SEO, UX, trust signals, AI visibility, conversion readiness, competitor intelligence, mobile experience, and schema analysis.
- `business_risk_insight`: The biggest business risk insight.
- `strategic_opportunity_insight`: The top opportunity area insight.
- `executive_ai_recommendation`: A strategic AI recommendation.
- `brand_credibility_insight`: An insight into the brand's credibility based on trust signals.

Also provide a `conversion_readiness_level` (High, Medium, Low) based on the conversion elements present.

Finally, provide an `industry_insight`: compare this website to top industry performers. 1-sentence aggressive insight into why they are winning or losing compared to the top 10% of competitors.

Finally, analyze the `SCHEMA MARKUP` situation. Based on the detected schemas provided:
- Calculate a `schema_coverage_score` (0-100) based on the presence of FAQ, LocalBusiness, Review, Organization, Product, Breadcrumb, and Article schemas.
- Provide a `schema_gap_insight`: Explain how missing schemas (like FAQ or Review) are hurting their AI visibility (ChatGPT recommendations) and Google Rich Results.
- Set a `schema_visibility_impact` (High, Medium, Low).
- Provide a `schema_recommendation` for implementation priority.

Finally, analyze the `KEYWORD VISIBILITY GAP`:
- Identify 3-5 `keyword_visibility_gap_opportunities`: high-value missing keyword opportunities the website is missing compared to industry expectations.
- Set a `keyword_visibility_gap_level` (High, Medium, Low) based on the missed potential.
- Provide a `keyword_visibility_gap_competitor_advantage`: 1-sentence summary of what competitors are ranking for that this site is not.
- Set a `keyword_visibility_gap_search_impact` (High, Medium, Low) on AI/Search visibility.
- Provide a `keyword_visibility_gap_insight`: Short, aggressive AI insight on search intent coverage and visibility gaps.

Finally, analyze the `MOBILE EXPERIENCE REALITY CHECK`:
- Based on the provided mobile screenshot (360x640), evaluate how the site actually looks on a low-end device.
- Assign a `mobile_ux_rating` (Excellent, Good, Average, Poor, Critical).
- Assess the `mobile_conversion_risk` (Low, Moderate, High, Critical) based on CTA visibility and readability on mobile.
- Provide a `mobile_ai_insight`: A short, punchy AI recommendation to fix mobile conversion leaks (e.g., "Primary CTA is difficult to notice on smaller mobile devices, reducing conversion potential.").
- Generate a list of `mobile_sections` that correspond EXACTLY in order to the sections listed under 'MOBILE WEBSITE SECTIONS TO AUDIT SEQUENTIALLY'.
- For each section, provide a descriptive `name` (e.g. 'Hero Section', 'Services Section'), a critique `insight` (1-2 sentences, professional, specific to what content or risk is in that section), and a `risk` level (Low, Moderate, High, Critical).

Finally, analyze the `COMPETITOR MOMENTUM TRACKER`:
- Compare this website's current state (SEO, UX, AI visibility, trust signals, schema, lead capture, content freshness, conversion readiness) against rapid industry changes.
- Generate a `momentum_score` (0-100) based on how quickly they appear to be adopting modern search and conversion standards.
- Determine `competitive_growth_status` (Leading, Steady, Falling Behind).
- Assess `strategic_risk_level` (High, Moderate, Low).
- Write a `momentum_comparison`: 1-2 aggressive sentences comparing their momentum to competitors who are "rapidly improving AI visibility and conversion infrastructure."
- Set `momentum_growth_direction` (Up, Down, Neutral).
- Provide a `momentum_ai_insight`: A high-level AI strategic insight on how they are being outpaced or if they are keeping up with industry technology adoption.

- Example action: "Add FAQ schema and move primary CTA above the fold to improve AI discoverability and lead conversion."

Finally, analyze the REVENUE IMPACT FORECAST:
- Generate a `revenue_impact_insight`: A high-level, executive AI insight about the long-term business impact of current technical and conversion leaks. Focus on how continued delays in optimization may significantly reduce long-term conversion performance and AI visibility competitiveness.
- Determine `annual_opportunity_loss`: Based on the technical metrics and current leaks, estimate the total lost business opportunity over the next 12 months.
- Set `urgency_severity`: (Immediate, 30-60 Days, 90+ Days) based on the severity of current revenue leaks.

Finally, analyze the CONVERSION OPPORTUNITY INTELLIGENCE:
- Combine missing lead capture analysis with AI-driven conversion optimization recommendations.
- Provide:
  - `cta_optimization_recommendation`: Concise AI recommendation for CTA optimization based on above-the-fold placement and clarity.
  - `conversion_improvement_suggestion`: Concise AI suggestion for overall conversion improvement across the site.
  - `funnel_optimization_insight`: Concise AI insight on funnel optimization and path-to-purchase.
  - `mobile_conversion_recommendation`: Concise AI recommendation specifically for mobile-specific conversion improvements.
  - `lead_gen_improvement_opportunity`: Concise AI insight on lead generation improvement opportunities like forms, chat, or trust signals.
  - `conversion_intelligence_insight`: A strategic, premium, executive-level conversion intelligence insight combining all analysis data (CTA, forms, mobile, trust, AI visibility).
969:   - `cta_strength_level`: (High, Moderate, Low) Overall CTA wording strength.
970:   - `cta_urgency_score`: (0-10) How much urgency does the CTA create?
971:   - `cta_visibility_rating`: (High, Moderate, Low) How visible is the primary CTA?
972:   - `cta_placement_quality`: (Strategic, Suboptimal, Poor) Quality of CTA placement.
973:   - `cta_action_clarity_score`: (0-10) How clear is the action required?
974:   - `cta_persuasiveness_score`: (0-10) How persuasive is the CTA language?
975:   - `cta_effectiveness_insight`: Concise AI conversion effectiveness insight. Example: "The CTA is visible but lacks urgency and persuasive language, reducing conversion motivation."
976:   - `cta_ai_optimization_recommendation`: Concise AI optimization recommendation for CTA.
Finally, analyze the CONTENT & MESSAGING CLARITY:
- Evaluate the website's messaging across:
  - `headline_clarity_score`: (0-10) How clear and impactful is the primary headline?
  - `value_prop_strength_score`: (0-10) How strong and unique is the value proposition?
  - `cta_communication_quality_score`: (0-10) How well does the CTA communicate the next step?
  - `messaging_confidence_score`: (0-10) Does the messaging sound authoritative and confident?
  - `audience_targeting_clarity_score`: (0-10) Is it clear WHO the service is for?
  - `brand_communication_effectiveness_score`: (0-10) Overall effectiveness of brand communication.
- Provide:
  - `messaging_clarity_level`: (High, Moderate, Low) Overall level of messaging clarity.
  - `communication_effectiveness_insight`: Concise executive-level AI insight on brand communication effectiveness.
  - `value_proposition_analysis`: Concise AI analysis of the value proposition strength and clarity.
  - `messaging_strategic_recommendation`: Strategic AI recommendation for messaging and content clarity.
  - Example: “The website appears visually professional, but the messaging lacks a strong value proposition and does not clearly communicate why customers should choose this business.”

Finally, analyze the MARKET POSITION INTELLIGENCE:
- Combine industry competitiveness analysis with AI-powered lead quality, business potential, and commercial readiness scoring.
- Detect whether the website is primarily: informational, branding-focused, service-oriented, conversion-focused, or enterprise-sales focused.
- Generate:
  - `lead_quality_score`: (0-100) based on overall website quality, business maturity, and sales opportunity.
  - `business_maturity_level`: (Early Stage, Growth Phase, Established, Market Leader).
  - `sales_potential`: (High, Moderate, Low).
  - `digital_readiness`: (High, Moderate, Low) based on tech stack, analytics, and optimization.
  - `growth_potential`: (High, Moderate, Low).
  - `market_position_intelligence_insight`: A concise, executive AI strategic insight (e.g., “The business demonstrates above-average market competitiveness and strong digital maturity, making it a high-potential sales opportunity.”)
  - `buyer_intent_strength`: (Low, Moderate, High, Advanced) based on transactional and conversion-focused signals.
  - `transactional_service_intent_score`: (0-100) How well does the site drive direct sales/service inquiries?
  - `enterprise_sales_orientation_score`: (0-100) Does the site target high-value B2B/Enterprise clients?
  - `lead_generation_focus_score`: (0-100) How prominent are lead capture mechanisms?
  - `conversion_oriented_positioning_score`: (0-100) Is the messaging focused on converting visitors?
  - `commercial_readiness_maturity`: (Low, Moderate, High, Advanced) Overall commercial readiness level.
  - `primary_website_type`: (informational, branding-focused, service-oriented, conversion-focused, enterprise-sales focused).
  - `commercial_insights`: Concise AI commercial insights.
  - `sales_positioning_maturity_score`: (0-100) How mature is the sales positioning?
  - `commercial_readiness_level_score`: (0-100) How ready is the business to handle digital sales?
  - `conversion_targeting_insight`: Concise AI insight on how effectively the site targets high-intent buyers.
  - `market_position_ai_strategic_recommendation`: Strategic AI recommendation for market positioning and commercial readiness.


Finally, analyze the TRUST DECAY & CREDIBILITY:
- Detect outdated or weak trust signals:
  - Outdated copyright years (e.g., 2022 or older).
  - Broken/dead social links (template links or 404s).
  - Stale content (blog/news not updated in 6+ months).
  - Outdated UI patterns (non-responsive, old fonts, cluttered layout).
  - Inconsistent branding.
  - Weak maintenance signals.
  - Inactive trust indicators (missing reviews or empty testimonial sections).
- Generate:
  - `trust_decay_level`: (Critical, High, Moderate, Low).
  - `maintenance_confidence`: (0-100) based on content freshness and technical health.
  - `outdated_signal_indicators`: Comma-separated list of detected outdated signals.
  - `credibility_impact_insight`: Concise AI insight on how trust decay impacts long-term brand credibility.
  - `ai_trust_recommendation`: Strategic AI recommendation to restore brand trust and authority.
  - Example: "The website design is modern overall, but stale content and inactive trust signals may weaken perceived professionalism."
""")

        mobile_sections_prompt = ""
        if 'captured_screenshots' in locals() and captured_screenshots:
            for idx, sec in enumerate(captured_screenshots):
                mobile_sections_prompt += f"Section {idx+1} (tag: {sec['tagName']}): {sec['text'][:300]}\n"
        else:
            mobile_sections_prompt = "No sections extracted. Analyze using standard fallback."

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
                - Last Modified/Copyright Signal: {last_modified}
                
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
                
                SCHEMA MARKUP DETECTED:
                {json.dumps(schema_data, indent=2)}
                
                MOBILE WEBSITE SECTIONS TO AUDIT SEQUENTIALLY:
                {mobile_sections_prompt}
                
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
                "executive_summary": result.executive_summary,
                "business_risk_insight": result.business_risk_insight,
                "strategic_opportunity_insight": result.strategic_opportunity_insight,
                "executive_ai_recommendation": result.executive_ai_recommendation,
                "brand_credibility_insight": result.brand_credibility_insight,
                "conversion_readiness_level": result.conversion_readiness_level,
                "missing_leads_insight": result.missing_leads_insight,
                "industry_insight": result.industry_insight,
                "schema_coverage_score": result.schema_coverage_score,
                "schema_gap_insight": result.schema_gap_insight,
                "schema_visibility_impact": result.schema_visibility_impact,
                "schema_recommendation": result.schema_recommendation,
                "keyword_visibility_gap_opportunities": result.keyword_visibility_gap_opportunities,
                "keyword_visibility_gap_level": result.keyword_visibility_gap_level,
                "keyword_visibility_gap_competitor_advantage": result.keyword_visibility_gap_competitor_advantage,
                "keyword_visibility_gap_search_impact": result.keyword_visibility_gap_search_impact,
                "keyword_visibility_gap_insight": result.keyword_visibility_gap_insight,
                "mobile_ux_rating": result.mobile_ux_rating,
                "mobile_conversion_risk": result.mobile_conversion_risk,
                "mobile_ai_insight": result.mobile_ai_insight,
                "momentum_score": result.momentum_score,
                "competitive_growth_status": result.competitive_growth_status,
                "strategic_risk_level": result.strategic_risk_level,
                "momentum_comparison": result.momentum_comparison,
                "momentum_growth_direction": result.momentum_growth_direction,
                "momentum_ai_insight": result.momentum_ai_insight,
                "ai_strategic_plan": [
                    {
                        "priority": step.priority,
                        "action": step.action,
                        "impact": step.impact,
                        "difficulty": step.difficulty,
                        "is_quick_win": step.is_quick_win
                    } for step in result.ai_strategic_plan
                ],
                "annual_opportunity_loss": result.annual_opportunity_loss,
                "urgency_severity": result.urgency_severity,
                "revenue_impact_insight": result.revenue_impact_insight,
                "cta_optimization_recommendation": result.cta_optimization_recommendation,
                "conversion_improvement_suggestion": result.conversion_improvement_suggestion,
                "funnel_optimization_insight": result.funnel_optimization_insight,
                "mobile_conversion_recommendation": result.mobile_conversion_recommendation,
                "lead_gen_improvement_opportunity": result.lead_gen_improvement_opportunity,
                "conversion_intelligence_insight": result.conversion_intelligence_insight,
                "messaging_clarity_level": result.messaging_clarity_level,
                "communication_effectiveness_insight": result.communication_effectiveness_insight,
                "value_proposition_analysis": result.value_proposition_analysis,
                "messaging_strategic_recommendation": result.messaging_strategic_recommendation,
                "headline_clarity_score": result.headline_clarity_score,
                "value_prop_strength_score": result.value_prop_strength_score,
                "cta_communication_quality_score": result.cta_communication_quality_score,
                "messaging_confidence_score": result.messaging_confidence_score,
                "audience_targeting_clarity_score": result.audience_targeting_clarity_score,
                "brand_communication_effectiveness_score": result.brand_communication_effectiveness_score,
                "cta_strength_level": result.cta_strength_level,
                "cta_urgency_score": result.cta_urgency_score,
                "cta_visibility_rating": result.cta_visibility_rating,
                "cta_placement_quality": result.cta_placement_quality,
                "cta_action_clarity_score": result.cta_action_clarity_score,
                "cta_persuasiveness_score": result.cta_persuasiveness_score,
                "cta_effectiveness_insight": result.cta_effectiveness_insight,
                "cta_ai_optimization_recommendation": result.cta_ai_optimization_recommendation,
                "lead_quality_score": result.lead_quality_score,
                "business_maturity_level": result.business_maturity_level,
                "sales_potential": result.sales_potential,
                "digital_readiness": result.digital_readiness,
                "growth_potential": result.growth_potential,
                "market_position_intelligence_insight": result.market_position_intelligence_insight,
                "buyer_intent_strength": result.buyer_intent_strength,
                "transactional_service_intent_score": result.transactional_service_intent_score,
                "enterprise_sales_orientation_score": result.enterprise_sales_orientation_score,
                "lead_generation_focus_score": result.lead_generation_focus_score,
                "conversion_oriented_positioning_score": result.conversion_oriented_positioning_score,
                "commercial_readiness_maturity": result.commercial_readiness_maturity,
                "primary_website_type": result.primary_website_type,
                "commercial_insights": result.commercial_insights,
                "sales_positioning_maturity_score": result.sales_positioning_maturity_score,
                "commercial_readiness_level_score": result.commercial_readiness_level_score,
                "conversion_targeting_insight": result.conversion_targeting_insight,
                "market_position_ai_strategic_recommendation": result.market_position_ai_strategic_recommendation,
                "trust_decay_level": result.trust_decay_level,
                "maintenance_confidence": result.maintenance_confidence,
                "outdated_signal_indicators": result.outdated_signal_indicators,
                "credibility_impact_insight": result.credibility_impact_insight,
                "ai_trust_recommendation": result.ai_trust_recommendation,
                "mobile_sections": [
                    {
                        "name": item.name,
                        "insight": item.insight,
                        "risk": item.risk,
                        "b64_image": captured_screenshots[idx]["b64_image"] if 'captured_screenshots' in locals() and idx < len(captured_screenshots) else ""
                    }
                    for idx, item in enumerate(result.mobile_sections)
                ] if hasattr(result, 'mobile_sections') and result.mobile_sections else (
                    [
                        {
                            "name": f"Section {idx+1}",
                            "insight": "Suboptimal mobile UX flow and conversion friction detected.",
                            "risk": "Moderate",
                            "b64_image": sec["b64_image"]
                        }
                        for idx, sec in enumerate(captured_screenshots)
                    ] if 'captured_screenshots' in locals() and captured_screenshots else []
                )
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
                "executive_summary": "Analysis partially failed, limiting full executive insights.",
                "business_risk_insight": "Unknown due to analysis failure.",
                "strategic_opportunity_insight": "Unknown due to analysis failure.",
                "executive_ai_recommendation": "Address technical errors to enable full analysis.",
                "brand_credibility_insight": "Cannot verify credibility signals.",
                "conversion_readiness_level": "Low",
                "missing_leads_insight": "Analysis failed to extract specific conversion gaps.",
                "industry_insight": "Compared to industry leaders, this site lacks the technical infrastructure required for high-level competition.",
                "momentum_score": 30,
                "competitive_growth_status": "Falling Behind",
                "strategic_risk_level": "High",
                "momentum_comparison": "Competitors are rapidly improving AI visibility and conversion infrastructure while your website remains static.",
                "momentum_growth_direction": "Down",
                "momentum_ai_insight": "Critical: You are losing ground as competitors adopt modern AI-search and conversion optimization strategies at a faster pace.",
                "cta_optimization_recommendation": "Add a stronger CTA above the fold to improve immediate engagement.",
                "conversion_improvement_suggestion": "Simplify mobile contact access to reduce conversion friction.",
                "funnel_optimization_insight": "Optimize the primary conversion funnel by reducing required form fields.",
                "mobile_conversion_recommendation": "Ensure CTA buttons are thumb-accessible and clear on mobile screens.",
                "lead_gen_improvement_opportunity": "Integrate a chat or WhatsApp widget to capture high-intent mobile visitors.",
                "conversion_intelligence_insight": "Strategic conversion paths are currently fragmented, leading to significant lead leakage.",
                "messaging_clarity_level": "Moderate",
                "communication_effectiveness_insight": "Messaging analysis partially failed, but initial signals suggest a lack of clear value proposition.",
                "value_proposition_analysis": "Value proposition strength is currently unclear due to analysis limits.",
                "messaging_strategic_recommendation": "Clarify brand messaging and target audience specifically on the hero section.",
                "headline_clarity_score": 5,
                "value_prop_strength_score": 5,
                "cta_communication_quality_score": 5,
                "messaging_confidence_score": 5,
                "audience_targeting_clarity_score": 5,
                "brand_communication_effectiveness_score": 5,
                "cta_strength_level": "Moderate",
                "cta_urgency_score": 5,
                "cta_visibility_rating": "Moderate",
                "cta_placement_quality": "Suboptimal",
                "cta_action_clarity_score": 5,
                "cta_persuasiveness_score": 5,
                "cta_effectiveness_insight": "CTA analysis partially failed, but initial signals suggest a lack of urgency.",
                "cta_ai_optimization_recommendation": "Strengthen CTA wording with action-oriented and urgent language.",
                "mobile_sections": [
                    {
                        "name": f"Section {idx+1}",
                        "insight": "Suboptimal mobile UX flow and conversion friction detected.",
                        "risk": "Moderate",
                        "b64_image": sec["b64_image"]
                    }
                    for idx, sec in enumerate(captured_screenshots)
                ] if 'captured_screenshots' in locals() and captured_screenshots else [
                    {
                        "name": "Hero Section",
                        "insight": "Failed to analyze mobile experience details.",
                        "risk": "Moderate",
                        "b64_image": ""
                    }
                ]
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
        "executive_summary": result_dict.get("executive_summary", ""),
        "business_risk_insight": result_dict.get("business_risk_insight", ""),
        "strategic_opportunity_insight": result_dict.get("strategic_opportunity_insight", ""),
        "executive_ai_recommendation": result_dict.get("executive_ai_recommendation", ""),
        "brand_credibility_insight": result_dict.get("brand_credibility_insight", ""),
        "seo_score": result_dict.get("seo_score", 0),
        "seo_status": result_dict.get("seo_status", ""),
        "seo_improvement": result_dict.get("seo_improvement", ""),
        "aeo_score": result_dict.get("aeo_score", 0),
        "aeo_status": result_dict.get("aeo_status", ""),
        "aeo_improvement": result_dict.get("aeo_improvement", ""),
        "aeo_probe_response": aeo_probe.get("aeo_raw_response", ""),
        "has_cta": has_cta,
        "has_duplicate_meta": locals().get('has_duplicate_meta', False),
        "schema_data": schema_data,
        "schema_coverage_score": result_dict.get("schema_coverage_score", 0),
        "schema_gap_insight": result_dict.get("schema_gap_insight", ""),
        "schema_visibility_impact": result_dict.get("schema_visibility_impact", "Low"),
        "schema_recommendation": result_dict.get("schema_recommendation", ""),
        "keyword_visibility_gap_opportunities": result_dict.get("keyword_visibility_gap_opportunities", ""),
        "keyword_visibility_gap_level": result_dict.get("keyword_visibility_gap_level", "Low"),
        "keyword_visibility_gap_competitor_advantage": result_dict.get("keyword_visibility_gap_competitor_advantage", ""),
        "keyword_visibility_gap_search_impact": result_dict.get("keyword_visibility_gap_search_impact", "Low"),
        "keyword_visibility_gap_insight": result_dict.get("keyword_visibility_gap_insight", ""),
        "mobile_ux_rating": result_dict.get("mobile_ux_rating", "Average"),
        "mobile_conversion_risk": result_dict.get("mobile_conversion_risk", "Moderate"),
        "mobile_ai_insight": result_dict.get("mobile_ai_insight", ""),
        "momentum_score": result_dict.get("momentum_score", 0),
        "competitive_growth_status": result_dict.get("competitive_growth_status", "Steady"),
        "strategic_risk_level": result_dict.get("strategic_risk_level", "Moderate"),
        "momentum_comparison": result_dict.get("momentum_comparison", ""),
        "momentum_growth_direction": result_dict.get("momentum_growth_direction", "Neutral"),
        "momentum_ai_insight": result_dict.get("momentum_ai_insight", ""),
        "ai_strategic_plan": result_dict.get("ai_strategic_plan", []),
        "annual_opportunity_loss": result_dict.get("annual_opportunity_loss", 0),
        "urgency_severity": result_dict.get("urgency_severity", "90+ Days"),
        "revenue_impact_insight": result_dict.get("revenue_impact_insight", ""),
        "cta_optimization_recommendation": result_dict.get("cta_optimization_recommendation", ""),
        "conversion_improvement_suggestion": result_dict.get("conversion_improvement_suggestion", ""),
        "funnel_optimization_insight": result_dict.get("funnel_optimization_insight", ""),
        "mobile_conversion_recommendation": result_dict.get("mobile_conversion_recommendation", ""),
        "lead_gen_improvement_opportunity": result_dict.get("lead_gen_improvement_opportunity", ""),
        "conversion_intelligence_insight": result_dict.get("conversion_intelligence_insight", ""),
        "messaging_clarity_level": result_dict.get("messaging_clarity_level", "Moderate"),
        "communication_effectiveness_insight": result_dict.get("communication_effectiveness_insight", ""),
        "value_proposition_analysis": result_dict.get("value_proposition_analysis", ""),
        "messaging_strategic_recommendation": result_dict.get("messaging_strategic_recommendation", ""),
        "headline_clarity_score": result_dict.get("headline_clarity_score", 0),
        "value_prop_strength_score": result_dict.get("value_prop_strength_score", 0),
        "cta_communication_quality_score": result_dict.get("cta_communication_quality_score", 0),
        "messaging_confidence_score": result_dict.get("messaging_confidence_score", 0),
        "audience_targeting_clarity_score": result_dict.get("audience_targeting_clarity_score", 0),
        "brand_communication_effectiveness_score": result_dict.get("brand_communication_effectiveness_score", 0),
        "cta_strength_level": result_dict.get("cta_strength_level", "Moderate"),
        "cta_urgency_score": result_dict.get("cta_urgency_score", 0),
        "cta_visibility_rating": result_dict.get("cta_visibility_rating", "Moderate"),
        "cta_placement_quality": result_dict.get("cta_placement_quality", "Suboptimal"),
        "cta_action_clarity_score": result_dict.get("cta_action_clarity_score", 0),
        "cta_persuasiveness_score": result_dict.get("cta_persuasiveness_score", 0),
        "cta_effectiveness_insight": result_dict.get("cta_effectiveness_insight", ""),
        "cta_ai_optimization_recommendation": result_dict.get("cta_ai_optimization_recommendation", ""),
        "lead_quality_score": result_dict.get("lead_quality_score", 0),
        "business_maturity_level": result_dict.get("business_maturity_level", "Unknown"),
        "sales_potential": result_dict.get("sales_potential", "Moderate"),
        "digital_readiness": result_dict.get("digital_readiness", "Moderate"),
        "growth_potential": result_dict.get("growth_potential", "Moderate"),
        "market_position_intelligence_insight": result_dict.get("market_position_intelligence_insight", ""),
        "buyer_intent_strength": result_dict.get("buyer_intent_strength", "Moderate"),
        "transactional_service_intent_score": result_dict.get("transactional_service_intent_score", 0),
        "enterprise_sales_orientation_score": result_dict.get("enterprise_sales_orientation_score", 0),
        "lead_generation_focus_score": result_dict.get("lead_generation_focus_score", 0),
        "conversion_oriented_positioning_score": result_dict.get("conversion_oriented_positioning_score", 0),
        "commercial_readiness_maturity": result_dict.get("commercial_readiness_maturity", "Moderate"),
        "primary_website_type": result_dict.get("primary_website_type", "informational"),
        "commercial_insights": result_dict.get("commercial_insights", ""),
        "sales_positioning_maturity_score": result_dict.get("sales_positioning_maturity_score", 0),
        "commercial_readiness_level_score": result_dict.get("commercial_readiness_level_score", 0),
        "conversion_targeting_insight": result_dict.get("conversion_targeting_insight", ""),
        "market_position_ai_strategic_recommendation": result_dict.get("market_position_ai_strategic_recommendation", ""),
        "trust_decay_level": result_dict.get("trust_decay_level", "Low"),
        "maintenance_confidence": result_dict.get("maintenance_confidence", 100),
        "outdated_signal_indicators": result_dict.get("outdated_signal_indicators", ""),
        "credibility_impact_insight": result_dict.get("credibility_impact_insight", ""),
        "ai_trust_recommendation": result_dict.get("ai_trust_recommendation", ""),
        "b64_image_mobile": b64_image_mobile,
        "mobile_sections": result_dict.get("mobile_sections", [])
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
