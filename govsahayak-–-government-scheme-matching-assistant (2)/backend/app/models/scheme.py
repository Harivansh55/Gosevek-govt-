from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class SchemeRule(BaseModel):
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    allowed_genders: Optional[List[str]] = None
    states: Optional[List[str]] = None
    occupations: Optional[List[str]] = None
    max_income: Optional[float] = None
    min_income: Optional[float] = None
    eligible_categories: Optional[List[str]] = None
    requires_student: Optional[bool] = None
    requires_farmer: Optional[bool] = None
    max_land_acres: Optional[float] = None
    requires_business: Optional[bool] = None
    requires_disability: Optional[bool] = None
    requires_bpl: Optional[bool] = None
    marital_statuses: Optional[List[str]] = None
    education_levels: Optional[List[str]] = None

class Scheme(BaseModel):
    id: str
    name: str
    hindi_name: Optional[str] = None
    department: str
    ministry: str
    category: str
    level: str = "Central"
    states: List[str] = Field(default_factory=lambda: ["All India"])
    benefits: str
    benefit_type: str
    estimated_benefit_amount: Optional[str] = None
    rules: SchemeRule = Field(default_factory=SchemeRule)
    documents: List[str] = Field(default_factory=list)
    application_process: List[str] = Field(default_factory=list)
    application_url: str = ""
    source_url: str = ""
    last_verified: str = "2026-03-01"
    tags: List[str] = Field(default_factory=list)
    overview: str = ""
