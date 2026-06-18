import sys
import os
import unittest
from unittest.mock import patch, MagicMock
import requests

sys.path.append(os.getcwd())
from core.security import is_safe_url, safe_request

class TestSSRFHardened(unittest.TestCase):

    @patch('core.security.socket.getaddrinfo')
    def test_ipv6_loopback(self, mock_getaddrinfo):
        # Mocking [::1] resolution
        mock_getaddrinfo.return_value = [(2, 1, 6, '', ('::1', 0, 0, 0))]
        self.assertFalse(is_safe_url("http://[::1]"))

    @patch('core.security.socket.getaddrinfo')
    def test_ipv4_mapped_ipv6(self, mock_getaddrinfo):
        # Mocking ::ffff:127.0.0.1
        mock_getaddrinfo.return_value = [(2, 1, 6, '', ('::ffff:127.0.0.1', 0, 0, 0))]
        self.assertFalse(is_safe_url("http://[::ffff:7f00:1]"))

    @patch('core.security.requests.request')
    @patch('core.security.is_safe_url')
    def test_safe_request_redirect_bypass(self, mock_is_safe, mock_request):
        # Simulate a redirect from a safe URL to an unsafe one
        mock_is_safe.side_effect = [True, False] # First call (initial URL) is safe, second (redirect) is unsafe

        mock_response = MagicMock()
        mock_response.is_redirect = True
        mock_response.headers = {'Location': 'http://169.254.169.254/latest/meta-data/'}
        mock_request.return_value = mock_response

        with self.assertRaisesRegex(requests.exceptions.RequestException, "Unsafe URL blocked"):
            safe_request("GET", "http://safe-site.com")

    @patch('core.security.requests.request')
    @patch('core.security.is_safe_url')
    def test_safe_request_too_many_redirects(self, mock_is_safe, mock_request):
        mock_is_safe.return_value = True

        mock_response = MagicMock()
        mock_response.is_redirect = True
        mock_response.headers = {'Location': 'http://safe-site.com/loop'}
        mock_request.return_value = mock_response

        with self.assertRaises(requests.exceptions.TooManyRedirects):
            safe_request("GET", "http://safe-site.com", max_redirects=2)

if __name__ == "__main__":
    unittest.main()
