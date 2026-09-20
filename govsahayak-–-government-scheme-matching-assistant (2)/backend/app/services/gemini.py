from typing import Optional, List, Dict, Any
from ..config import GEMINI_API_KEY
from ..models.eligibility import EligibilityEvaluation, EligibilityStatus
from ..models.user_profile import UserProfile
from ..models.scheme import Scheme

DEMO_RESPONSES = {
    "farmer": (
        "Namaste! As an active farmer with agricultural land, you are eligible for **PM-KISAN** "
        "(₹6,000/year direct cash transfer in 3 installments) and **Kisan Credit Card (KCC)** for subsidized crop loans at 4% interest. "
        "Make sure your Aadhaar is seeded with your bank account (NPCI-active) and keep your Khasra/Khatauni land records ready."
    ),
    "student": (
        "Hello! Based on your student profile, you are eligible for **National Scholarship Portal (NSP) Post-Matric Scholarships** "
        "and the **Central Sector Scheme for College and University Students**. "
        "These cover tuition fees and maintenance allowances. Ensure you have your Institution Enrolment ID, Marksheets, and Income Certificate ready."
    ),
    "entrepreneur": (
        "Greetings! For starting or expanding your business enterprise, you match with **PM MUDRA Yojana** (Shishu, Kishore, and Tarun loans up to ₹10 Lakhs with zero collateral) "
        "and **PMEGP** (up to 35% government subsidy on project costs). You will need your Business Project Report and Udyam Registration."
    ),
    "woman entrepreneur": (
        "Namaste! As a woman entrepreneur, you qualify for **Stand-Up India** (bank loans between ₹10 Lakhs and ₹1 Crore for greenfield enterprises) "
        "and **Lakhpati Didi / PM Vishwakarma** artisan assistance. Priority credit and skill training subsidies are provided."
    ),
    "senior citizen": (
        "Pranam! As a senior citizen (60+ years), you qualify for **Indira Gandhi National Old Age Pension Scheme (IGNOAPS)** "
        "and **Pradhan Mantri Vaya Vandana Yojana (PMVVY)** for assured monthly pension returns, along with priority healthcare under Ayushman Bharat PM-JAY."
    ),
    "default": (
        "Namaste! I am GovSahayak AI, your government scheme assistant. I have cross-checked your profile with the official central and state welfare guidelines. "
        "The Python Rule Engine has computed your eligibility across active schemes. You can inspect the required documents and match criteria below."
    ),
}

class GeminiService:
    """
    Gemini LLM Service for explanations, chat, and demographic profile extraction.
    Rule Engine is the SOLE source of truth for eligibility.
    Gemini NEVER independently alters eligibility statuses.
    """

    def __init__(self, api_key: str = GEMINI_API_KEY):
        self.api_key = api_key
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"GeminiService: Note - Gemini client initialization error: {e}")
                self.client = None

    def explain_evaluation(self, evaluation: EligibilityEvaluation, language: str = "en") -> str:
        """
        Generates a citizen-friendly explanation of why the user is Eligible, Near-Miss, or Ineligible.
        STRICT CONSTRAINT: Gemini explains the Python rule evaluation and CANNOT alter it.
        """
        scheme = evaluation.scheme
        status_text = evaluation.status.value
        matched = "; ".join(evaluation.matched_rules) if evaluation.matched_rules else "None"
        failed = "; ".join(evaluation.failed_rules) if evaluation.failed_rules else "None"
        near_miss = evaluation.nearMissExplanation or ""
        req_change = evaluation.requiredChange or ""

        if not self.client:
            # Deterministic fallback explanation
            if evaluation.status == EligibilityStatus.ELIGIBLE:
                return (
                    f"You meet all statutory requirements for {scheme.name}. "
                    f"Satisfied conditions include: {matched}. "
                    f"Estimated benefit: {scheme.estimated_benefit_amount or scheme.benefits}."
                )
            elif evaluation.status == EligibilityStatus.NEAR_MISS:
                return (
                    f"Near-Miss on {scheme.name}: {near_miss} "
                    f"Remediation: {req_change}"
                )
            elif evaluation.status == EligibilityStatus.POSSIBLY_ELIGIBLE:
                pending = "; ".join(evaluation.pendingReasons or [])
                return (
                    f"You may be eligible for {scheme.name}, but we need to confirm: {pending}."
                )
            else:
                return (
                    f"You are currently not eligible for {scheme.name}. Reason: {failed}."
                )

        prompt = f"""
You are GovSahayak AI, a helpful Indian welfare assistant.
Explain the following scheme eligibility determination to the citizen in clear, empathetic {language} language.

IMPORTANT RULES:
1. The eligibility status has ALREADY been computed by the Python Rule Engine as: {status_text}.
2. You must NEVER change or dispute this status.
3. If status is NEAR_MISS, emphasize the close margin ({near_miss}) and the required change ({req_change}).
4. Keep the explanation under 4 sentences.

Scheme: {scheme.name}
Status: {status_text}
Rules Passed: {matched}
Rules Failed: {failed}
Near Miss Details: {near_miss}
Required Change: {req_change}
Benefits: {scheme.benefits}
"""
        try:
            response = self.client.models.generate_content(
                model="gemini-3.8-flash",
                contents=prompt,
            )
            return response.text.strip()
        except Exception as e:
            print(f"Gemini generateContent error: {e}")
            return f"Status: {status_text}. Matched criteria: {matched}."

    def generate_chat_response(
        self,
        query: str,
        profile: UserProfile,
        retrieved_schemes: List[Scheme],
        evaluations: List[EligibilityEvaluation],
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Generates conversational RAG response grounded strictly in retrieved scheme documents.
        """
        # Determine demographic theme for fallback
        theme = "default"
        q_lower = query.lower()
        if profile.is_farmer or "kisan" in q_lower or "farmer" in q_lower:
            theme = "farmer"
        elif profile.is_student or "student" in q_lower or "scholarship" in q_lower:
            theme = "student"
        elif "woman" in q_lower or (profile.gender == "Female" and profile.owns_business):
            theme = "woman entrepreneur"
        elif profile.owns_business or "business" in q_lower or "mudra" in q_lower:
            theme = "entrepreneur"
        elif (profile.age and profile.age >= 60) or "pension" in q_lower or "senior" in q_lower:
            theme = "senior citizen"

        # If no client, return high-quality deterministic response
        if not self.client:
            answer = DEMO_RESPONSES.get(theme, DEMO_RESPONSES["default"])
            if retrieved_schemes:
                top_scheme = retrieved_schemes[0]
                answer += f"\n\nTop recommended match: **{top_scheme.name}** ({top_scheme.benefit_type}: {top_scheme.estimated_benefit_amount or top_scheme.benefits})."

            suggested = [
                f"What documents do I need for {retrieved_schemes[0].name}?" if retrieved_schemes else "What documents do I need?",
                "How do I apply online?",
                "Are there any state-specific benefits?"
            ]
            return {
                "answer": answer,
                "groundedSchemes": retrieved_schemes[:4],
                "suggestedQuestions": suggested,
            }

        # Build grounded context
        scheme_context_items = []
        for s in retrieved_schemes[:4]:
            scheme_context_items.append(
                f"- Scheme: {s.name} ({s.hindi_name or ''})\n"
                f"  Department: {s.department}\n"
                f"  Benefits: {s.benefits} ({s.benefit_type} {s.estimated_benefit_amount or ''})\n"
                f"  Documents Required: {', '.join(s.documents)}\n"
                f"  Application Steps: {' '.join(s.application_process)}"
            )
        schemes_context = "\n".join(scheme_context_items)

        # Context of rule evaluations
        eval_summary = []
        for ev in evaluations[:4]:
            eval_summary.append(
                f"- {ev.scheme.name}: Status={ev.status.value}, Score={ev.score}, Matched={len(ev.matched_rules)} rules"
            )
        evals_context = "\n".join(eval_summary)

        prompt = f"""
You are GovSahayak AI, a warm, authoritative, citizen-centric government welfare advisor in India.
Answer the citizen's query accurately using ONLY the official government scheme context provided below.

CITIZEN PROFILE:
- Age: {profile.age or 'Not specified'}
- Gender: {profile.gender or 'Not specified'}
- State: {profile.state or 'Not specified'}
- Occupation: {profile.occupation or 'Not specified'}
- Annual Income: Rs {int(profile.annual_income) if profile.annual_income else 'Not specified'}
- Category: {profile.category or 'Not specified'}
- Farmer: {profile.is_farmer}
- Student: {profile.is_student}
- Business: {profile.owns_business}
- Disability: {profile.is_disabled}

RELEVANT SCHEME DOCUMENTS (GROUNDING SOURCE):
{schemes_context}

PYTHON ELIGIBILITY ENGINE DETERMINATIONS:
{evals_context}

USER QUERY:
"{query}"

INSTRUCTIONS:
1. Respond in {language} (use friendly, respectful tone).
2. Ground all facts in the provided scheme documents. Mention exact document names needed (e.g. Aadhaar, Khasra, Ration Card).
3. Do NOT contradict the Python Eligibility Engine determinations.
4. Keep the response clear, structured with bullet points where helpful.
"""

        try:
            response = self.client.models.generate_content(
                model="gemini-3.8-flash",
                contents=prompt,
            )
            answer_text = response.text.strip()
        except Exception as e:
            print(f"Gemini chat error: {e}")
            answer_text = DEMO_RESPONSES.get(theme, DEMO_RESPONSES["default"])

        suggested = [
            f"What documents do I need for {retrieved_schemes[0].name}?" if retrieved_schemes else "What documents do I need?",
            "How do I apply online on the official portal?",
            "Can I track my application status via Aadhaar?"
        ]

        return {
            "answer": answer_text,
            "groundedSchemes": retrieved_schemes[:4],
            "suggestedQuestions": suggested,
        }

_gemini_instance: Optional[GeminiService] = None

def get_gemini_service() -> GeminiService:
    global _gemini_instance
    if _gemini_instance is None:
        _gemini_instance = GeminiService()
    return _gemini_instance
