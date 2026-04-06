from langgraph.graph import StateGraph, START, END
from core.state import AgentState
from agents.website_analyzer import website_analyzer_agent

def build_graph():
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("website_analyzer", website_analyzer_agent)
    
    # Add edges
    workflow.add_edge(START, "website_analyzer")
    workflow.add_edge("website_analyzer", END)
    
    # Compile the graph
    app = workflow.compile()
    return app

# Singleton-like instance to be imported by the API
graph_app = build_graph()
