from app.core.config import (
    RAG_CONFIDENCE_THRESHOLD,
    RAG_TOP_K,
    SUPPORTED_CHAT_LANGUAGES
)

from app.services import llm_service, rag_service


CLARIFYING_QUESTIONS = {
    "en": (
        "I want to give you the right answer, not a guess. Could "
        "you tell me a bit more - for example, which crop and "
        "growth stage, and exactly what you're seeing (spots, "
        "wilting, pests, or something else)?"
    ),
    "hi": (
        "मैं सही जवाब देना चाहता हूं, अंदाज़ा नहीं। कृपया थोड़ा और "
        "बताएं - जैसे कौन सी फसल और किस अवस्था में है, और आप "
        "वास्तव में क्या देख रहे हैं (धब्बे, मुरझाना, कीट, या कुछ और)?"
    )
}


def _format_context_line(context):
    if not context:
        return ""

    parts = []

    if context.get("crop"):
        parts.append(f"Crop: {context['crop']}")

    if context.get("stage"):
        parts.append(f"Growth stage: {context['stage']}")

    if context.get("location"):
        parts.append(f"Location: {context['location']}")

    diagnosis = context.get("diagnosis")

    if diagnosis and diagnosis.get("disease"):
        confidence = diagnosis.get("confidence")
        confidence_text = (
            f" ({confidence}% confidence)"
            if confidence is not None
            else ""
        )
        parts.append(
            f"Recent scan diagnosis: {diagnosis['disease']}"
            f"{confidence_text}"
        )

    weather = context.get("weather")

    if weather:
        weather_bits = []

        if weather.get("temperature") is not None:
            weather_bits.append(f"{weather['temperature']}°C")

        if weather.get("humidity") is not None:
            weather_bits.append(f"{weather['humidity']}% humidity")

        if weather.get("wind_speed") is not None:
            weather_bits.append(f"{weather['wind_speed']} km/h wind")

        if weather.get("rain_expected"):
            weather_bits.append("rain expected")

        if weather_bits:
            parts.append("Current weather: " + ", ".join(weather_bits))

    plot_history = context.get("plot_history")

    if plot_history:
        parts.append("Plot history: " + "; ".join(plot_history[:5]))

    return "\n".join(parts)


def _fallback_answer(retrieved, language, context):
    """
    Compose an answer directly from the retrieved knowledge base
    passages, with no external API call - works fully offline.
    """
    lines = []

    intro = (
        "आपके सवाल से जुड़ी जानकारी:"
        if language == "hi"
        else "Here's what's relevant to your question:"
    )
    lines.append(intro)

    for item in retrieved:
        document = item["document"]

        text = (
            document.get("content_hi")
            if language == "hi" and document.get("content_hi")
            else document.get("content_en")
        )

        lines.append(
            f"\n{document['title']}\n{text}\n"
            f"(Source: {document['source_label']})"
        )

    context_line = _format_context_line(context)

    if context_line:
        prefix = (
            "\nआपकी स्थिति: "
            if language == "hi"
            else "\nBased on your current plot details: "
        )
        lines.append(prefix + context_line)

    closing = (
        "\n\nयह सामान्य मार्गदर्शन है - सटीक दवा और मात्रा के लिए "
        "अपने नज़दीकी कृषि विज्ञान केंद्र (KVK) से पुष्टि करें।"
        if language == "hi"
        else (
            "\n\nThis is general guidance - please confirm the exact "
            "product and dose with your local Krishi Vigyan Kendra "
            "(KVK) before applying anything."
        )
    )
    lines.append(closing)

    return "\n".join(lines)


def _build_system_prompt(language):
    language_instruction = (
        "Respond in simple Hindi (Devanagari script) that a farmer "
        "can easily read."
        if language == "hi"
        else (
            "Respond in simple, plain English that a farmer with "
            "basic literacy can easily follow."
        )
    )

    return (
        "You are KrishiNayan's farmer assistant. You give Indian "
        "farmers crop advice in short, clear, farmer-friendly "
        "language. Only use the knowledge base passages and farmer "
        "context you are given - never invent facts, dosages, "
        "product names, or scheme details that are not in the "
        "provided material. If the passages don't fully answer the "
        "question, say what you do know and clearly note what "
        "you're unsure about, and suggest the farmer confirm exact "
        "chemical products and doses with their local Krishi "
        f"Vigyan Kendra (KVK). {language_instruction} Keep the "
        "answer under 180 words. End with a short line listing the "
        "source labels you used."
    )


def _build_user_prompt(query, retrieved, context):
    passages = "\n\n".join(
        f"[{item['document']['title']}] "
        f"({item['document']['source_label']})\n"
        f"{item['document']['content_en']}"
        for item in retrieved
    )

    parts = [
        f"Farmer question: {query}",
        f"\nRelevant knowledge base passages:\n{passages}"
    ]

    context_line = _format_context_line(context)

    if context_line:
        parts.append(f"\nFarmer / plot context:\n{context_line}")

    return "\n".join(parts)


def ask(query, language="en", context=None):
    """
    Answer a farmer's question using retrieval-augmented generation
    over the trusted knowledge base, grounded in the farmer's crop,
    stage, location, diagnosis, weather and plot history where
    available. Asks a clarifying question instead of guessing when
    nothing in the knowledge base is confidently relevant.
    """
    language = (
        language if language in SUPPORTED_CHAT_LANGUAGES else "en"
    )
    context = context or {}

    retrieved = rag_service.retrieve(query, top_k=RAG_TOP_K)
    top_score = retrieved[0]["score"] if retrieved else 0.0

    if not retrieved or top_score < RAG_CONFIDENCE_THRESHOLD:
        clarifying_question = CLARIFYING_QUESTIONS[language]

        return {
            "answer": clarifying_question,
            "language": language,
            "clarifying_question": clarifying_question,
            "sources": [],
            "used_llm": False,
            "matched_topics": []
        }

    sources = [
        {
            "title": item["document"]["title"],
            "source_label": item["document"]["source_label"]
        }
        for item in retrieved
    ]

    matched_topics = [item["document"]["id"] for item in retrieved]

    llm_answer = None

    if llm_service.is_available():
        llm_answer = llm_service.generate_answer(
            system_prompt=_build_system_prompt(language),
            user_prompt=_build_user_prompt(query, retrieved, context)
        )

    used_llm = llm_answer is not None

    answer = llm_answer or _fallback_answer(
        retrieved,
        language,
        context
    )

    return {
        "answer": answer,
        "language": language,
        "clarifying_question": None,
        "sources": sources,
        "used_llm": used_llm,
        "matched_topics": matched_topics
    }
