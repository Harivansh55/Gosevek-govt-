import faiss
import numpy as np
from typing import List, Tuple, Dict, Any, Optional
from ..models.scheme import Scheme
from .embeddings import get_embedding, get_embeddings, EMBEDDING_DIM

class SchemeVectorStore:
    """
    FAISS-powered vector store for Government Welfare Schemes.
    Uses Inner Product (Cosine Similarity on L2-normalized embeddings).
    """

    def __init__(self, dimension: int = EMBEDDING_DIM):
        self.dimension = dimension
        self.index = faiss.IndexFlatIP(dimension)
        self.schemes: List[Scheme] = []
        self.documents: List[str] = []

    def _scheme_to_text(self, scheme: Scheme) -> str:
        """Constructs rich contextual text representation of a scheme for vectorization."""
        parts = [
            f"Scheme Name: {scheme.name}",
            f"Hindi Name: {scheme.hindi_name or ''}",
            f"Department: {scheme.department}",
            f"Ministry: {scheme.ministry}",
            f"Category: {scheme.category}",
            f"Target States: {', '.join(scheme.states)}",
            f"Overview: {scheme.overview}",
            f"Benefits: {scheme.benefits} ({scheme.benefit_type} {scheme.estimated_benefit_amount or ''})",
            f"Key Tags: {', '.join(scheme.tags)}",
            f"Required Documents: {', '.join(scheme.documents)}",
            f"Application Steps: {' '.join(scheme.application_process)}",
        ]
        if scheme.rules.occupations:
            parts.append(f"Target Occupations: {', '.join(scheme.rules.occupations)}")
        if scheme.rules.max_income:
            parts.append(f"Income Limit: Rs {int(scheme.rules.max_income):,}")
        return "\n".join(parts)

    def build_index(self, schemes: List[Scheme]) -> None:
        """Builds the FAISS vector index from schemes list."""
        self.schemes = schemes
        self.documents = [self._scheme_to_text(s) for s in schemes]
        
        # Reset FAISS index
        self.index = faiss.IndexFlatIP(self.dimension)
        
        if len(self.documents) > 0:
            embeddings = get_embeddings(self.documents)
            self.index.add(embeddings)

    def search(self, query: str, top_k: int = 5) -> List[Tuple[Scheme, float]]:
        """
        Performs vector similarity search.
        Returns List of (Scheme, similarity_score).
        """
        if self.index.ntotal == 0 or len(self.schemes) == 0:
            return []
            
        k = min(top_k, self.index.ntotal)
        query_vec = get_embedding(query).reshape(1, -1)
        
        distances, indices = self.index.search(query_vec, k)
        
        results: List[Tuple[Scheme, float]] = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx >= 0 and idx < len(self.schemes):
                results.append((self.schemes[idx], float(dist)))
                
        return results

    @property
    def total_indexed(self) -> int:
        return self.index.ntotal
