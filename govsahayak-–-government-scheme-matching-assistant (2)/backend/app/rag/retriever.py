from typing import List, Tuple, Optional
from ..models.scheme import Scheme
from ..models.user_profile import UserProfile
from .vector_store import SchemeVectorStore

class SchemeRetriever:
    """
    RAG Scheme Retriever combining Vector Similarity with Demographic Guidance.
    RAG retrieves information only. It must NOT make eligibility decisions.
    """

    def __init__(self, vector_store: SchemeVectorStore):
        self.vector_store = vector_store

    def retrieve(
        self,
        query: str,
        profile: Optional[UserProfile] = None,
        top_k: int = 6
    ) -> List[Tuple[Scheme, float]]:
        """
        Retrieves top relevant schemes for a query.
        Augments the query with profile keywords if provided.
        """
        augmented_query = query.strip()
        
        if profile:
            extras = []
            if profile.occupation:
                extras.append(profile.occupation)
            if profile.state:
                extras.append(profile.state)
            if profile.category:
                extras.append(profile.category)
            if profile.is_student:
                extras.append("student scholarship education")
            if profile.is_farmer:
                extras.append("farmer agriculture kisan")
            if profile.is_disabled:
                extras.append("disability PwD")
            if profile.owns_business:
                extras.append("MSME enterprise startup mudra")
                
            if extras:
                augmented_query = f"{query} {' '.join(extras)}".strip()

        return self.vector_store.search(augmented_query, top_k=top_k)

    def retrieve_by_profile(self, profile: UserProfile, top_k: int = 8) -> List[Tuple[Scheme, float]]:
        """Retrieves candidate schemes given only a citizen demographic profile."""
        query_terms = []
        if profile.occupation:
            query_terms.append(profile.occupation)
        if profile.state:
            query_terms.append(profile.state)
        if profile.category:
            query_terms.append(profile.category)
        if profile.is_farmer:
            query_terms.append("farmer agriculture crop kisan land")
        if profile.is_student:
            query_terms.append("student scholarship education tuition")
        if profile.owns_business:
            query_terms.append("business loan mudra artisan startup")
        if profile.is_disabled:
            query_terms.append("disability pension assistive device")
            
        combined_query = " ".join(query_terms) or "welfare schemes financial support"
        return self.vector_store.search(combined_query, top_k=top_k)
