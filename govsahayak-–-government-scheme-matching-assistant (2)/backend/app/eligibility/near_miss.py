from typing import Optional, Tuple
from ..models.user_profile import UserProfile
from ..models.scheme import SchemeRule

def check_income_near_miss(user_income: float, max_income: float) -> Tuple[bool, Optional[str], Optional[str]]:
    """Checks if income is deterministically within near-miss threshold (<= 18% over limit)."""
    if user_income <= max_income:
        return False, None, None
    
    diff = user_income - max_income
    percent_over = (diff / max_income) * 100.0
    
    if percent_over <= 18.0:
        reason = f"Annual income of ₹{int(user_income):,} is ₹{int(diff):,} ({percent_over:.1f}%) above the stated limit of ₹{int(max_income):,}."
        required_change = f"Income must satisfy the scheme's stated limit of ₹{int(max_income):,}. Check if statutory deductions or gross vs net calculations apply."
        return True, reason, required_change
        
    return False, None, None

def check_age_near_miss(user_age: int, min_age: Optional[int], max_age: Optional[int]) -> Tuple[bool, Optional[str], Optional[str]]:
    """Checks if age is within 1-2 years of upper/lower bounds."""
    if min_age is not None and user_age < min_age:
        diff = min_age - user_age
        if diff <= 2:
            reason = f"Age is {user_age} years, which is {diff} year{'s' if diff > 1 else ''} below the minimum age of {min_age}."
            required_change = f"You will become eligible once you turn {min_age} years old."
            return True, reason, required_change
            
    if max_age is not None and user_age > max_age:
        diff = user_age - max_age
        if diff <= 2:
            reason = f"Age is {user_age} years, which is {diff} year{'s' if diff > 1 else ''} past the maximum age limit of {max_age}."
            required_change = f"Applicant must be at or below {max_age} years as of the official application cut-off date."
            return True, reason, required_change
            
    return False, None, None

def check_land_near_miss(user_land: float, max_land: float) -> Tuple[bool, Optional[str], Optional[str]]:
    """Checks if land size is within 10% above threshold."""
    if user_land <= max_land:
        return False, None, None
        
    diff = user_land - max_land
    percent_over = (diff / max_land) * 100.0
    if percent_over <= 15.0:
        reason = f"Landholding of {user_land} acres is {diff:.2f} acres ({percent_over:.1f}%) above the {max_land} acres ceiling."
        required_change = f"Scheme applies to small/marginal farmers with up to {max_land} acres recorded in revenue records."
        return True, reason, required_change
        
    return False, None, None

def check_disability_near_miss(user_percentage: float, required_percentage: float = 40.0) -> Tuple[bool, Optional[str], Optional[str]]:
    """Checks if certified disability is slightly below 40% benchmark."""
    if user_percentage >= required_percentage:
        return False, None, None
    if user_percentage >= 35.0:
        reason = f"Disability rating of {user_percentage}% is slightly below the statutory benchmark of {required_percentage}%."
        required_change = f"Requires a valid UDID certificate with {required_percentage}%+ benchmark disability."
        return True, reason, required_change
    return False, None, None

def check_near_miss(rule: SchemeRule, profile: UserProfile) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Evaluates all near-miss criteria deterministically.
    Returns: (is_near_miss, reason, required_change)
    """
    # 1. Income
    if rule.max_income is not None and profile.annual_income is not None:
        is_nm, reason, req_ch = check_income_near_miss(profile.annual_income, rule.max_income)
        if is_nm:
            return True, reason, req_ch

    # 2. Age
    if profile.age is not None and (rule.min_age is not None or rule.max_age is not None):
        is_nm, reason, req_ch = check_age_near_miss(profile.age, rule.min_age, rule.max_age)
        if is_nm:
            return True, reason, req_ch

    # 3. Land
    if rule.max_land_acres is not None and profile.land_size_acres is not None:
        is_nm, reason, req_ch = check_land_near_miss(profile.land_size_acres, rule.max_land_acres)
        if is_nm:
            return True, reason, req_ch

    # 4. Disability percentage
    if rule.requires_disability and profile.disability_percentage is not None:
        is_nm, reason, req_ch = check_disability_near_miss(profile.disability_percentage)
        if is_nm:
            return True, reason, req_ch

    return False, None, None
