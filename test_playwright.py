import base64
import time
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

url = "https://softreetechnology.com"
print(f"Testing url {url}")
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_extra_http_headers({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        page.goto(url, wait_until="domcontentloaded", timeout=15000)
        html = page.content()
        soup = BeautifulSoup(html, "html.parser")
        print("Success! Title:", soup.title.string if soup.title else "No title")
        browser.close()
except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"FAILED: {e}")
