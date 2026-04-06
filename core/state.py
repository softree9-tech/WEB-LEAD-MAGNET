from typing import TypedDict, Optional

class AgentState(TypedDict):
    # Input
    raw_name: str
    raw_email: str
    raw_company: str
    raw_role: str
    raw_website: str
    
    # Output
    output_row: dict
