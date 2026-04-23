import sys
from dotenv import load_dotenv
load_dotenv()
sys.path.append('.')
from agents.website_analyzer import website_analyzer_agent
from core.state import AgentState

state = AgentState(raw_website="https://softreetechnology.com/")
try:
    result = website_analyzer_agent(state)
    print("FINAL OUTPUT:", result)
except Exception as e:
    print("EXCEPTION:")
    import traceback
    traceback.print_exc()
