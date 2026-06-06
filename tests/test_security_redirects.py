import sys
import os
import requests
import socket
from unittest.mock import patch, MagicMock

sys.path.append(os.getcwd())
from core.security import validate_website

@patch('requests.get')
@patch('socket.getaddrinfo')
def test_redirect_ssrf(mock_getaddrinfo, mock_requests_get):
    # Mock DNS resolution to return a safe IP first, then an unsafe IP
    mock_getaddrinfo.side_effect = [
        [(socket.AF_INET, socket.SOCK_STREAM, 6, '', ('93.184.216.34', 0))], # example.com
        [(socket.AF_INET, socket.SOCK_STREAM, 6, '', ('127.0.0.1', 0))]      # localhost
    ]

    # Mock first response to be a redirect to localhost
    mock_redirect = MagicMock()
    mock_redirect.status_code = 301
    mock_redirect.headers = {'Location': 'http://localhost'}

    # Mock second response (should not be reached if validation works)
    mock_final = MagicMock()
    mock_final.status_code = 200

    mock_requests_get.side_effect = [mock_redirect, mock_final]

    result = validate_website("http://example.com")

    assert result['valid'] is False
    assert "Invalid domain" in result['error']

    # Check that it stopped after the first request and second check
    assert mock_requests_get.call_count == 1
    print("✅ Redirect SSRF test passed!")

if __name__ == "__main__":
    try:
        test_redirect_ssrf()
    except Exception as e:
        print(f"❌ Test failed: {e}")
        sys.exit(1)
