from typing import List, Dict
from ..models.eligibility import EligibilityEvaluation, EligibilityStatus
from ..models.user_profile import UserProfile

STATUS_WEIGHTS: Dict[EligibilityStatus, float] = {
    EligibilityStatus.ELIGIBLE: 1000.0,
    EligibilityStatus.POSSIBLY_ELIGIBLE: 600.0,
    EligibilityStatus.NEAR_MISS: 400.0,
    EligibilityStatus.NOT_ELIGIBLE: 0.0,
}

def rank_evaluations(
    evaluations: List[EligibilityEvaluation],
    profile: UserProfile = None
) -> List[EligibilityEvaluation]:
    """
    Ranks scheme evaluations based on transparent factors:
      1. Eligibility match status (ELIGIBLE > POSSIBLY_ELIGIBLE > NEAR_MISS > NOT_ELIGIBLE)
      2. Rule compliance score (0-100)
      3. State relevance boost
      4. Occupation relevance boost
      5. High-impact benefit preference (Direct Cash, Housing, Health Insurance)
    """
    def ranking_key(item: EligibilityEvaluation) -> float:
        base_status_weight = STATUS_WEIGHTS.get(item.status, 0.0)
        score = item.score

        # Additional transparent factors
        bonus = 0.0
        if profile:
            # 1. State match
            if profile.state and any(s.lower() == profile.state.lower() for s in item.scheme.states):
                bonus += 15.0

            # 2. Direct occupation alignment
            if profile.occupation and item.scheme.rules.occupations:
                if profile.occupation in item.scheme.rules.occupations:
                    bonus += 20.0

            # 3. Direct financial benefit boost
            if item.scheme.benefit_type in ("Direct Cash Transfer", "Subsidy", "Insurance"):
                bonus += 10.0

        return base_status_weight + score + bonus

    return sorted(evaluations, key=ranking_key, reverse=True)
