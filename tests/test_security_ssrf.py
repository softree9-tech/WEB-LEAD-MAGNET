import sys
import os

# Add the root directory to sys.path so we can import core.security
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.security import is_safe_url

def test_safe_urls():
    safe_urls = [
        "https://google.com",
        "http://github.com",
        "softreetechnology.com",
        "https://www.wikipedia.org"
    ]
    for url in safe_urls:
        assert is_safe_url(url) is True, f"URL should be safe: {url}"
    print("✅ All safe URLs passed.")

def test_unsafe_urls():
    unsafe_urls = [
        "http://localhost",
        "http://127.0.0.1",
        "http://169.254.169.254", # AWS metadata
        "http://192.168.1.1",
        "http://10.0.0.1",
        "http://0.0.0.0",
        "http://[::1]"
    ]
    for url in unsafe_urls:
        assert is_safe_url(url) is False, f"URL should be unsafe: {url}"
    print("✅ All unsafe URLs passed.")

if __name__ == "__main__":
    try:
        test_safe_urls()
        test_unsafe_urls()
        print("🛡️ All security tests passed!")
    except AssertionError as e:
        print(f"❌ Security test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ An error occurred during testing: {e}")
        sys.exit(1)
