from typing import Optional, List, Literal
from pydantic import BaseModel, Field

GenderType = Literal["Male", "Female", "Transgender", "All"]
OccupationType = Literal[
    "Student",
    "Farmer",
    "Entrepreneur",
    "Self-Employed",
    "Salaried Employee",
    "Daily Wage Worker / Laborer",
    "Artisan / Craftsperson",
    "Unemployed",
    "Homemaker",
    "Senior Citizen / Retired",
    "Other",
]
SocialCategory = Literal["General", "OBC", "SC", "ST", "EWS", "Minority"]
ResidenceType = Literal["Rural", "Urban"]
EducationLevel = Literal[
    "School", "Undergraduate", "Postgraduate", "Vocational", "Diploma", "None"
]
MaritalStatus = Literal["Single", "Married", "Widowed", "Divorced"]

class UserProfile(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    residenceType: Optional[str] = None
    occupation: Optional[str] = None
    annual_income: Optional[float] = None
    category: Optional[str] = None
    is_student: Optional[bool] = None
    education_level: Optional[str] = None
    is_farmer: Optional[bool] = None
    land_size_acres: Optional[float] = None
    owns_business: Optional[bool] = None
    business_type: Optional[str] = None
    annual_turnover: Optional[float] = None
    is_disabled: Optional[bool] = None
    disability_percentage: Optional[float] = None
    marital_status: Optional[str] = None
    family_members: Optional[int] = None
    has_bpl_card: Optional[bool] = None
    special_conditions: Optional[List[str]] = Field(default_factory=list)
