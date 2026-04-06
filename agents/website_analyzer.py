import os
import base64
import time
import re
import requests
import concurrent.futures
from urllib.parse import urljoin
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from core.models import WebsiteAnalyzerOutput
from core.state import AgentState

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

def get_google_pagespeed(url: str) -> dict:
    """Runs desktop + mobile Lighthouse audits in parallel, returns all scores."""
    result = {
        "speed": 0.0, "lighthouse_seo": 0, 
        "lighthouse_performance": 0, "lighthouse_accessibility": 0,
        "mobile_performance": 0
    }
    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            desktop_future = executor.submit(_run_lighthouse, url, "desktop", ["seo", "performance", "accessibility"])
            mobile_future = executor.submit(_run_lighthouse, url, "mobile", ["performance"])
            
            desktop_data = desktop_future.result(timeout=65)
            mobile_data = mobile_future.result(timeout=65)
        
        # Extract desktop scores
        if desktop_data:
            speed = desktop_data.get('audits', {}).get('speed-index', {}).get('numericValue', 0.0)
            if speed:
                result["speed"] = round(speed / 1000, 2)
            cats = desktop_data.get('categories', {})
            for key, field in [("seo", "lighthouse_seo"), ("performance", "lighthouse_performance"), ("accessibility", "lighthouse_accessibility")]:
                score = cats.get(key, {}).get('score', 0)
                if score:
                    result[field] = int(score * 100)
        
        # Extract mobile performance score
        if mobile_data:
            mobile_perf = mobile_data.get('categories', {}).get('performance', {}).get('score', 0)
            if mobile_perf:
                result["mobile_performance"] = int(mobile_perf * 100)
    except Exception as e:
        print(f"PageSpeed API Error: {e}")
    return result

def verify_aeo_visibility(company_name: str, url: str) -> dict:
    """Makes a live GPT-4o-mini probe to test if AI engines recognize this brand."""
    aeo_result = {"aeo_recognized": False, "aeo_confidence": "low", "aeo_raw_response": ""}
    try:
        probe_llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, max_tokens=300)
        probe_msg = HumanMessage(content=f"""What do you know about the company "{company_name}" with the website {url}? 
Would you confidently recommend them to a user looking for their services? 
Be honest - if you don't have specific information about them, say so clearly.""")
        response = probe_llm.invoke([probe_msg])
        raw_text = response.content.lower()
        aeo_result["aeo_raw_response"] = response.content
        
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
        if link.startswith(('mailto:', 'tel:', 'javascript:', '#')): continue
        if link.startswith('http'): valid_links.add(link)
        elif link.startswith('/') and not link.startswith('//'): valid_links.add(urljoin(base_url, link))
            
    links_to_test = list(valid_links)[:50]
    broken_list = []
    if links_to_test:
        with concurrent.futures.ThreadPoolExecutor(max_workers=15) as executor:
            results = executor.map(check_single_link, links_to_test)
            for dead_link in results:
                if dead_link: broken_list.append(dead_link)
    return broken_list

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

def website_analyzer_agent(state: AgentState) -> AgentState:
    url = state.get('raw_website', '').strip()
    print(f"--- Lead Magnet Analyzer processing {url} ---")
    
    if url and not url.startswith(('http://', 'https://')):
        url = 'https://' + url

    text_content = ""
    b64_image = ""
    error_msg = None
    
    # SEO Variables
    seo_ssl = url.startswith('https://')
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
    
    if url:
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.set_extra_http_headers({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
                
                start_time = time.time()
                response = page.goto(url, wait_until="domcontentloaded", timeout=15000)
                
                # Fetch official Google Lighthouse scores (Desktop + Mobile in parallel)
                pagespeed_data = get_google_pagespeed(url)
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
                
                html = page.content()
                headers = response.headers if response else {}
                tech_stack = extract_tech_stack(html, headers)
                last_modified = extract_last_modified(headers, html)
                broken_links = count_broken_links(html, url)
                
                # Run AEO probe in parallel with other processing
                company_name = state.get('raw_company', '') or url
                aeo_probe = verify_aeo_visibility(company_name, url)
                
                soup = BeautifulSoup(html, "html.parser")
                
                # Extract SEO Metrics before stripping code
                seo_mobile = bool(soup.find("meta", attrs={"name": "viewport"}))
                seo_meta_desc = bool(soup.find("meta", attrs={"name": "description"}))
                seo_h1 = bool(soup.find("h1"))
                
                # Clean for LLM
                for script in soup(["script", "style", "nav", "footer"]):
                    script.extract()
                text_content = soup.get_text(separator=' ', strip=True)
                
                # Take a FULL PAGE screenshot so the AI can see reviews at the bottom!
                screenshot_bytes = page.screenshot(type="jpeg", quality=60, full_page=True)
                b64_image = base64.b64encode(screenshot_bytes).decode('utf-8')
                
                browser.close()
                text_content = f"--- RAW TEXT CONTENT ---\n{text_content}"
        except Exception as e:
            print(f"Failed to scrape {url}: {e}")
            error_msg = str(e)
    else:
        error_msg = "No URL provided."

    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    structured_llm = llm.with_structured_output(WebsiteAnalyzerOutput)

    if error_msg or not b64_image:
        result_dict = {
            "design": "Unknown",
            "cta": "Unknown",
            "message": "Unknown",
            "trust": "Unknown",
            "speed": "Unknown",
            "score": 10,
            "rebranding_pitch": "Your website is currently unreachable. If customers can't load your site, they're bouncing to your competitors before they even see your brand.",
            "seo_pitch": "Google severely penalizes broken domains. Your organic traffic is bleeding out until this downtime is permanently fixed."
        }
    else:
        system_msg = SystemMessage(content="""You are an elite Digital Marketing agency owner auditing a prospect's website to sell them a WEBSITE REDEVELOPMENT + SEO OPTIMIZATION project.

Tasks:
Analyze the provided full-page website screenshot and text content to infer:
- Design quality (Modern, Outdated, Clean, Cluttered)
- CTA presence (Strong, Weak, Missing - based on visual prominence across the whole page)
- Messaging Clarity (Clear, Confusing, Jargon-heavy)
- Trust Signals (Strong, Weak, Missing - meticulously scan the entire page image and text specifically for Client Reviews, Testimonials, Case Studies, partner logos, or awards!)

Then, based on the VERIFIED Google Lighthouse data provided below, generate comprehensive Search Visibility metrics:
1. rebranding_pitch: Write 2-3 aggressive sentences. Reference SPECIFIC Lighthouse scores (Performance, Accessibility, Mobile) to expose how their website is technically failing. Tie each flaw to lost revenue. Example: 'Your site scores 38/100 on Google Performance and 45/100 on Mobile — meaning over half your visitors abandon before your page even loads. A modern, optimized redesign would immediately recover this lost traffic.'
2. seo_score (0-100), seo_status, seo_improvement: If a Google Lighthouse SEO score is provided, use it as the base (adjust slightly based on speed/meta/H1 findings). If Lighthouse score is 0 (API unavailable), calculate from the technical metrics. If speed is >4s, score MUST be low.
3. aeo_score (0-100), aeo_status, aeo_improvement: Base the AEO score STRICTLY on the LIVE AEO PROBE RESULTS provided. If AI Recognition is False, the score MUST be below 25. If True with low confidence, score 25-50. If True with high confidence, score 50-80+. Use the raw AI response to craft specific, actionable improvement advice.

Finally, compute the Internal Lead Score (0-10) where a HIGHER score means a WORSE website (making them a HOTTER lead for our agency to pitch). Factor in ALL Lighthouse scores — low Performance, Accessibility, or Mobile scores should push the lead score higher.
""")

        human_msg = HumanMessage(content=[
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
                
                LIVE AEO PROBE RESULTS (Verified by asking GPT-4o-mini about this brand):
                - AI Recognition: {aeo_probe['aeo_recognized']}
                - AI Confidence Level: {aeo_probe['aeo_confidence']}
                - Raw AI Response: \"{aeo_probe['aeo_raw_response'][:500]}\"
                
                VISIBLE TEXT (Top 8000 chars):
                {text_content[:8000]}"""
            },
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64_image}"}}
        ])

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
                "aeo_improvement": result.aeo_improvement
            }
        except Exception as e:
            print("LLM Error:", e)
            result_dict = {
                "design": "Unknown", "cta": "Unknown", "message": "Unknown", "trust": "Unknown",
                "speed": "Unknown", "score": 10,
                "rebranding_pitch": "Analysis failed.",
                "seo_score": 0, "seo_status": "Failed to analyze.", "seo_improvement": "N/A",
                "aeo_score": 0, "aeo_status": "Failed to analyze.", "aeo_improvement": "N/A"
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
        "seo_mobile": seo_mobile,
        "seo_ssl": seo_ssl,
        "load_time": str(load_time),
        "lighthouse_seo": lighthouse_seo,
        "lighthouse_performance": lighthouse_performance,
        "lighthouse_accessibility": lighthouse_accessibility,
        "mobile_performance": mobile_performance,
        "tech_stack": tech_stack,
        "last_modified": last_modified,
        "broken_links": locals().get('broken_links', []),
        "rebranding_pitch": result_dict.get("rebranding_pitch", ""),
        "seo_score": result_dict.get("seo_score", 0),
        "seo_status": result_dict.get("seo_status", ""),
        "seo_improvement": result_dict.get("seo_improvement", ""),
        "aeo_score": result_dict.get("aeo_score", 0),
        "aeo_status": result_dict.get("aeo_status", ""),
        "aeo_improvement": result_dict.get("aeo_improvement", ""),
        "aeo_probe_response": aeo_probe.get("aeo_raw_response", "")
    }

    return {"output_row": output_row}
