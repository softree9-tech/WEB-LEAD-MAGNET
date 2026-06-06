import sys
import os
sys.path.append(os.getcwd())
from core.security import is_safe_url

def test_ipv6_ssrf():
    unsafe_ipv6 = [
        "http://[::1]",
        "http://[0:0:0:0:0:0:0:1]",
        "http://[::ffff:127.0.0.1]",
        "http://[fe80::]",
        "http://[fc00::]",
    ]
    for url in unsafe_ipv6:
        assert is_safe_url(url) is False, f"IPv6 URL should be unsafe: {url}"

if __name__ == "__main__":
    try:
        test_ipv6_ssrf()
        print("🛡️ IPv6 SSRF Security tests passed!")
    except AssertionError as e:
        print(f"❌ Test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ An error occurred: {e}")
        sys.exit(1)
