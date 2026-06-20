from fastapi.testclient import TestClient
import os
import sys

# Add the current directory to sys.path to import the app
sys.path.append(os.getcwd())

from main import app

client = TestClient(app)

def test_path_traversal_view_report():
    # Attempt to access main.py via path traversal
    response = client.get("/api/reports/view/../../main.py")

    # If the vulnerability is fixed, it should return 404 Not Found
    # because os.path.basename("../../main.py") results in "main.py"
    # and /app/data/pdfs/main.py does not exist.
    assert response.status_code == 404, f"Vulnerability still present! Got status {response.status_code} for path traversal attempt."

def test_path_traversal_download_report():
    response = client.get("/api/reports/download/../../main.py")
    assert response.status_code == 404, f"Vulnerability still present in download endpoint! Got status {response.status_code}."

if __name__ == "__main__":
    try:
        test_path_traversal_view_report()
        test_path_traversal_download_report()
        print("✅ Path traversal security tests passed!")
    except AssertionError as e:
        print(f"❌ Test failed: {e}")
        sys.exit(1)
