from typing import List
from ..models.scheme import Scheme
from ..models.user_profile import UserProfile
from ..models.eligibility import (
    EligibilityStatus,
    EligibilityEvaluation,
)
from .rules import evaluate_rules

def evaluate_scheme_eligibility(scheme: Scheme, profile: UserProfile) -> EligibilityEvaluation:
    """
    Python Deterministic Rule-Based Eligibility Engine.
    This is the SOLE source of truth for citizen welfare eligibility.
    Evaluates:
      - Age
      - Gender
      - State / Territory
      - Annual income
      - Occupation
      - Student status
      - Farmer status & land size
      - Category (SC/ST/OBC/EWS/Minority/General)
      - Disability (PwD / UDID)
      - BPL / Economic status
      - Business ownership
    """
    res = evaluate_rules(scheme, profile)
    
    matched_rules = res["matched_rules"]
    failed_rules = res["failed_rules"]
    pending_rules = res["pending_rules"]
    rule_details = res["rule_details"]
    fatal_count = res["fatal_count"]
    soft_count = res["soft_count"]
    near_miss = res["near_miss_detected"]
    near_miss_reason = res["near_miss_reason"]
    near_miss_change = res["near_miss_change"]

    # Determine status deterministically
    if fatal_count == 0 and not near_miss and soft_count == 0:
        status = EligibilityStatus.ELIGIBLE
    elif fatal_count == 0 and not near_miss and soft_count > 0:
        status = EligibilityStatus.POSSIBLY_ELIGIBLE
    elif fatal_count == 0 and near_miss:
        status = EligibilityStatus.NEAR_MISS
    elif fatal_count == 1 and near_miss:
        # Near miss on one parameter with rest compliant
        status = EligibilityStatus.NEAR_MISS
    else:
        status = EligibilityStatus.NOT_ELIGIBLE

    # Compute ranking score (0 to 100)
    if status == EligibilityStatus.ELIGIBLE:
        score = 80.0 + min(20.0, len(matched_rules) * 3.0)
    elif status == EligibilityStatus.POSSIBLY_ELIGIBLE:
        score = 60.0 + min(18.0, len(matched_rules) * 2.0)
    elif status == EligibilityStatus.NEAR_MISS:
        score = 45.0 + min(15.0, len(matched_rules) * 2.0)
    else:
        score = max(5.0, min(30.0, len(matched_rules) * 2.0 - fatal_count * 5.0))

    # Occupation boost
    if profile.occupation and scheme.rules.occupations:
        if profile.occupation in scheme.rules.occupations:
            score += 5.0

    # State boost
    if profile.state and any(s.lower() == profile.state.lower() for s in scheme.states):
        score += 4.0

    score = min(100.0, max(0.0, score))

    # Build unified reasons list
    reasons: List[str] = []
    if status == EligibilityStatus.ELIGIBLE:
        reasons.extend(matched_rules)
    elif status == EligibilityStatus.NEAR_MISS:
        if near_miss_reason:
            reasons.append(near_miss_reason)
        reasons.extend(matched_rules)
    elif status == EligibilityStatus.POSSIBLY_ELIGIBLE:
        reasons.extend(pending_rules)
        reasons.extend(matched_rules)
    else:
        reasons.extend(failed_rules)

    return EligibilityEvaluation(
        schemeId=scheme.id,
        scheme=scheme,
        status=status,
        score=round(score, 1),
        matched_rules=matched_rules,
        failed_rules=failed_rules,
        reasons=reasons,
        required_changes=near_miss_change,
        # Frontend compatibility fields
        matchedReasons=matched_rules,
        failedReasons=failed_rules,
        pendingReasons=pending_rules if len(pending_rules) > 0 else None,
        nearMissExplanation=near_miss_reason,
        requiredChange=near_miss_change,
        ruleDetails=rule_details,
    )

def evaluate_all_schemes(schemes: List[Scheme], profile: UserProfile) -> List[EligibilityEvaluation]:
    """Evaluates user profile across all provided schemes."""
    return [evaluate_scheme_eligibility(scheme, profile) for scheme in schemes]
