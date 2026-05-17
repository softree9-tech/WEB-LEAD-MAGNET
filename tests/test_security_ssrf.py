import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.security import is_safe_url

def test_safe_urls():
    assert is_safe_url("https://www.google.com") is True
    assert is_safe_url("https://github.com") is True
    assert is_safe_url("softreetechnology.com") is True

def test_unsafe_urls():
    # Loopback
    assert is_safe_url("http://127.0.0.1") is False
    assert is_safe_url("http://localhost") is False
    assert is_safe_url("http://[::1]") is False

    # Private IP ranges
    assert is_safe_url("http://10.0.0.1") is False
    assert is_safe_url("http://172.16.0.1") is False
    assert is_safe_url("http://192.168.1.1") is False

    # Link-local
    assert is_safe_url("http://169.254.169.254") is False

def test_invalid_urls():
    assert is_safe_url("") is False
    assert is_safe_url(None) is False
    assert is_safe_url("not-a-url") is False

if __name__ == "__main__":
    print("Running SSRF security tests...")
    try:
        test_safe_urls()
        print("✅ Safe URLs passed")
        test_unsafe_urls()
        print("✅ Unsafe URLs blocked")
        test_invalid_urls()
        print("✅ Invalid URLs handled")
        print("\nALL SSRF SECURITY TESTS PASSED!")
    except AssertionError as e:
        print(f"\n❌ TEST FAILED")
        exit(1)
    except Exception as e:
        print(f"\n❌ AN ERROR OCCURRED: {e}")
        exit(1)
