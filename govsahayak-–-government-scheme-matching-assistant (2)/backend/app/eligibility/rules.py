from typing import List, Tuple, Dict, Any, Optional
from ..models.user_profile import UserProfile
from ..models.scheme import Scheme, SchemeRule
from ..models.eligibility import RuleEvaluationDetail
from .near_miss import (
    check_income_near_miss,
    check_age_near_miss,
    check_land_near_miss,
    check_disability_near_miss,
)

def evaluate_rules(scheme: Scheme, profile: UserProfile) -> Dict[str, Any]:
    """
    Deterministically evaluates all rules for a scheme against user profile.
    Returns:
      matched_rules: List[str]
      failed_rules: List[str]
      pending_rules: List[str]
      rule_details: List[RuleEvaluationDetail]
      fatal_count: int
      soft_count: int
      near_miss_detected: bool
      near_miss_reason: Optional[str]
      near_miss_change: Optional[str]
    """
    rules = scheme.rules
    matched_rules: List[str] = []
    failed_rules: List[str] = []
    pending_rules: List[str] = []
    rule_details: List[RuleEvaluationDetail] = []
    
    fatal_count = 0
    soft_count = 0
    near_miss_detected = False
    near_miss_reason = None
    near_miss_change = None

    # 1. AGE CHECK
    if rules.min_age is not None or rules.max_age is not None:
        min_age = rules.min_age if rules.min_age is not None else 0
        max_age = rules.max_age if rules.max_age is not None else 150
        req_val = f"{min_age}–{max_age if max_age < 150 else 'Any'} years"

        if profile.age is None:
            pending_rules.append(f"Age verification needed (Requires: {req_val})")
            soft_count += 1
            rule_details.append(RuleEvaluationDetail(
                criterion="Age Requirement",
                passed=False,
                userValue="Not specified",
                requiredValue=req_val,
                notes="Age needed for confirmation"
            ))
        else:
            if min_age <= profile.age <= max_age:
                matched_rules.append(f"Age requirement satisfied: {profile.age} years (Range: {req_val})")
                rule_details.append(RuleEvaluationDetail(
                    criterion="Age Requirement",
                    passed=True,
                    userValue=f"{profile.age} years",
                    requiredValue=req_val,
                ))
            else:
                is_nm, nm_r, nm_c = check_age_near_miss(profile.age, rules.min_age, rules.max_age)
                if is_nm:
                    near_miss_detected = True
                    near_miss_reason = nm_r
                    near_miss_change = nm_c
                    rule_details.append(RuleEvaluationDetail(
                        criterion="Age Requirement",
                        passed=False,
                        userValue=f"{profile.age} years",
                        requiredValue=req_val,
                        isNearMiss=True,
                        notes=nm_r
                    ))
                else:
                    fatal_count += 1
                    failed_rules.append(f"Age requirement not met: Current age is {profile.age} years (Scheme requires: {req_val})")
                    rule_details.append(RuleEvaluationDetail(
                        criterion="Age Requirement",
                        passed=False,
                        userValue=f"{profile.age} years",
                        requiredValue=req_val,
                        notes="Outside permissible age bracket"
                    ))

    # 2. GENDER CHECK
    if rules.allowed_genders and len(rules.allowed_genders) > 0 and "All" not in rules.allowed_genders:
        allowed = [g.strip() for g in rules.allowed_genders]
        req_val = ", ".join(allowed)
        if not profile.gender:
            pending_rules.append(f"Gender confirmation needed (Targeted for: {req_val})")
            soft_count += 1
        elif profile.gender in allowed:
            matched_rules.append(f"Gender requirement satisfied: {profile.gender} applicant")
            rule_details.append(RuleEvaluationDetail(
                criterion="Gender Target",
                passed=True,
                userValue=profile.gender,
                requiredValue=req_val,
            ))
        else:
            fatal_count += 1
            failed_rules.append(f"Gender requirement not met: Scheme is designated exclusively for {req_val}")
            rule_details.append(RuleEvaluationDetail(
                criterion="Gender Target",
                passed=False,
                userValue=profile.gender,
                requiredValue=req_val,
                notes="Gender mismatch"
            ))

    # 3. STATE / GEOGRAPHY CHECK
    is_all_india = any(s.lower() == "all india" for s in scheme.states)
    if not is_all_india:
        req_val = ", ".join(scheme.states)
        if not profile.state:
            pending_rules.append(f"State residency verification needed (Applicable in: {req_val})")
            soft_count += 1
        else:
            state_matched = any(s.strip().lower() == profile.state.strip().lower() for s in scheme.states)
            if state_matched:
                matched_rules.append(f"State requirement satisfied: Resident of {profile.state}")
                rule_details.append(RuleEvaluationDetail(
                    criterion="State Residency",
                    passed=True,
                    userValue=profile.state,
                    requiredValue=req_val,
                ))
            else:
                fatal_count += 1
                failed_rules.append(f"State requirement not met: Scheme active only in {req_val} (Your state: {profile.state})")
                rule_details.append(RuleEvaluationDetail(
                    criterion="State Residency",
                    passed=False,
                    userValue=profile.state,
                    requiredValue=req_val,
                    notes="State residency mismatch"
                ))
    else:
        matched_rules.append("National Coverage: All States & Union Territories of India eligible")
        rule_details.append(RuleEvaluationDetail(
            criterion="Geographic Scope",
            passed=True,
            userValue=profile.state or "All India Resident",
            requiredValue="All India",
        ))

    # 4. ANNUAL INCOME CEILING CHECK
    if rules.max_income is not None:
        max_inc = rules.max_income
        req_val = f"Up to ₹{int(max_inc):,}"
        if profile.annual_income is None:
            pending_rules.append(f"Annual income verification needed ({req_val})")
            soft_count += 1
            rule_details.append(RuleEvaluationDetail(
                criterion="Annual Income",
                passed=False,
                userValue="Not specified",
                requiredValue=req_val,
                notes="Income details required"
            ))
        else:
            if profile.annual_income <= max_inc:
                matched_rules.append(f"Income requirement satisfied: ₹{int(profile.annual_income):,} ({req_val})")
                rule_details.append(RuleEvaluationDetail(
                    criterion="Annual Income",
                    passed=True,
                    userValue=f"₹{int(profile.annual_income):,}",
                    requiredValue=req_val,
                ))
            else:
                is_nm, nm_r, nm_c = check_income_near_miss(profile.annual_income, max_inc)
                if is_nm:
                    near_miss_detected = True
                    near_miss_reason = nm_r
                    near_miss_change = nm_c
                    rule_details.append(RuleEvaluationDetail(
                        criterion="Annual Income",
                        passed=False,
                        userValue=f"₹{int(profile.annual_income):,}",
                        requiredValue=req_val,
                        isNearMiss=True,
                        notes=nm_r
                    ))
                else:
                    fatal_count += 1
                    failed_rules.append(f"Income limit exceeded: Annual income ₹{int(profile.annual_income):,} exceeds maximum cap of ₹{int(max_inc):,}")
                    rule_details.append(RuleEvaluationDetail(
                        criterion="Annual Income",
                        passed=False,
                        userValue=f"₹{int(profile.annual_income):,}",
                        requiredValue=req_val,
                        notes="Exceeds income threshold"
                    ))

    # 5. SOCIAL CATEGORY CHECK (SC / ST / OBC / EWS / Minority / General)
    if rules.eligible_categories and len(rules.eligible_categories) > 0:
        req_val = ", ".join(rules.eligible_categories)
        if not profile.category:
            pending_rules.append(f"Social category verification needed (Targeted: {req_val})")
            soft_count += 1
        elif profile.category in rules.eligible_categories:
            matched_rules.append(f"Category requirement satisfied: {profile.category} applicant")
            rule_details.append(RuleEvaluationDetail(
                criterion="Social Category",
                passed=True,
                userValue=profile.category,
                requiredValue=req_val,
            ))
        else:
            fatal_count += 1
            failed_rules.append(f"Category requirement not met: Scheme reserved for {req_val} (Your category: {profile.category})")
            rule_details.append(RuleEvaluationDetail(
                criterion="Social Category",
                passed=False,
                userValue=profile.category,
                requiredValue=req_val,
                notes="Restricted category"
            ))

    # 6. OCCUPATION CHECK
    if rules.occupations and len(rules.occupations) > 0:
        req_val = ", ".join(rules.occupations)
        if not profile.occupation:
            pending_rules.append(f"Occupation details needed (Targeted: {req_val})")
            soft_count += 1
        elif profile.occupation in rules.occupations:
            matched_rules.append(f"Occupation requirement satisfied: {profile.occupation}")
            rule_details.append(RuleEvaluationDetail(
                criterion="Target Occupation",
                passed=True,
                userValue=profile.occupation,
                requiredValue=req_val,
            ))
        else:
            # Check secondary flags (student, farmer, business)
            student_match = bool(rules.requires_student and profile.is_student)
            farmer_match = bool(rules.requires_farmer and profile.is_farmer)
            business_match = bool(rules.requires_business and profile.owns_business)

            if student_match or farmer_match or business_match:
                matched_rules.append(f"Role requirement satisfied through active activity profile ({profile.occupation})")
            else:
                fatal_count += 1
                failed_rules.append(f"Occupation requirement not met: Targeted for {req_val} (Your occupation: {profile.occupation})")
                rule_details.append(RuleEvaluationDetail(
                    criterion="Target Occupation",
                    passed=False,
                    userValue=profile.occupation or "Unspecified",
                    requiredValue=req_val,
                    notes="Occupation mismatch"
                ))

    # 7. STUDENT STATUS CHECK
    if rules.requires_student:
        if profile.is_student is None:
            pending_rules.append("Student enrollment confirmation needed")
            soft_count += 1
        elif profile.is_student:
            matched_rules.append("Student status confirmed: Currently enrolled in educational institution")
            rule_details.append(RuleEvaluationDetail(
                criterion="Student Status",
                passed=True,
                userValue="Currently Enrolled Student",
                requiredValue="Active Student",
            ))
        else:
            fatal_count += 1
            failed_rules.append("Requires applicant to be a currently enrolled student")
            rule_details.append(RuleEvaluationDetail(
                criterion="Student Status",
                passed=False,
                userValue="Not a student",
                requiredValue="Active Student",
                notes="Non-student applicant"
            ))

    # 8. FARMER & LAND SIZE CHECK
    if rules.requires_farmer:
        if profile.is_farmer is None:
            pending_rules.append("Agricultural status confirmation needed")
            soft_count += 1
        elif profile.is_farmer:
            matched_rules.append("Farmer status confirmed: Practicing agricultural cultivator")
            rule_details.append(RuleEvaluationDetail(
                criterion="Farmer Status",
                passed=True,
                userValue="Active Farmer",
                requiredValue="Agricultural Farmer",
            ))
            # Land size check
            if rules.max_land_acres is not None and profile.land_size_acres is not None:
                if profile.land_size_acres <= rules.max_land_acres:
                    matched_rules.append(f"Landholding within limit: {profile.land_size_acres} acres (Max: {rules.max_land_acres} acres)")
                else:
                    is_nm, nm_r, nm_c = check_land_near_miss(profile.land_size_acres, rules.max_land_acres)
                    if is_nm:
                        near_miss_detected = True
                        near_miss_reason = nm_r
                        near_miss_change = nm_c
                    else:
                        fatal_count += 1
                        failed_rules.append(f"Landholding exceeds limit: {profile.land_size_acres} acres (Scheme cap: {rules.max_land_acres} acres)")
        else:
            fatal_count += 1
            failed_rules.append("Requires applicant to be an active farmer or agricultural landholder")
            rule_details.append(RuleEvaluationDetail(
                criterion="Farmer Status",
                passed=False,
                userValue="Non-farmer",
                requiredValue="Active Farmer",
                notes="Must be farmer"
            ))

    # 9. DISABILITY CHECK
    if rules.requires_disability:
        if profile.is_disabled is None:
            pending_rules.append("Disability / UDID status needs confirmation")
            soft_count += 1
        elif profile.is_disabled:
            matched_rules.append("Disability criterion satisfied: Benchmark PwD / UDID card holder")
            rule_details.append(RuleEvaluationDetail(
                criterion="Disability Status",
                passed=True,
                userValue="Yes (PwD / UDID)",
                requiredValue="Benchmark Disability 40%+",
            ))
        else:
            fatal_count += 1
            failed_rules.append("Designated exclusively for Persons with Benchmark Disabilities (PwD 40%+)")
            rule_details.append(RuleEvaluationDetail(
                criterion="Disability Status",
                passed=False,
                userValue="Not disabled",
                requiredValue="UDID / PwD Certificate 40%+",
                notes="Disability certificate required"
            ))

    # 10. BPL / EWS REQUIREMENT CHECK
    if rules.requires_bpl:
        if profile.has_bpl_card is None and profile.annual_income is None:
            pending_rules.append("BPL / Ration card or low-income status confirmation needed")
            soft_count += 1
        elif profile.has_bpl_card or (profile.annual_income is not None and profile.annual_income <= 180000):
            matched_rules.append("BPL / Low-Income economic category satisfied")
            rule_details.append(RuleEvaluationDetail(
                criterion="Economic Need",
                passed=True,
                userValue="BPL Card / Income below threshold",
                requiredValue="BPL or EWS",
            ))
        else:
            fatal_count += 1
            failed_rules.append("Requires applicant household to hold valid BPL / Antyodaya Ration Card or verified low income")

    # 11. BUSINESS OWNERSHIP CHECK
    if rules.requires_business:
        if profile.owns_business is None:
            pending_rules.append("Micro/small business or artisan establishment status needed")
            soft_count += 1
        elif profile.owns_business:
            matched_rules.append("Enterprise / Business ownership satisfied")
            rule_details.append(RuleEvaluationDetail(
                criterion="Business Status",
                passed=True,
                userValue=profile.business_type or "Registered Business",
                requiredValue="Self-Employed / MSME",
            ))
        else:
            # Some schemes allow aspiring entrepreneurs
            pass

    return {
        "matched_rules": matched_rules,
        "failed_rules": failed_rules,
        "pending_rules": pending_rules,
        "rule_details": rule_details,
        "fatal_count": fatal_count,
        "soft_count": soft_count,
        "near_miss_detected": near_miss_detected,
        "near_miss_reason": near_miss_reason,
        "near_miss_change": near_miss_change,
    }
