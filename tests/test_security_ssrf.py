import sys
import os
import requests
import requests_mock
import pytest
sys.path.append(os.getcwd())
from core.security import is_safe_url, safe_requests_get

def test_safe_urls():
    safe_urls = [
        "https://google.com",
        "http://example.com",
        "softreetechnology.com",
        "https://github.com/trending"
    ]
    for url in safe_urls:
        assert is_safe_url(url) is True, f"URL should be safe: {url}"

def test_unsafe_urls():
    unsafe_urls = [
        "http://localhost",
        "http://127.0.0.1",
        "http://169.254.169.254", # AWS metadata
        "http://192.168.1.1",
        "http://10.0.0.1",
        "http://0.0.0.0",
        "file:///etc/passwd",
        "ftp://example.com",
        "http://[::1]"
    ]
    for url in unsafe_urls:
        assert is_safe_url(url) is False, f"URL should be unsafe: {url}"

def test_ssrf_redirect_protection():
    """Verifies that safe_requests_get blocks redirects to unsafe internal IPs."""
    url = "http://public-site.com/redirect"
    with requests_mock.Mocker() as m:
        # Mock a redirect to an internal IP
        m.get(url, status_code=302, headers={'Location': 'http://127.0.0.1/admin'})
        m.get('http://127.0.0.1/admin', text='sensitive data')

        with pytest.raises(requests.exceptions.RequestException) as excinfo:
            safe_requests_get(url, timeout=1)
        assert "Unsafe URL blocked" in str(excinfo.value)

def test_ipv6_mapped_ipv4_protection():
    """Verifies that IPv4-mapped IPv6 addresses for loopback are blocked."""
    assert is_safe_url("http://[::ffff:127.0.0.1]") is False

if __name__ == "__main__":
    try:
        test_safe_urls()
        print("✅ Safe URLs test passed")
        test_unsafe_urls()
        print("✅ Unsafe URLs test passed")
        print("🛡️ SSRF Security tests passed!")
    except AssertionError as e:
        print(f"❌ Test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ An error occurred: {e}")
        sys.exit(1)
