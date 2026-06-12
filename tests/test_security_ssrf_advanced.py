import sys
import os
import unittest
from unittest.mock import patch, MagicMock
import requests

# Ensure core is in path
sys.path.append(os.getcwd())
from core.security import safe_request, is_safe_url

class TestSSRFAdvanced(unittest.TestCase):

    @patch('core.security.is_safe_url')
    @patch('requests.request')
    def test_safe_request_blocks_unsafe_redirect(self, mock_request, mock_is_safe):
        # Initial URL is safe
        # Redirect URL is unsafe
        mock_is_safe.side_effect = [True, False]

        # Mock first response as a redirect
        mock_response = MagicMock()
        mock_response.is_redirect = True
        mock_response.headers = {'Location': 'http://169.254.169.254/latest/meta-data/'}
        mock_request.return_value = mock_response

        with self.assertRaises(requests.exceptions.RequestException) as cm:
            safe_request("GET", "http://safe-site.com")

        self.assertIn("Unsafe URL detected", str(cm.exception))
        # Should have called is_safe_url twice: once for initial, once for redirect
        self.assertEqual(mock_is_safe.call_count, 2)

    @patch('requests.request')
    def test_safe_request_follows_safe_redirect(self, mock_request):
        # Mock two responses: first is a redirect to another safe site, second is OK
        mock_response_1 = MagicMock()
        mock_response_1.is_redirect = True
        mock_response_1.headers = {'Location': 'https://another-safe-site.com'}

        mock_response_2 = MagicMock()
        mock_response_2.is_redirect = False
        mock_response_2.status_code = 200

        mock_request.side_effect = [mock_response_1, mock_response_2]

        # Both sites should be resolved as safe by the real is_safe_url (assuming they are public)
        # For testing, we might want to mock is_safe_url to be sure it returns True
        with patch('core.security.is_safe_url', return_value=True) as mock_is_safe:
            res = safe_request("GET", "http://safe-site.com")
            self.assertEqual(res.status_code, 200)
            self.assertEqual(mock_request.call_count, 2)
            self.assertEqual(mock_is_safe.call_count, 2)

    def test_is_safe_url_ipv6_loopback(self):
        self.assertFalse(is_safe_url("http://[::1]"))
        self.assertFalse(is_safe_url("http://[0:0:0:0:0:0:0:1]"))

    @patch('socket.getaddrinfo')
    def test_is_safe_url_dual_stack_bypass(self, mock_getaddrinfo):
        # Mock a hostname that resolves to both a public IPv4 and a private IPv6
        mock_getaddrinfo.return_value = [
            (None, None, None, None, ('1.1.1.1', 0)),
            (None, None, None, None, ('::1', 0))
        ]
        self.assertFalse(is_safe_url("http://mixed-records.com"))

if __name__ == "__main__":
    unittest.main()
