import sys
import os
sys.path.append('.')
from agents.website_analyzer import website_analyzer_agent
from core.state import AgentState

# Test with an UNSAFE URL to verify the new security check
state = AgentState(raw_website="http://localhost")
try:
    print("--- Testing UNSAFE URL (localhost) ---")
    result = website_analyzer_agent(state)
    print("OUTPUT:", result)
    assert "error" in result["output_row"]
    assert result["output_row"]["error"] == "URL blocked for security reasons"
    print("✅ Unsafe URL correctly blocked by agent!")
except Exception as e:
    print("❌ EXCEPTION during unsafe URL test:")
    import traceback
    traceback.print_exc()
    sys.exit(1)
