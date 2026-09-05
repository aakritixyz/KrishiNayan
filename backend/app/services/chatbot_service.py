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
        severity_text = (
            f", {diagnosis['severity']} severity"
            if diagnosis.get("severity")
            else ""
        )
        status_text = (
            " [uncertain reading]"
            if diagnosis.get("prediction_status") == "uncertain"
            else ""
        )
        parts.append(
            f"Recent scan diagnosis: {diagnosis['disease']}"
            f"{confidence_text}{severity_text}{status_text}"
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

    if context.get("soil_summary"):
        parts.append(f"Soil context: {context['soil_summary']}")

    plot_history = context.get("plot_history")

    if plot_history:
        parts.append("Plot history: " + "; ".join(plot_history[:5]))

    return "\n".join(parts)


def _context_intro(language, context):
    """
    A short, unmistakable acknowledgment of the farmer's actual
    scan result, meant to open the answer - this is what makes the
    chatbot visibly aware of the analysis instead of reading as
    generic advice. Returns None when there's no diagnosis in
    context (e.g. a farmer asking a standalone question with no
    recent scan) so nothing is fabricated.
    """
    diagnosis = (context or {}).get("diagnosis") or {}
    disease = diagnosis.get("disease")

    if not disease:
        return None

    crop = context.get("crop")
    confidence = diagnosis.get("confidence")
    severity = diagnosis.get("severity")

    if language == "hi":
        bits = [f"आपके {crop or 'फसल'} स्कैन में {disease} मिला"]

        if confidence is not None:
            bits[0] += f" ({confidence}% भरोसा)"

        if severity:
            bits.append(f"जोखिम स्तर: {severity}")

        return "। ".join(bits) + "। इसी आधार पर जानकारी दे रहा हूं:"

    bits = [f"Your {crop or 'crop'} scan found {disease}"]

    if confidence is not None:
        bits[0] += f" ({confidence}% confidence)"

    if severity:
        bits.append(f"{severity} risk")

    return ". ".join(bits) + ". Here's guidance based on that:"


def _build_retrieval_query(query, context):
    """
    Broaden the search query with the farmer's actual diagnosis and
    crop, when known, so retrieval finds disease-specific guidance
    even when the farmer's own question is short or vague right
    after getting a scan result (e.g. "what should I do?", "is this
    bad?"). The farmer's own wording is always included as-is and
    always comes first; this only adds real terms already present
    in their own analysis, never invented ones.
    """
    extra_terms = []

    diagnosis = (context or {}).get("diagnosis") or {}
    disease = diagnosis.get("disease")

    if disease and disease.strip().lower() != "healthy":
        extra_terms.append(disease)

    crop = (context or {}).get("crop")

    if crop:
        extra_terms.append(crop)

    if not extra_terms:
        return query

    return f"{query} {' '.join(extra_terms)}"


def _clarifying_question(language, context):
    """
    Even when nothing in the knowledge base confidently matches the
    farmer's exact wording, if we already know their diagnosis we
    should say so - never fall back to a diagnosis-blind generic
    question when a real diagnosis is sitting right there in
    context.
    """
    diagnosis = (context or {}).get("diagnosis") or {}
    disease = diagnosis.get("disease")
    crop = (context or {}).get("crop")

    if disease and disease.strip().lower() != "healthy":
        if language == "hi":
            return (
                f"आपकी {crop or 'फसल'} में {disease} मिला है। मैं इसके "
                "बारे में सही जवाब देना चाहता हूं, अंदाज़ा नहीं - क्या "
                "आप इलाज, बचाव, या किसी और चीज़ के बारे में जानना "
                "चाहते हैं?"
            )

        return (
            f"I can see your {crop or 'crop'} scan found {disease}. "
            "I want to give you the right answer about it, not a "
            "guess - are you asking about treatment, prevention, "
            "or something else?"
        )

    return CLARIFYING_QUESTIONS[language]


def _fallback_answer(retrieved, language, context):
    """
    Compose an answer directly from the retrieved knowledge base
    passages, with no external API call - works fully offline.
    """
    lines = []

    context_intro = _context_intro(language, context)

    if context_intro:
        lines.append(context_intro)

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

    weather_or_location = {
        key: value
        for key, value in (context or {}).items()
        if key in ("stage", "location", "weather", "soil_summary", "plot_history")
    }
    context_line = _format_context_line(weather_or_location)

    if context_line:
        prefix = (
            "\nअन्य जानकारी: "
            if language == "hi"
            else "\nAlso relevant right now: "
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


def _build_system_prompt(language, has_diagnosis):
    language_instruction = (
        "Respond in simple Hindi (Devanagari script) that a farmer "
        "can easily read."
        if language == "hi"
        else (
            "Respond in simple, plain English that a farmer with "
            "basic literacy can easily follow."
        )
    )

    diagnosis_instruction = (
        " The farmer has already completed an AI photo diagnosis - "
        "their crop, disease, confidence and severity are given to "
        "you in the farmer/plot context below. Open your answer by "
        "referencing that specific result directly (name the "
        "disease and crop). Never ask the farmer what crop or "
        "disease this is, and never write as if no diagnosis has "
        "been done - one already has, and it is in your context."
        if has_diagnosis
        else ""
    )


    return (
        "You are KrishiNayan's farmer assistant. Answer the farmer's "
        "specific question directly and concisely using ONLY the "
        "knowledge base passages and farmer context provided. "
        "Focus your answer on exactly what they asked about - "
        "if they ask about recovery/treatment, focus on that. "
        "If they ask about disease identification, focus on that. "
        "Do not provide generic information unless directly relevant "
        "to their specific question. Never invent facts, dosages, "
        "product names, or scheme details not in the provided material. "
        "If the passages don't fully answer the question, say what "
        "you do know and clearly note what you're unsure about. "
        "Suggest the farmer confirm exact chemical products and doses "
        "with their local Krishi Vigyan Kendra (KVK)."
        f"{diagnosis_instruction} "
        f"{language_instruction} Keep the answer under 150 words. "
        "End with a short line listing the source labels you used."
    )


def _build_user_prompt(query, retrieved, context):
    passages = "\n\n".join(
        f"[{item['document']['title']}] "
        f"({item['document']['source_label']})\n"
        f"{item['document']['content_en']}"
        for item in retrieved
    )

    parts = [f"Farmer question: {query}"]

    context_line = _format_context_line(context)

    if context_line:
        parts.append(f"\nFarmer / plot context (already known - use it):\n{context_line}")

    parts.append(f"\nRelevant knowledge base passages:\n{passages}")

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

    retrieval_query = _build_retrieval_query(query, context)
    retrieved = rag_service.retrieve(retrieval_query, top_k=RAG_TOP_K)
    top_score = retrieved[0]["score"] if retrieved else 0.0

    if not retrieved or top_score < RAG_CONFIDENCE_THRESHOLD:
        clarifying_question = _clarifying_question(language, context)

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

    has_diagnosis = bool(
        (context.get("diagnosis") or {}).get("disease")
    )

    if llm_service.is_available():
        llm_answer = llm_service.generate_answer(
            system_prompt=_build_system_prompt(
                language,
                has_diagnosis
            ),
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
