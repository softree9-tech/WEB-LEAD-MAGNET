import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        # Grant clipboard permissions
        context = await browser.new_context()
        await context.grant_permissions(['clipboard-read', 'clipboard-write'])
        page = await context.new_page()

        # Navigate to the app (assuming dev server is still running on 3000)
        try:
            await page.goto("http://localhost:3000", timeout=5000)
        except Exception:
            print("Server not running on 3000, trying 5173")
            await page.goto("http://localhost:5173", timeout=5000)

        # Mock the API response to show the results page
        await page.route("**/api/analyze", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"status": "success", "results": {"url": "palette-final.test", "score": 85, "email_content": "Hi team,\\n\\nI was doing some research...", "audit_results": {"rebranding": {"score": 73, "findings": ["Cleaned up code review feedback."]}, "tech_trust": {"score": 90, "findings": ["Missing newsletter opt-in."]}, "seo": {"score": 100, "findings": ["Perfect SEO."]}}}}'
        ))

        # Fill the form and submit
        await page.fill('input[placeholder*="website"]', "palette-final.test")
        await page.click('button[type="submit"]')

        # Wait for the results to load
        await page.wait_for_selector('text=Personalized AI Outreach Email')

        # Check the Copy button
        copy_button = page.get_by_role("button", name="Copy to Clipboard")
        await copy_button.click()

        # Wait for "Copied!" feedback
        await page.wait_for_selector('text=Copied!')

        # Take screenshot
        await page.screenshot(path="/home/jules/verification/screenshots/final_submit.png", full_page=True)
        print("Screenshot saved to /home/jules/verification/screenshots/final_submit.png")

        await browser.close()

asyncio.run(run())
