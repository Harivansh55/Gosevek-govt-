from typing import Dict, Any
from langgraph.graph import StateGraph, START, END
from .state import AgentState
from .nodes import (
    understand_user_message,
    extract_update_profile,
    check_missing_information,
    retrieve_relevant_schemes,
    run_python_eligibility_engine,
    detect_near_miss,
    rank_results,
    generate_gemini_explanation,
)

def create_scheme_agent_graph():
    """
    Builds the official GovSahayak LangGraph StateGraph pipeline:
      START
        ↓
      understand_user_message
        ↓
      extract_update_profile
        ↓
      check_missing_information
        ↓
      retrieve_relevant_schemes
        ↓
      run_python_eligibility_engine
        ↓
      detect_near_miss
        ↓
      rank_results
        ↓
      generate_gemini_explanation
        ↓
      END
    """
    builder = StateGraph(AgentState)

    # Add all nodes
    builder.add_node("understand_user_message", understand_user_message)
    builder.add_node("extract_update_profile", extract_update_profile)
    builder.add_node("check_missing_information", check_missing_information)
    builder.add_node("retrieve_relevant_schemes", retrieve_relevant_schemes)
    builder.add_node("run_python_eligibility_engine", run_python_eligibility_engine)
    builder.add_node("detect_near_miss", detect_near_miss)
    builder.add_node("rank_results", rank_results)
    builder.add_node("generate_gemini_explanation", generate_gemini_explanation)

    # Add edges
    builder.add_edge(START, "understand_user_message")
    builder.add_edge("understand_user_message", "extract_update_profile")
    builder.add_edge("extract_update_profile", "check_missing_information")
    builder.add_edge("check_missing_information", "retrieve_relevant_schemes")
    builder.add_edge("retrieve_relevant_schemes", "run_python_eligibility_engine")
    builder.add_edge("run_python_eligibility_engine", "detect_near_miss")
    builder.add_edge("detect_near_miss", "rank_results")
    builder.add_edge("rank_results", "generate_gemini_explanation")
    builder.add_edge("generate_gemini_explanation", END)

    return builder.compile()

# Global compiled agent instance
_agent_instance = None

def get_langgraph_agent():
    global _agent_instance
    if _agent_instance is None:
        _agent_instance = create_scheme_agent_graph()
    return _agent_instance

def run_scheme_agent(user_message: str, profile: Dict[str, Any], language: str = "en") -> Dict[str, Any]:
    """Convenience runner for LangGraph workflow."""
    agent = get_langgraph_agent()
    initial_state: AgentState = {
        "user_message": user_message,
        "language": language,
        "profile": profile or {},
        "intent": "",
        "missing_fields": [],
        "retrieved_schemes": [],
        "evaluations": [],
        "near_misses": [],
        "ranked_evaluations": [],
        "gemini_explanation": "",
        "suggested_questions": [],
        "final_response": {},
    }
    final_state = agent.invoke(initial_state)
    return final_state.get("final_response", {})
