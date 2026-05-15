import sys
import os
sys.path.append('.')
from core.security import is_safe_url

def test_is_safe_url():
    # Safe URLs
    assert is_safe_url("https://google.com") == True
    assert is_safe_url("https://github.com") == True
    assert is_safe_url("softreetechnology.com") == True

    # Unsafe URLs - Loopback
    assert is_safe_url("http://localhost") == False
    assert is_safe_url("http://127.0.0.1") == False
    assert is_safe_url("http://[::1]") == False

    # Unsafe URLs - Private IPs
    assert is_safe_url("http://192.168.1.1") == False
    assert is_safe_url("http://10.0.0.1") == False
    assert is_safe_url("http://172.16.0.1") == False

    # Unsafe URLs - Metadata services
    assert is_safe_url("http://169.254.169.254") == False
    assert is_safe_url("http://metadata.google.internal") == False

    # Invalid URLs
    assert is_safe_url("") == False
    assert is_safe_url("not_a_url") == False

    print("✅ is_safe_url tests passed!")

if __name__ == "__main__":
    try:
        test_is_safe_url()
    except AssertionError as e:
        print(f"❌ test_is_safe_url failed!")
        sys.exit(1)
    except Exception as e:
        print(f"❌ An error occurred: {e}")
        sys.exit(1)
