"use client";

import BottomNav from "@/components/BottomNav";
import { apiJson, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Globe,
  Loader2,
  Send,
  Sprout,
} from "lucide-react";
import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

type PredictionResult = {
  crop: string;
  detected_issue: string;
  confidence: number;
  severity: string;
  prediction_status: string;
  weather: {
    temperature: number;
    humidity: number;
    wind_speed: number;
    rain_expected: boolean;
  };
  soil_context: {
    summary: string;
  } | null;
};

type ChatSource = {
  title: string;
  source_label: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
};

type Language = "en" | "hi";

const GREETING: Record<Language, string> = {
  en: "Namaste! Ask me about tomato diseases, watering, fertilizer, spraying weather, pests, or your last scan result.",
  hi: "नमस्ते! टमाटर की बीमारियों, सिंचाई, खाद, स्प्रे के मौसम, कीट, या आपके पिछले स्कैन के बारे में पूछें।",
};

// How close to the bottom (in px) still counts as "at the bottom"
// for auto-scroll purposes - a little slack for sub-pixel rounding
// and momentum scrolling on mobile.
const AUTO_SCROLL_THRESHOLD_PX = 80;

function buildAnalysisGreeting(
  language: Language,
  scan: PredictionResult
): string {
  const isHealthy = scan.detected_issue.trim().toLowerCase() === "healthy";

  if (language === "hi") {
    if (isHealthy) {
      return (
        `मैंने आपका पिछला स्कैन देखा - आपकी ${scan.crop} फसल स्वस्थ दिख रही है ` +
        `(${scan.confidence}% भरोसा)। कोई भी सवाल पूछें - निगरानी, खाद, या ` +
        `अगली स्कैन कब करें।`
      );
    }

    return (
      `मैंने आपका पिछला स्कैन देखा - आपकी ${scan.crop} फसल में ${scan.detected_issue} ` +
      `मिला (${scan.confidence}% भरोसा, ${scan.severity} जोखिम)। इलाज, बचाव, ` +
      `या किसी और चीज़ के बारे में पूछें।`
    );
  }

  if (isHealthy) {
    return (
      `I can see your last scan - your ${scan.crop} crop looks healthy ` +
      `(${scan.confidence}% confidence). Ask me anything - monitoring tips, ` +
      `fertilizer, or when to scan again.`
    );
  }

  return (
    `I can see your last scan - your ${scan.crop} crop tested positive for ` +
    `${scan.detected_issue} (${scan.confidence}% confidence, ${scan.severity} risk). ` +
    `Ask me about treatment, prevention, or what to expect next.`
  );
}

export default function ChatbotPage() {
  return (
    <Suspense
      fallback={
        <main className="flex h-dvh items-center justify-center bg-forest-deep">
          <Loader2 size={24} className="animate-spin text-white/70" />
        </main>
      }
    >
      <ChatbotPageInner />
    </Suspense>
  );
}

function ChatbotPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [language, setLanguage] = useState<Language>("en");
  const [hasManuallyToggledLanguage, setHasManuallyToggledLanguage] =
    useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: GREETING.en },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [scanContext, setScanContext] =
    useState<PredictionResult | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const isNearBottomRef = useRef(true);
  const hasAppliedAnalysisGreetingRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = sessionStorage.getItem(
        "krishiNayanPrediction"
      );

      if (!saved) return;

      try {
        setScanContext(JSON.parse(saved) as PredictionResult);
      } catch {
        setScanContext(null);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // When arriving from a just-finished analysis ("Get Help from
  // Bot" on the result page), open with a greeting that already
  // names the exact diagnosis instead of the generic one - built
  // locally from the real scan result, so it's instant with no
  // extra request.
  useEffect(() => {
    if (hasAppliedAnalysisGreetingRef.current) return;
    if (!scanContext) return;
    if (searchParams.get("fromAnalysis") !== "1") return;

    hasAppliedAnalysisGreetingRef.current = true;

    const timer = window.setTimeout(() => {
      setMessages([
        {
          role: "assistant",
          content: buildAnalysisGreeting(language, scanContext),
        },
      ]);
    }, 0);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanContext, searchParams]);

  // Default to the farmer's saved language preference once they're
  // loaded - but never override a language they've already picked
  // by hand in this session.
  useEffect(() => {
    if (!user || hasManuallyToggledLanguage) return;

    const timer = window.setTimeout(() => {
      const savedLanguage = user.language === "hi" ? "hi" : "en";
      setLanguage(savedLanguage);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [user, hasManuallyToggledLanguage]);

  // Smart autoscroll: only snap to the bottom when the farmer was
  // already reading near the bottom (or just sent a message) -
  // never yank them back down while they're scrolled up reading
  // earlier messages in a long conversation.
  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container || !isNearBottomRef.current) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isSending]);

  function handleMessagesScroll() {
    const container = messagesContainerRef.current;

    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    isNearBottomRef.current = distanceFromBottom < AUTO_SCROLL_THRESHOLD_PX;
  }

  function toggleLanguage() {
    setHasManuallyToggledLanguage(true);
    setLanguage((current) => (current === "en" ? "hi" : "en"));
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();

    const trimmed = input.trim();

    if (!trimmed || isSending) return;

    // The farmer just acted - always show them their own message
    // and the reply that follows, regardless of prior scroll state.
    isNearBottomRef.current = true;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];

    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const data = await apiJson<{
        answer: string;
        sources: ChatSource[];
      }>("/chatbot/ask", {
        method: "POST",
        body: JSON.stringify({
          message: trimmed,
          language,
          context: {
            crop: scanContext?.crop || "Tomato",
            diagnosis: scanContext
              ? {
                  disease: scanContext.detected_issue,
                  confidence: scanContext.confidence,
                  severity: scanContext.severity,
                  prediction_status: scanContext.prediction_status,
                }
              : undefined,
            weather: scanContext?.weather
              ? {
                  temperature: scanContext.weather.temperature,
                  humidity: scanContext.weather.humidity,
                  wind_speed: scanContext.weather.wind_speed,
                  rain_expected:
                    scanContext.weather.rain_expected,
                }
              : undefined,
            soil_summary: scanContext?.soil_context?.summary,
          },
        }),
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources,
        },
      ]);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Backend connection failed.";

      setMessages((current) => [
        ...current,
        { role: "assistant", content: message },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="flex h-dvh items-center justify-center bg-forest-deep sm:p-6">
      <section className="relative flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-cream pb-32 pt-6 sm:h-[844px] sm:rounded-[36px]">
        <header className="flex shrink-0 items-center justify-between px-5">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/10 bg-white text-forest"
            aria-label="Go back"
          >
            <ArrowLeft size={21} />
          </button>

          <div className="text-center">
            <h1 className="text-lg font-bold text-forest">
              Ask KrishiNayan AI
            </h1>
            <p className="text-[11px] text-muted">
              Grounded in ICAR/KVK farming guidance
            </p>
          </div>

          <button
            type="button"
            onClick={toggleLanguage}
            className="flex h-11 items-center gap-1.5 rounded-full border border-forest/10 bg-white px-3 text-xs font-bold text-forest"
            aria-label="Toggle language"
          >
            <Globe size={16} />
            {language === "en" ? "EN" : "हिं"}
          </button>
        </header>

        {scanContext && (
          <div className="mx-5 mt-4 flex shrink-0 items-center gap-3 rounded-2xl bg-forest p-3 text-white">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-leaf text-forest-deep">
              <Sprout size={17} />
            </span>
            <p className="text-xs leading-5 text-white/80">
              Using your last scan:{" "}
              <span className="font-bold text-white">
                {scanContext.detected_issue}
              </span>{" "}
              ({scanContext.confidence}% confidence)
            </p>
          </div>
        )}

        <div
          ref={messagesContainerRef}
          onScroll={handleMessagesScroll}
          className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto px-5"
        >
          {messages.map((message, index) => (
            <ChatBubble key={index} message={message} />
          ))}

          {isSending && (
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm text-muted">
              <Loader2 size={16} className="animate-spin" />
              Thinking...
            </div>
          )}
        </div>

        <form
          onSubmit={sendMessage}
          className="z-10 mx-5 mt-4 flex shrink-0 items-center gap-2 rounded-full border border-forest/10 bg-white p-2 shadow-lg"
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={
              language === "hi"
                ? "अपना सवाल लिखें..."
                : "Type your farming question..."
            }
            className="flex-1 bg-transparent px-3 text-sm text-forest outline-none placeholder:text-muted"
          />

          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-leaf text-forest-deep disabled:opacity-40"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </form>

        <BottomNav />
      </section>
    </main>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-end gap-2 ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      {!isUser && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest text-leaf">
          <Bot size={16} />
        </span>
      )}

      <div
        className={`max-w-[78%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6 ${
          isUser
            ? "rounded-tr-sm bg-leaf text-forest-deep"
            : "rounded-tl-sm bg-white text-forest"
        }`}
      >
        {message.content}

        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 border-t border-forest/10 pt-2">
            {message.sources.map((source) => (
              <span
                key={source.title}
                className="rounded-full bg-forest/5 px-2.5 py-1 text-[10px] font-semibold text-forest/70"
              >
                {source.title}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
