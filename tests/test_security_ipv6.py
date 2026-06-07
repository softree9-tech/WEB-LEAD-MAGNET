import sys
import os
sys.path.append(os.getcwd())
from core.security import is_safe_url

def test_ipv6_ssrf():
    unsafe_urls = [
        "http://[::1]",
        "http://[::]",
        "http://[0000:0000:0000:0000:0000:0000:0000:0001]",
        "http://[fe80::1]", # Link-local
    ]
    for url in unsafe_urls:
        assert is_safe_url(url) is False, f"URL should be unsafe (IPv6): {url}"
    print("✅ IPv6 SSRF tests passed")

if __name__ == "__main__":
    try:
        test_ipv6_ssrf()
    except AssertionError as e:
        print(f"❌ Test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ An error occurred: {e}")
        sys.exit(1)
