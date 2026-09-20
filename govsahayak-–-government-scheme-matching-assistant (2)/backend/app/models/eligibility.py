from typing import Optional, List, Any
from enum import Enum
from pydantic import BaseModel, Field
from .scheme import Scheme
from .user_profile import UserProfile

class EligibilityStatus(str, Enum):
    ELIGIBLE = "ELIGIBLE"
    POSSIBLY_ELIGIBLE = "POSSIBLY_ELIGIBLE"
    NEAR_MISS = "NEAR_MISS"
    NOT_ELIGIBLE = "NOT_ELIGIBLE"

class RuleEvaluationDetail(BaseModel):
    criterion: str
    passed: bool
    userValue: str
    requiredValue: str
    isNearMiss: Optional[bool] = False
    notes: Optional[str] = None

class EligibilityEvaluation(BaseModel):
    schemeId: str
    scheme: Scheme
    status: EligibilityStatus
    score: float = 0.0
    matched_rules: List[str] = Field(default_factory=list)
    failed_rules: List[str] = Field(default_factory=list)
    reasons: List[str] = Field(default_factory=list)
    required_changes: Optional[str] = None
    
    # Frontend aliases/compatible fields
    matchedReasons: List[str] = Field(default_factory=list)
    failedReasons: List[str] = Field(default_factory=list)
    pendingReasons: Optional[List[str]] = None
    nearMissExplanation: Optional[str] = None
    requiredChange: Optional[str] = None
    ruleDetails: List[RuleEvaluationDetail] = Field(default_factory=list)

class EligibilityCheckRequest(BaseModel):
    profile: UserProfile

class EligibilityCheckResponse(BaseModel):
    evaluations: List[EligibilityEvaluation]
    total: int
    eligible_count: int
    possibly_eligible_count: int
    near_miss_count: int
