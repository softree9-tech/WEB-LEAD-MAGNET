import unittest
from bs4 import BeautifulSoup
from agents.website_analyzer import count_broken_links
from core.security import is_safe_url

class TestBoltOptimizations(unittest.TestCase):
    def test_count_broken_links_with_soup(self):
        html = '<html><body><a href="https://example.com/dead">Link</a></body></html>'
        soup = BeautifulSoup(html, "html.parser")
        # Should accept soup object without error
        result = count_broken_links(soup, "https://example.com")
        self.assertIn("broken_list", result)
        self.assertEqual(result["total"], 1)

    def test_count_broken_links_with_str(self):
        html = '<html><body><a href="https://example.com/dead">Link</a></body></html>'
        # Should still accept string for backward compatibility
        result = count_broken_links(html, "https://example.com")
        self.assertIn("broken_list", result)
        self.assertEqual(result["total"], 1)

    def test_is_safe_url_caching(self):
        url = "https://www.google.com"
        # First call (populates cache)
        self.assertTrue(is_safe_url(url))

        # Second call (should hit cache)
        self.assertTrue(is_safe_url(url))

if __name__ == "__main__":
    unittest.main()
