from typing import TypedDict, List, Dict, Any, Optional

class AgentState(TypedDict):
    """
    LangGraph State Schema for GovSahayak Scheme Agent.
    Tracks state through the end-to-end welfare discovery pipeline.
    """
    user_message: str
    language: str
    profile: Dict[str, Any]
    intent: str
    missing_fields: List[str]
    retrieved_schemes: List[Dict[str, Any]]
    evaluations: List[Dict[str, Any]]
    near_misses: List[Dict[str, Any]]
    ranked_evaluations: List[Dict[str, Any]]
    gemini_explanation: str
    suggested_questions: List[str]
    final_response: Dict[str, Any]
