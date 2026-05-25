import sys
import os
sys.path.append(os.getcwd())
from core.security import is_safe_url

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
        "http://[::1]",
        "http://[0:0:0:0:0:ffff:7f00:1]", # IPv4-mapped IPv6 for 127.0.0.1
        "http://[fe80::1]", # Link-local
    ]
    for url in unsafe_urls:
        # Clear cache to ensure each test is fresh if needed,
        # but for SSRF tests we want to be sure.
        is_safe_url.cache_clear()
        assert is_safe_url(url) is False, f"URL should be unsafe: {url}"

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
