from fastapi.testclient import TestClient
import os
import sys

# Ensure current directory is in sys.path to import main
sys.path.append(os.getcwd())

from main import app

client = TestClient(app)

def test_path_traversal_blocked():
    print("Testing path traversal protection...")

    # 1. Test /api/reports/view/
    # This should be sanitized to 'main.py' which doesn't exist in data/pdfs/
    response = client.get("/api/reports/view/../../main.py")
    assert response.status_code == 404
    print("✅ /api/reports/view/ traversal blocked (404)")

    # 2. Test /api/reports/download/
    response = client.get("/api/reports/download/../../main.py")
    assert response.status_code == 404
    print("✅ /api/reports/download/ traversal blocked (404)")

    # 3. Test with URL encoding
    response = client.get("/api/reports/view/..%2f..%2fmain.py")
    assert response.status_code == 404
    print("✅ /api/reports/view/ encoded traversal blocked (404)")

    # 4. Test Windows-style (though on Linux it's literal, it should still be sanitized)
    response = client.get("/api/reports/view/..\\..\\main.py")
    assert response.status_code == 404
    print("✅ /api/reports/view/ Windows-style traversal blocked (404)")

if __name__ == "__main__":
    try:
        test_path_traversal_blocked()
        print("\n🛡️ Path Traversal security tests passed!")
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ An error occurred: {e}")
        sys.exit(1)
