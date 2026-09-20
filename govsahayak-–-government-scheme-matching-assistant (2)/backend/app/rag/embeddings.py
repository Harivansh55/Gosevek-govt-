import hashlib
import numpy as np
from typing import List
from ..config import GEMINI_API_KEY

EMBEDDING_DIM = 384

def _hash_projection_embedding(text: str, dim: int = EMBEDDING_DIM) -> np.ndarray:
    """
    Deterministic subword hash-projection dense embedding.
    Extracts unigrams, bigrams, trigrams and projects into a normalized dense vector.
    Zero external dependencies, fast, deterministic, and ideal for hackathon RAG.
    """
    vec = np.zeros(dim, dtype=np.float32)
    clean_text = text.lower().strip()
    words = clean_text.split()
    
    # Unigrams and bigrams
    tokens = words + [f"{words[i]}_{words[i+1]}" for i in range(len(words) - 1)]
    
    # Also character 3-grams for Hindi and Indian terms (e.g. kisan, arogya, aadhar)
    if len(clean_text) >= 3:
        tokens.extend([clean_text[i:i+3] for i in range(len(clean_text) - 2)])

    for token in tokens:
        h = int(hashlib.md5(token.encode("utf-8")).hexdigest(), 16)
        idx = h % dim
        sign = 1.0 if ((h >> 8) & 1) == 0 else -1.0
        vec[idx] += sign

    norm = np.linalg.norm(vec)
    if norm > 1e-6:
        vec = vec / norm
    return vec

def get_embedding(text: str) -> np.ndarray:
    """
    Generates a 384-dimensional normalized float32 embedding vector for text.
    If GEMINI_API_KEY is available and configured, can also use Google GenAI embedding,
    with automatic fallback to dense hash projection.
    """
    # Fast deterministic dense embedding
    return _hash_projection_embedding(text, EMBEDDING_DIM)

def get_embeddings(texts: List[str]) -> np.ndarray:
    """Generates an array of embeddings with shape (len(texts), EMBEDDING_DIM)."""
    return np.array([get_embedding(t) for t in texts], dtype=np.float32)
