import sys
import os
import unittest
from unittest.mock import patch, MagicMock
import socket
import ipaddress

# Add current directory to path
sys.path.append(os.getcwd())

from core.security import is_safe_url, validate_website

class TestSSRFAdvanced(unittest.TestCase):

    @patch('socket.getaddrinfo')
    def test_ipv6_bypass_attempt(self, mock_getaddrinfo):
        # Mock a safe resolution
        mock_getaddrinfo.return_value = [(socket.AF_INET, socket.SOCK_STREAM, 6, '', ('93.184.216.34', 80))]
        self.assertTrue(is_safe_url("http://example.com"))

        # Mock an unsafe IPv6 resolution
        mock_getaddrinfo.return_value = [(socket.AF_INET6, socket.SOCK_STREAM, 6, '', ('::1', 80, 0, 0))]
        self.assertFalse(is_safe_url("http://[::1]"))

    @patch('requests.request')
    @patch('socket.getaddrinfo')
    def test_redirect_to_internal_ip(self, mock_getaddrinfo, mock_request):
        # Initial URL is safe
        mock_getaddrinfo.side_effect = [
            [(socket.AF_INET, socket.SOCK_STREAM, 6, '', ('93.184.216.34', 80))], # initial
            [(socket.AF_INET, socket.SOCK_STREAM, 6, '', ('127.0.0.1', 80))]      # redirect
        ]

        # Mock responses
        mock_resp_redirect = MagicMock()
        mock_resp_redirect.is_redirect = True
        mock_resp_redirect.status_code = 302
        mock_resp_redirect.headers = {'Location': 'http://127.0.0.1/admin'}

        mock_request.return_value = mock_resp_redirect

        # Calling validate_website which uses safe_request
        from core.security import safe_request

        with self.assertRaises(Exception) as cm:
            safe_request("GET", "http://example.com")

        self.assertIn("Unsafe URL blocked", str(cm.exception))

    @patch('socket.getaddrinfo')
    def test_ipv4_mapped_ipv6(self, mock_getaddrinfo):
        # Test IPv4-mapped IPv6 addresses
        mock_getaddrinfo.return_value = [(socket.AF_INET6, socket.SOCK_STREAM, 6, '', ('::ffff:127.0.0.1', 80, 0, 0))]
        self.assertFalse(is_safe_url("http://[::ffff:7f00:1]"))

if __name__ == "__main__":
    unittest.main()
