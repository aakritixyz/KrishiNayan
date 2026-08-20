import json
import re

from collections import Counter
from functools import lru_cache

import numpy as np

from app.core.config import KNOWLEDGE_BASE_DIR


_TOKEN_PATTERN = re.compile(r"[a-zA-Z]+")


def _tokenize(text):
    return [
        token.lower()
        for token in _TOKEN_PATTERN.findall(text or "")
    ]


@lru_cache(maxsize=1)
def load_documents():
    """
    Load every knowledge base document from the knowledge_base
    directory. Each *.json file may contain several documents.
    """
    if not KNOWLEDGE_BASE_DIR.exists():
        raise FileNotFoundError(
            f"Knowledge base directory not found: {KNOWLEDGE_BASE_DIR}"
        )

    documents = []

    for path in sorted(KNOWLEDGE_BASE_DIR.glob("*.json")):
        with open(path, "r", encoding="utf-8") as file:
            data = json.load(file)

        documents.extend(data.get("documents", []))

    if not documents:
        raise ValueError(
            "No knowledge base documents found in "
            f"{KNOWLEDGE_BASE_DIR}"
        )

    return documents


def _document_text(document):
    return " ".join([
        document.get("title", ""),
        " ".join(document.get("tags", [])),
        document.get("content_en", "")
    ])


@lru_cache(maxsize=1)
def _build_index():
    """
    Build a simple TF-IDF matrix over the knowledge base using only
    numpy, so retrieval works fully offline with no extra ML
    dependency. Cached after the first build.
    """
    documents = load_documents()

    corpus_tokens = [
        _tokenize(_document_text(document))
        for document in documents
    ]

    vocabulary = {}

    for tokens in corpus_tokens:
        for token in set(tokens):
            vocabulary.setdefault(token, len(vocabulary))

    n_docs = len(corpus_tokens)
    n_terms = len(vocabulary)

    document_frequency = np.zeros(n_terms)

    for tokens in corpus_tokens:
        for token in set(tokens):
            document_frequency[vocabulary[token]] += 1

    inverse_document_frequency = (
        np.log((1 + n_docs) / (1 + document_frequency)) + 1
    )

    document_vectors = np.zeros((n_docs, n_terms))

    for row, tokens in enumerate(corpus_tokens):
        if not tokens:
            continue

        term_counts = Counter(tokens)

        for token, count in term_counts.items():
            column = vocabulary[token]
            term_frequency = count / len(tokens)
            document_vectors[row, column] = (
                term_frequency * inverse_document_frequency[column]
            )

        norm = np.linalg.norm(document_vectors[row])

        if norm > 0:
            document_vectors[row] /= norm

    return vocabulary, inverse_document_frequency, document_vectors, documents


def _vectorize_query(query, vocabulary, inverse_document_frequency):
    tokens = _tokenize(query)
    vector = np.zeros(len(vocabulary))

    if not tokens:
        return vector

    term_counts = Counter(tokens)

    for token, count in term_counts.items():
        if token in vocabulary:
            column = vocabulary[token]
            term_frequency = count / len(tokens)
            vector[column] = (
                term_frequency * inverse_document_frequency[column]
            )

    norm = np.linalg.norm(vector)

    if norm > 0:
        vector /= norm

    return vector


def retrieve(query, top_k=3):
    """
    Return up to top_k knowledge base documents most relevant to
    the query, each with a cosine-similarity score (0-1), highest
    first. Documents with zero overlap with the query are dropped.
    """
    (
        vocabulary,
        inverse_document_frequency,
        document_vectors,
        documents
    ) = _build_index()

    query_vector = _vectorize_query(
        query,
        vocabulary,
        inverse_document_frequency
    )

    if not np.any(query_vector):
        return []

    scores = document_vectors @ query_vector

    ranked_indices = np.argsort(-scores)[:top_k]

    results = []

    for index in ranked_indices:
        score = float(scores[index])

        if score <= 0:
            continue

        results.append({
            "document": documents[index],
            "score": score
        })

    return results
