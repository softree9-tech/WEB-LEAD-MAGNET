import pytest
from fastapi.testclient import TestClient
import os
from main import app

client = TestClient(app)

def test_api_view_report_path_traversal_normalized():
    # FastAPI/Starlette TestClient normalizes paths, so ../../ reaches as /api/main.py
    # which doesn't match the route. This results in standard 404 Not Found.
    filename = "../../main.py"
    response = client.get(f"/api/reports/view/{filename}")
    assert response.status_code == 404
    assert response.json() == {"detail": "Not Found"}

def test_api_view_report_sanitization():
    # If we pass something that matches the route but contains a path separator,
    # os.path.basename should strip it.
    # Note: Depending on the router, 'subdir/test.pdf' might not match {filename}
    # unless it's a path parameter. In FastAPI {filename} is a string and doesn't match slashes.

    # Let's try to see if we can get a traversal string past the router.
    # If the router doesn't allow slashes in {filename}, then traversal is already partially mitigated.
    pass

def test_api_view_report_valid():
    # Create a dummy pdf file
    pdf_dir = os.path.join(os.path.dirname(__file__), "..", "data", "pdfs")
    os.makedirs(pdf_dir, exist_ok=True)
    pdf_path = os.path.join(pdf_dir, "test_report.pdf")
    with open(pdf_path, "w") as f:
        f.write("test content")

    try:
        response = client.get("/api/reports/view/test_report.pdf")
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
    finally:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
