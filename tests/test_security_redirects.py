import sys
import os
import unittest
from unittest.mock import patch, MagicMock
import requests
sys.path.append(os.getcwd())
from core.security import validate_website, is_safe_url

class TestSecurityRedirects(unittest.TestCase):

    @patch('core.security.requests.request')
    @patch('core.security.is_safe_url')
    def test_validate_website_blocks_unsafe_redirect(self, mock_is_safe, mock_request):
        # Initial URL is safe
        mock_is_safe.side_effect = lambda url: "unsafe" not in url

        # Mock first response as a redirect to an unsafe URL
        mock_redirect = MagicMock()
        mock_redirect.status_code = 301
        mock_redirect.headers = {"Location": "http://unsafe.com"}

        mock_request.return_value = mock_redirect

        result = validate_website("http://safe.com")

        self.assertFalse(result["valid"])
        self.assertIn("Invalid domain", result["error"])
        # Should have called request once for the safe URL
        mock_request.assert_called_once()

    @patch('core.security.requests.request')
    @patch('core.security.is_safe_url')
    def test_validate_website_follows_safe_redirect(self, mock_is_safe, mock_request):
        mock_is_safe.return_value = True

        # Mock first response as a redirect to another safe URL
        mock_redirect = MagicMock()
        mock_redirect.status_code = 301
        mock_redirect.headers = {"Location": "http://safe2.com"}

        # Mock second response as success
        mock_success = MagicMock()
        mock_success.status_code = 200
        mock_success.raw.read.return_value = b"<html><body>Normal site with enough content to pass the parked domain check. " + b"a" * 300 + b"</body></html>"

        mock_request.side_effect = [mock_redirect, mock_success]

        result = validate_website("http://safe1.com")

        self.assertTrue(result["valid"])
        self.assertEqual(mock_request.call_count, 2)

if __name__ == "__main__":
    unittest.main()
