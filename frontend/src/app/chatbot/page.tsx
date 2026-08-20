"use client";

import BottomNav from "@/components/BottomNav";
import { API_BASE_URL } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Globe,
  Loader2,
  Send,
  Sprout,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

type PredictionResult = {
  detected_issue: string;
  confidence: number;
  weather: {
    temperature: number;
    humidity: number;
    wind_speed: number;
    rain_expected: boolean;
  };
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

export default function ChatbotPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<Language>("en");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: GREETING.en },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [scanContext, setScanContext] =
    useState<PredictionResult | null>(null);

  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isSending]);

  function toggleLanguage() {
    setLanguage((current) => (current === "en" ? "hi" : "en"));
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();

    const trimmed = input.trim();

    if (!trimmed || isSending) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];

    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/chatbot/ask`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            language,
            context: {
              crop: "Tomato",
              location: "Pune, Maharashtra",
              diagnosis: scanContext
                ? {
                    disease: scanContext.detected_issue,
                    confidence: scanContext.confidence,
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
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("The chatbot is unavailable right now.");
      }

      const data = await response.json();

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.answer as string,
          sources: data.sources as ChatSource[],
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
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
    <main className="flex min-h-screen items-center justify-center bg-forest-deep sm:p-6">
      <section className="relative flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-cream pb-32 pt-6 sm:min-h-[844px] sm:rounded-[36px]">
        <header className="flex items-center justify-between px-5">
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
          <div className="mx-5 mt-4 flex items-center gap-3 rounded-2xl bg-forest p-3 text-white">
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

        <div className="mt-4 flex-1 space-y-4 overflow-y-auto px-5">
          {messages.map((message, index) => (
            <ChatBubble key={index} message={message} />
          ))}

          {isSending && (
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm text-muted">
              <Loader2 size={16} className="animate-spin" />
              Thinking...
            </div>
          )}

          <div ref={scrollAnchorRef} />
        </div>

        <form
          onSubmit={sendMessage}
          className="sticky bottom-24 z-10 mx-5 mt-4 flex items-center gap-2 rounded-full border border-forest/10 bg-white p-2 shadow-lg"
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
