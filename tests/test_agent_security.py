import sys
import os
from unittest.mock import MagicMock, patch

# Add root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from agents.website_analyzer import website_analyzer_agent
from core.state import AgentState

def test_website_analyzer_agent_ssrf_protection():
    # Unsafe URL
    state = AgentState(raw_website="http://localhost")

    # We don't want it to actually run anything
    with patch('agents.website_analyzer.sync_playwright') as mock_playwright, \
         patch('agents.website_analyzer.requests.get') as mock_requests:

        result = website_analyzer_agent(state)

        # It should return early with an error
        assert result["output_row"]["error"] == "Unsafe URL"
        assert result["output_row"]["website"] == "http://localhost"

        # Ensure it didn't call playwright or requests
        mock_playwright.assert_not_called()
        mock_requests.assert_not_called()

    print("✅ website_analyzer_agent SSRF protection verified.")

if __name__ == "__main__":
    try:
        test_website_analyzer_agent_ssrf_protection()
    except AssertionError as e:
        print(f"❌ Verification failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ An error occurred: {e}")
        sys.exit(1)
