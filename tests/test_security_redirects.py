import sys
import os
import unittest
from unittest.mock import patch, MagicMock
from urllib.parse import urljoin

# Add the root directory to sys.path
sys.path.append(os.getcwd())

from core.security import validate_website, is_safe_url
from agents.website_analyzer import check_single_link

class TestRedirectSSRF(unittest.TestCase):

    @patch('core.security.requests.get')
    @patch('core.security.socket.getaddrinfo')
    def test_validate_website_redirect_to_private_ip(self, mock_getaddrinfo, mock_get):
        # Mock DNS resolution for initial URL (safe)
        import socket
        mock_getaddrinfo.side_effect = lambda hostname, port: [
            (socket.AF_INET, socket.SOCK_STREAM, 6, '', ('93.184.216.34', 0))
        ] if hostname == 'example.com' else [
            (socket.AF_INET, socket.SOCK_STREAM, 6, '', ('127.0.0.1', 0))
        ]

        # Mock initial request returning a redirect to localhost
        mock_response_1 = MagicMock()
        mock_response_1.status_code = 301
        mock_response_1.headers = {'Location': 'http://localhost/admin'}

        mock_get.return_value = mock_response_1

        url = "http://example.com"
        result = validate_website(url)

        self.assertFalse(result['valid'])
        self.assertIn("unsafe location blocked", result['error'])

    @patch('agents.website_analyzer.requests.head')
    @patch('agents.website_analyzer.is_safe_url')
    def test_check_single_link_redirect_to_private_ip(self, mock_is_safe, mock_head):
        # Initial link is safe
        mock_is_safe.side_effect = lambda url: True if 'safe.com' in url else False

        # Mock redirect to unsafe location
        mock_response_1 = MagicMock()
        mock_response_1.status_code = 301
        mock_response_1.headers = {'Location': 'http://127.0.0.1/sensitive'}

        mock_head.return_value = mock_response_1

        link = "http://safe.com/link"
        result = check_single_link(link)

        self.assertEqual(result, "") # Should return empty string for unsafe links

if __name__ == "__main__":
    unittest.main()
