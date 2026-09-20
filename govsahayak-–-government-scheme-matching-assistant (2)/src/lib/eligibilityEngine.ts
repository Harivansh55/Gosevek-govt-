import { Scheme, UserProfile, EligibilityEvaluation, RuleEvaluationDetail, EligibilityStatus } from '../types';

export function evaluateSchemeEligibility(scheme: Scheme, profile: UserProfile): EligibilityEvaluation {
  const ruleDetails: RuleEvaluationDetail[] = [];
  const matchedReasons: string[] = [];
  const failedReasons: string[] = [];
  const pendingReasons: string[] = [];

  let nearMissExplanation: string | undefined = undefined;
  let requiredChange: string | undefined = undefined;
  let hasNearMiss = false;
  let fatalFailureCount = 0;
  let softMissingCount = 0;

  const rules = scheme.rules;

  // 1. Age Check
  if (rules.min_age !== undefined || rules.max_age !== undefined) {
    if (profile.age === undefined) {
      pendingReasons.push(`Age information needed (Requires ${rules.min_age ?? 0} to ${rules.max_age ?? 'No limit'} years)`);
      softMissingCount++;
      ruleDetails.push({
        criterion: 'Age Requirement',
        passed: false,
        userValue: 'Not specified',
        requiredValue: `${rules.min_age ?? 0}–${rules.max_age ?? 'Any'} years`,
        notes: 'Needs user age input'
      });
    } else {
      const minAge = rules.min_age ?? 0;
      const maxAge = rules.max_age ?? 150;
      const userAge = profile.age;

      if (userAge >= minAge && userAge <= maxAge) {
        matchedReasons.push(`Age requirement satisfied (${userAge} years is between ${minAge} and ${maxAge === 150 ? 'above' : maxAge} years)`);
        ruleDetails.push({
          criterion: 'Age Requirement',
          passed: true,
          userValue: `${userAge} years`,
          requiredValue: `${minAge}–${maxAge === 150 ? 'above' : maxAge} years`,
        });
      } else {
        // Check if it's a near miss (within 2 years)
        const isNear = (userAge < minAge && minAge - userAge <= 2) || (userAge > maxAge && userAge - maxAge <= 2);
        if (isNear) {
          hasNearMiss = true;
          const diff = userAge < minAge ? `${minAge - userAge} year(s) younger than minimum (${minAge})` : `${userAge - maxAge} year(s) older than maximum (${maxAge})`;
          nearMissExplanation = `Age criterion: You are ${userAge} years old, which is just ${diff}.`;
          requiredChange = userAge < minAge ? `Eligible once you turn ${minAge} years old.` : `Age must be within ${minAge}–${maxAge} years at the time of application cutoff.`;
          ruleDetails.push({
            criterion: 'Age Requirement',
            passed: false,
            userValue: `${userAge} years`,
            requiredValue: `${minAge}–${maxAge} years`,
            isNearMiss: true,
            notes: diff
          });
        } else {
          fatalFailureCount++;
          failedReasons.push(`Age criterion not met: Your age is ${userAge} years (Scheme requires ${minAge}–${maxAge} years).`);
          ruleDetails.push({
            criterion: 'Age Requirement',
            passed: false,
            userValue: `${userAge} years`,
            requiredValue: `${minAge}–${maxAge} years`,
            notes: 'Exceeds age limits'
          });
        }
      }
    }
  }

  // 2. Gender Check
  if (rules.allowed_genders && rules.allowed_genders.length > 0) {
    if (!rules.allowed_genders.includes('All')) {
      if (!profile.gender) {
        pendingReasons.push(`Gender requirement needs confirmation (Requires: ${rules.allowed_genders.join(', ')})`);
        softMissingCount++;
      } else if (rules.allowed_genders.includes(profile.gender)) {
        matchedReasons.push(`Gender criterion satisfied (${profile.gender} applicant)`);
        ruleDetails.push({
          criterion: 'Gender Target',
          passed: true,
          userValue: profile.gender,
          requiredValue: rules.allowed_genders.join(', '),
        });
      } else {
        fatalFailureCount++;
        failedReasons.push(`Gender requirement not met: Scheme is designated for ${rules.allowed_genders.join(', ')} applicants.`);
        ruleDetails.push({
          criterion: 'Gender Target',
          passed: false,
          userValue: profile.gender,
          requiredValue: rules.allowed_genders.join(', '),
          notes: 'Gender specific scheme'
        });
      }
    }
  }

  // 3. State / Location Check
  const isAllIndia = scheme.states.includes('All India');
  if (!isAllIndia) {
    if (!profile.state) {
      pendingReasons.push(`State verification needed: Scheme is specific to ${scheme.states.join(', ')}.`);
      softMissingCount++;
    } else {
      const stateMatch = scheme.states.some(s => s.toLowerCase() === profile.state?.toLowerCase());
      if (stateMatch) {
        matchedReasons.push(`Location eligibility confirmed: Resident of ${profile.state}`);
        ruleDetails.push({
          criterion: 'State / Territory',
          passed: true,
          userValue: profile.state,
          requiredValue: scheme.states.join(', '),
        });
      } else {
        fatalFailureCount++;
        failedReasons.push(`Location mismatch: Scheme is active only in ${scheme.states.join(', ')} (Your state: ${profile.state}).`);
        ruleDetails.push({
          criterion: 'State / Territory',
          passed: false,
          userValue: profile.state,
          requiredValue: scheme.states.join(', '),
          notes: 'State specific scheme'
        });
      }
    }
  } else {
    matchedReasons.push('National Coverage: All States & Union Territories of India eligible');
    ruleDetails.push({
      criterion: 'Geographic Scope',
      passed: true,
      userValue: profile.state || 'All India Citizen',
      requiredValue: 'All India',
    });
  }

  // 4. Income Ceiling Check
  if (rules.max_income !== undefined) {
    if (profile.annual_income === undefined) {
      pendingReasons.push(`Annual family income verification needed (Ceiling: ₹${rules.max_income.toLocaleString('en-IN')})`);
      softMissingCount++;
      ruleDetails.push({
        criterion: 'Income Ceiling',
        passed: false,
        userValue: 'Not specified',
        requiredValue: `Max ₹${rules.max_income.toLocaleString('en-IN')}`,
        notes: 'Income details required'
      });
    } else {
      const userIncome = profile.annual_income;
      const maxInc = rules.max_income;

      if (userIncome <= maxInc) {
        matchedReasons.push(`Income within prescribed limit: ₹${userIncome.toLocaleString('en-IN')} (Limit: ₹${maxInc.toLocaleString('en-IN')})`);
        ruleDetails.push({
          criterion: 'Income Ceiling',
          passed: true,
          userValue: `₹${userIncome.toLocaleString('en-IN')}`,
          requiredValue: `Up to ₹${maxInc.toLocaleString('en-IN')}`,
        });
      } else {
        // Near miss check: within 15% of the ceiling
        const margin = userIncome - maxInc;
        const percentageOver = (margin / maxInc) * 100;
        if (percentageOver <= 18) {
          hasNearMiss = true;
          nearMissExplanation = `Annual income limit is ₹${maxInc.toLocaleString('en-IN')} and your income is ₹${userIncome.toLocaleString('en-IN')} (just ₹${margin.toLocaleString('en-IN')} over limit).`;
          requiredChange = `Income must be within ₹${maxInc.toLocaleString('en-IN')}. Verify if your taxable or family income meets official deduction norms.`;
          ruleDetails.push({
            criterion: 'Income Ceiling',
            passed: false,
            userValue: `₹${userIncome.toLocaleString('en-IN')}`,
            requiredValue: `Up to ₹${maxInc.toLocaleString('en-IN')}`,
            isNearMiss: true,
            notes: `Over ceiling by ${percentageOver.toFixed(1)}%`
          });
        } else {
          fatalFailureCount++;
          failedReasons.push(`Income exceeds limit: Family income is ₹${userIncome.toLocaleString('en-IN')} (Scheme ceiling is ₹${maxInc.toLocaleString('en-IN')}).`);
          ruleDetails.push({
            criterion: 'Income Ceiling',
            passed: false,
            userValue: `₹${userIncome.toLocaleString('en-IN')}`,
            requiredValue: `Up to ₹${maxInc.toLocaleString('en-IN')}`,
            notes: 'Exceeds income threshold'
          });
        }
      }
    }
  }

  // 5. Social Category (SC/ST/OBC/Minority/EWS) Check
  if (rules.eligible_categories && rules.eligible_categories.length > 0) {
    if (!profile.category) {
      pendingReasons.push(`Category certificate check: Scheme targets ${rules.eligible_categories.join(', ')}.`);
      softMissingCount++;
    } else if (rules.eligible_categories.includes(profile.category)) {
      matchedReasons.push(`Category criterion satisfied (${profile.category} applicant)`);
      ruleDetails.push({
        criterion: 'Social Category',
        passed: true,
        userValue: profile.category,
        requiredValue: rules.eligible_categories.join(', '),
      });
    } else {
      fatalFailureCount++;
      failedReasons.push(`Category mismatch: Scheme is designated for ${rules.eligible_categories.join(', ')} communities (Your category: ${profile.category}).`);
      ruleDetails.push({
        criterion: 'Social Category',
        passed: false,
        userValue: profile.category,
        requiredValue: rules.eligible_categories.join(', '),
        notes: 'Restricted category scheme'
      });
    }
  }

  // 6. Occupation and Target Group Check
  if (rules.occupations && rules.occupations.length > 0) {
    if (!profile.occupation) {
      pendingReasons.push(`Occupation verification needed (Designed for: ${rules.occupations.join(', ')})`);
      softMissingCount++;
    } else if (rules.occupations.includes(profile.occupation)) {
      matchedReasons.push(`Occupation matches scheme focus: ${profile.occupation}`);
      ruleDetails.push({
        criterion: 'Target Occupation',
        passed: true,
        userValue: profile.occupation,
        requiredValue: rules.occupations.join(', '),
      });
    } else {
      // Check if student/farmer flags match even if main occupation is slightly different
      const studentMatch = rules.requires_student && profile.is_student;
      const farmerMatch = rules.requires_farmer && profile.is_farmer;
      const businessMatch = rules.requires_business && profile.owns_business;

      if (studentMatch || farmerMatch || businessMatch) {
        matchedReasons.push(`Target role satisfied via activity profile (${profile.occupation})`);
      } else {
        fatalFailureCount++;
        failedReasons.push(`Target group mismatch: Primarily for ${rules.occupations.join(', ')} (Your status: ${profile.occupation}).`);
        ruleDetails.push({
          criterion: 'Target Occupation',
          passed: false,
          userValue: profile.occupation,
          requiredValue: rules.occupations.join(', '),
          notes: 'Occupation specific'
        });
      }
    }
  }

  // 7. Student Status Check
  if (rules.requires_student) {
    if (profile.is_student === undefined) {
      pendingReasons.push('Confirmation needed whether you are currently enrolled as a student');
      softMissingCount++;
    } else if (profile.is_student) {
      matchedReasons.push('Active student enrolment confirmed');
      ruleDetails.push({
        criterion: 'Student Enrolment',
        passed: true,
        userValue: 'Currently enrolled student',
        requiredValue: 'Active Student',
      });
    } else {
      fatalFailureCount++;
      failedReasons.push('Requires applicant to be currently enrolled in school, college, or recognized educational institute.');
      ruleDetails.push({
        criterion: 'Student Enrolment',
        passed: false,
        userValue: 'Not a student',
        requiredValue: 'Active Student',
      });
    }
  }

  // 8. Farmer & Land Size Check
  if (rules.requires_farmer) {
    if (profile.is_farmer === undefined) {
      pendingReasons.push('Confirmation needed whether you own or cultivate agricultural land');
      softMissingCount++;
    } else if (profile.is_farmer) {
      matchedReasons.push('Agricultural landholder / farmer status satisfied');
      ruleDetails.push({
        criterion: 'Farmer Status',
        passed: true,
        userValue: 'Practicing Farmer',
        requiredValue: 'Agricultural Farmer',
      });

      if (rules.max_land_acres !== undefined && profile.land_size_acres !== undefined) {
        if (profile.land_size_acres <= rules.max_land_acres) {
          matchedReasons.push(`Landholding within permissible limit: ${profile.land_size_acres} acres (Limit: ${rules.max_land_acres} acres)`);
        } else {
          fatalFailureCount++;
          failedReasons.push(`Land size limit exceeded: You have ${profile.land_size_acres} acres (Limit: ${rules.max_land_acres} acres)`);
        }
      }
    } else {
      fatalFailureCount++;
      failedReasons.push('Requires applicant to be an active farmer or cultivator with agricultural land record.');
      ruleDetails.push({
        criterion: 'Farmer Status',
        passed: false,
        userValue: 'Non-farmer',
        requiredValue: 'Active Farmer',
      });
    }
  }

  // 9. Disability Check
  if (rules.requires_disability) {
    if (profile.is_disabled === undefined) {
      pendingReasons.push('Disability / UDID status needs confirmation');
      softMissingCount++;
    } else if (profile.is_disabled) {
      matchedReasons.push('Person with Benchmark Disability (PwD / UDID) eligibility satisfied');
      ruleDetails.push({
        criterion: 'Disability Status',
        passed: true,
        userValue: 'Yes (PwD / UDID card holder)',
        requiredValue: 'Benchmark Disability 40%+',
      });
    } else {
      fatalFailureCount++;
      failedReasons.push('Exclusive scheme for Persons with Disabilities (PwD) holding benchmark disability certification.');
      ruleDetails.push({
        criterion: 'Disability Status',
        passed: false,
        userValue: 'Not applicable',
        requiredValue: 'UDID / PwD Certificate 40%+',
      });
    }
  }

  // Determine final status
  let status: EligibilityStatus = 'NOT_ELIGIBLE';

  if (fatalFailureCount === 0 && !hasNearMiss && softMissingCount === 0) {
    status = 'ELIGIBLE';
  } else if (fatalFailureCount === 0 && !hasNearMiss && softMissingCount > 0) {
    status = 'POSSIBLY_ELIGIBLE';
  } else if (fatalFailureCount === 0 && hasNearMiss) {
    status = 'NEAR_MISS';
  } else if (fatalFailureCount === 1 && hasNearMiss) {
    // 1 fatal plus near miss
    status = 'NEAR_MISS';
  } else {
    status = 'NOT_ELIGIBLE';
  }

  // Compute ranking score (0 to 100)
  let score = 0;
  if (status === 'ELIGIBLE') {
    score = 80 + Math.min(20, matchedReasons.length * 3);
  } else if (status === 'POSSIBLY_ELIGIBLE') {
    score = 60 + Math.min(18, matchedReasons.length * 2);
  } else if (status === 'NEAR_MISS') {
    score = 45 + Math.min(15, matchedReasons.length * 2);
  } else {
    score = Math.max(5, Math.min(30, matchedReasons.length * 2 - fatalFailureCount * 5));
  }

  // Prioritize high-impact benefits and occupation match
  if (profile.occupation && scheme.rules.occupations?.includes(profile.occupation)) {
    score += 5;
  }
  if (profile.state && scheme.states.includes(profile.state)) {
    score += 4;
  }

  score = Math.min(100, Math.max(0, score));

  return {
    schemeId: scheme.id,
    scheme,
    status,
    score,
    matchedReasons,
    failedReasons,
    pendingReasons: pendingReasons.length > 0 ? pendingReasons : undefined,
    nearMissExplanation,
    requiredChange,
    ruleDetails
  };
}

export function rankEvaluations(evaluations: EligibilityEvaluation[]): EligibilityEvaluation[] {
  const statusWeight: Record<EligibilityStatus, number> = {
    ELIGIBLE: 1000,
    POSSIBLY_ELIGIBLE: 600,
    NEAR_MISS: 400,
    NOT_ELIGIBLE: 0
  };

  return [...evaluations].sort((a, b) => {
    const weightA = statusWeight[a.status];
    const weightB = statusWeight[b.status];
    if (weightA !== weightB) {
      return weightB - weightA;
    }
    return b.score - a.score;
  });
}
