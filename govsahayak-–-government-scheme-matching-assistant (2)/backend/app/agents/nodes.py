import re
from typing import Dict, Any, List
from .state import AgentState
from ..models.user_profile import UserProfile
from ..models.scheme import Scheme
from ..models.eligibility import EligibilityStatus, EligibilityEvaluation
from ..services.scheme_service import get_scheme_service
from ..services.ranking import rank_evaluations
from ..services.gemini import get_gemini_service
from ..eligibility.engine import evaluate_scheme_eligibility

def understand_user_message(state: AgentState) -> Dict[str, Any]:
    """Node 1: Understands user query, detects intent, and normalizes text."""
    msg = state.get("user_message", "").strip()
    msg_lower = msg.lower()
    
    intent = "general_query"
    if any(w in msg_lower for w in ["eligible", "qualify", "can i get", "am i", "patrata"]):
        intent = "eligibility_check"
    elif any(w in msg_lower for w in ["document", "kagaz", "praman patra", "proof", "apply", "form"]):
        intent = "document_guidance"
    elif any(w in msg_lower for w in ["farmer", "kisan", "student", "scholarship", "housing", "awas"]):
        intent = "scheme_discovery"

    return {"intent": intent}

def extract_update_profile(state: AgentState) -> Dict[str, Any]:
    """Node 2: Extracts / updates citizen demographic profile from the message."""
    profile_data = dict(state.get("profile") or {})
    msg = state.get("user_message", "").lower()

    # Age extraction: "24 years", "age 24", "24 saal"
    age_match = re.search(r"\b(?:age\s*[:=]?\s*|im\s+|i am\s+)?(\d{1,2})\s*(?:years|yr|saal|sal)?\b", msg)
    if age_match and "age" not in profile_data:
        try:
            val = int(age_match.group(1))
            if 5 <= val <= 100:
                profile_data["age"] = val
        except ValueError:
            pass

    # Farmer detection
    if any(w in msg for w in ["farmer", "kisan", "kheti", "agriculture"]):
        profile_data["is_farmer"] = True
        profile_data["occupation"] = "Farmer"

    # Student detection
    if any(w in msg for w in ["student", "college", "school", "vidyarthi", "scholarship"]):
        profile_data["is_student"] = True
        profile_data["occupation"] = "Student"

    # Business / Artisan
    if any(w in msg for w in ["artisan", "karigar", "vishwakarma"]):
        profile_data["occupation"] = "Artisan / Craftsperson"
        profile_data["owns_business"] = True
    elif any(w in msg for w in ["business", "shop", "vyapar", "dukaan", "startup"]):
        profile_data["owns_business"] = True
        profile_data["occupation"] = "Entrepreneur"

    # Gender
    if any(w in msg for w in ["female", "woman", "mahila", "girl"]):
        profile_data["gender"] = "Female"
    elif any(w in msg for w in ["male", "man", "purush", "boy"]):
        profile_data["gender"] = "Male"

    # Disability
    if any(w in msg for w in ["disabled", "handicap", "divyang", "pwd", "udid"]):
        profile_data["is_disabled"] = True

    # State extraction
    indian_states = [
        "Uttar Pradesh", "Bihar", "Rajasthan", "Madhya Pradesh", "Maharashtra",
        "Gujarat", "Punjab", "Haryana", "Karnataka", "Tamil Nadu", "West Bengal",
        "Odisha", "Kerala", "Telangana", "Andhra Pradesh", "Assam", "Delhi"
    ]
    for st in indian_states:
        if st.lower() in msg:
            profile_data["state"] = st
            break

    return {"profile": profile_data}

def check_missing_information(state: AgentState) -> Dict[str, Any]:
    """Node 3: Identifies missing demographic fields needed for high-confidence eligibility."""
    prof = state.get("profile") or {}
    missing = []
    if not prof.get("age"):
        missing.append("age")
    if not prof.get("state"):
        missing.append("state")
    if not prof.get("annual_income"):
        missing.append("annual_income")
    if not prof.get("occupation"):
        missing.append("occupation")
    if not prof.get("category"):
        missing.append("category")
    return {"missing_fields": missing}

def retrieve_relevant_schemes(state: AgentState) -> Dict[str, Any]:
    """Node 4: Uses FAISS embedding RAG to retrieve top scheme candidates."""
    service = get_scheme_service()
    query = state.get("user_message", "")
    profile_dict = state.get("profile") or {}
    user_prof = UserProfile(**profile_dict) if profile_dict else UserProfile()

    # RAG vector similarity retrieval
    retrieved_tuples = service.retriever.retrieve(query=query, profile=user_prof, top_k=8)
    
    # If query returned few results, backfill with profile retrieval
    if len(retrieved_tuples) < 4:
        backfill = service.retriever.retrieve_by_profile(user_prof, top_k=8)
        seen_ids = {s.id for s, _ in retrieved_tuples}
        for s, score in backfill:
            if s.id not in seen_ids:
                retrieved_tuples.append((s, score))

    retrieved_schemes = [s.model_dump() for s, _ in retrieved_tuples]
    return {"retrieved_schemes": retrieved_schemes}

def run_python_eligibility_engine(state: AgentState) -> Dict[str, Any]:
    """
    Node 5: Runs deterministic Python Rule Engine on all candidate schemes.
    The Python Rule Engine is the ONLY source of truth for eligibility.
    """
    profile_dict = state.get("profile") or {}
    user_prof = UserProfile(**profile_dict)
    
    raw_schemes = state.get("retrieved_schemes", [])
    evaluations: List[Dict[str, Any]] = []

    for item in raw_schemes:
        scheme_obj = Scheme(**item)
        eval_result = evaluate_scheme_eligibility(scheme_obj, user_prof)
        evaluations.append(eval_result.model_dump())

    return {"evaluations": evaluations}

def detect_near_miss(state: AgentState) -> Dict[str, Any]:
    """Node 6: Filters and flags near-miss schemes with required changes."""
    evals = state.get("evaluations", [])
    near_misses = [ev for ev in evals if ev.get("status") == EligibilityStatus.NEAR_MISS.value]
    return {"near_misses": near_misses}

def rank_results(state: AgentState) -> Dict[str, Any]:
    """Node 7: Ranks results using transparent Python multi-factor ranking."""
    evals_raw = state.get("evaluations", [])
    profile_dict = state.get("profile") or {}
    user_prof = UserProfile(**profile_dict)

    eval_objects = [EligibilityEvaluation(**item) for item in evals_raw]
    ranked = rank_evaluations(eval_objects, user_prof)
    
    return {"ranked_evaluations": [r.model_dump() for r in ranked]}

def generate_gemini_explanation(state: AgentState) -> Dict[str, Any]:
    """
    Node 8: Uses Gemini to generate conversational explanation grounded in Python rule determinations.
    Gemini NEVER alters the eligibility status.
    """
    gemini = get_gemini_service()
    query = state.get("user_message", "")
    language = state.get("language", "en")
    profile_dict = state.get("profile") or {}
    user_prof = UserProfile(**profile_dict)

    ranked_raw = state.get("ranked_evaluations", [])
    ranked_objects = [EligibilityEvaluation(**item) for item in ranked_raw]
    schemes = [r.scheme for r in ranked_objects]

    chat_out = gemini.generate_chat_response(
        query=query,
        profile=user_prof,
        retrieved_schemes=schemes,
        evaluations=ranked_objects,
        language=language,
    )

    final_resp = {
        "answer": chat_out.get("answer", ""),
        "groundedSchemes": chat_out.get("groundedSchemes", schemes[:4]),
        "suggestedQuestions": chat_out.get("suggestedQuestions", []),
        "ranked_evaluations": [r.model_dump() for r in ranked_objects],
        "near_misses": state.get("near_misses", []),
        "profile": profile_dict,
    }

    return {
        "gemini_explanation": chat_out.get("answer", ""),
        "suggested_questions": chat_out.get("suggestedQuestions", []),
        "final_response": final_resp,
    }
