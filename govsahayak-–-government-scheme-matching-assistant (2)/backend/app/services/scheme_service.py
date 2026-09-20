import json
from typing import List, Optional, Dict, Any
from pathlib import Path
from ..config import SCHEMES_FILE
from ..models.scheme import Scheme
from ..rag.vector_store import SchemeVectorStore
from ..rag.retriever import SchemeRetriever

class SchemeService:
    """Manages schemes database, FAISS vector indexing, and retrieval."""

    def __init__(self, schemes_file: Path = SCHEMES_FILE):
        self.schemes_file = schemes_file
        self.schemes: List[Scheme] = []
        self.schemes_dict: Dict[str, Scheme] = {}
        self.vector_store = SchemeVectorStore()
        self.retriever = SchemeRetriever(self.vector_store)
        self.load_schemes()

    def load_schemes(self) -> None:
        """Loads schemes from JSON file and builds FAISS vector index."""
        if not self.schemes_file.exists():
            self.schemes = []
            self.schemes_dict = {}
            return

        with open(self.schemes_file, "r", encoding="utf-8") as f:
            raw_data = json.load(f)

        self.schemes = [Scheme(**item) for item in raw_data]
        self.schemes_dict = {s.id: s for s in self.schemes}
        self.vector_store.build_index(self.schemes)
        print(f"SchemeService: Loaded {len(self.schemes)} schemes and indexed in FAISS.")

    def get_all_schemes(
        self,
        category: Optional[str] = None,
        state: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Scheme]:
        """Returns filtered list of schemes."""
        results = self.schemes

        if category and category != "All":
            results = [s for s in results if s.category.lower() == category.lower()]

        if state and state != "All":
            results = [
                s for s in results
                if any(st.lower() in ("all india", state.lower()) for st in s.states)
            ]

        if search:
            q = search.lower().strip()
            results = [
                s for s in results
                if q in s.name.lower()
                or (s.hindi_name and q in s.hindi_name.lower())
                or q in s.category.lower()
                or q in s.department.lower()
                or any(q in t.lower() for t in s.tags)
            ]

        return results

    def get_scheme_by_id(self, scheme_id: str) -> Optional[Scheme]:
        return self.schemes_dict.get(scheme_id)

    def get_scheme_documents(self, scheme_id: str) -> Optional[Dict[str, Any]]:
        scheme = self.get_scheme_by_id(scheme_id)
        if not scheme:
            return None
        return {
            "scheme_id": scheme.id,
            "scheme_name": scheme.name,
            "hindi_name": scheme.hindi_name,
            "documents": scheme.documents,
            "application_process": scheme.application_process,
            "application_url": scheme.application_url,
        }

    def add_scheme(self, scheme: Scheme) -> Scheme:
        self.schemes.insert(0, scheme)
        self.schemes_dict[scheme.id] = scheme
        self.vector_store.build_index(self.schemes)
        return scheme

    def update_scheme(self, scheme_id: str, updated: Scheme) -> Optional[Scheme]:
        if scheme_id not in self.schemes_dict:
            return None
        self.schemes_dict[scheme_id] = updated
        self.schemes = [updated if s.id == scheme_id else s for s in self.schemes]
        self.vector_store.build_index(self.schemes)
        return updated

    def delete_scheme(self, scheme_id: str) -> bool:
        if scheme_id not in self.schemes_dict:
            return False
        del self.schemes_dict[scheme_id]
        self.schemes = [s for s in self.schemes if s.id != scheme_id]
        self.vector_store.build_index(self.schemes)
        return True

_service_instance: Optional[SchemeService] = None

def get_scheme_service() -> SchemeService:
    global _service_instance
    if _service_instance is None:
        _service_instance = SchemeService()
    return _service_instance
