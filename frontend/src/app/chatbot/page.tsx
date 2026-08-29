"use client";
import { WebSession } from "@omnidim-ai/client";
import BottomNav from "@/components/BottomNav";
import { apiJson, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLanguage, type Language } from "@/lib/language-context";
import { tr } from "@/lib/static-translate";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Globe,
  Loader2,
  Send,
  Mic,
  MicOff,
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

type VoiceSessionResponse = {
  session_id?: string | number | null;
  ws_url: string;
};

const GREETING: Record<Language, string> = {
  en: "Namaste! Ask me about tomato diseases, watering, fertilizer, spraying weather, pests, or your last scan result.",
  hi: "नमस्ते! मुझसे टमाटर की बीमारियों, सिंचाई, खाद, छिड़काव के मौसम, कीटों या अपने पिछले स्कैन के परिणाम के बारे में पूछें।",
  pa: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਨੂੰ ਟਮਾਟਰ ਦੀਆਂ ਬਿਮਾਰੀਆਂ, ਸਿੰਚਾਈ, ਖਾਦ, ਛਿੜਕਾਅ ਦੇ ਮੌਸਮ, ਕੀੜਿਆਂ ਜਾਂ ਆਪਣੇ ਪਿਛਲੇ ਸਕੈਨ ਦੇ ਨਤੀਜੇ ਬਾਰੇ ਪੁੱਛੋ।",
  mr: "नमस्कार! मला टोमॅटोचे रोग, पाणी देणे, खत, फवारणीसाठी योग्य हवामान, कीड किंवा तुमच्या मागील स्कॅनच्या निकालाबद्दल विचारा.",
};

// How close to the bottom (in px) still counts as "at the bottom"
// for auto-scroll purposes - a little slack for sub-pixel rounding
// and momentum scrolling on mobile.
const AUTO_SCROLL_THRESHOLD_PX = 80;

const OMNI_CAPTURE_WORKLET = `
class OmniCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(2048);
    this.offset = 0;
  }

  process(inputs) {
    const channel = inputs[0] && inputs[0][0];

    if (!channel) return true;

    let read = 0;

    while (read < channel.length) {
      const take = Math.min(
        channel.length - read,
        this.buffer.length - this.offset
      );

      this.buffer.set(channel.subarray(read, read + take), this.offset);
      this.offset += take;
      read += take;

      if (this.offset === this.buffer.length) {
        this.port.postMessage(this.buffer.slice(0));
        this.offset = 0;
      }
    }

    return true;
  }
}

registerProcessor("krishinayan-omni-capture", OmniCaptureProcessor);
`;

type OmniAudioEngine = {
  start(onChunk: (base64Pcm: string) => void): Promise<void>;
  enqueue(base64Pcm: string): void;
  clear(): void;
  setMuted(muted: boolean): void;
  stop(): void;
};

class SpeechToTextOnlyAudioEngine implements OmniAudioEngine {
  private context: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private workletNode: AudioWorkletNode | null = null;

  async start(onChunk: (base64Pcm: string) => void): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    this.context = new AudioContext({ sampleRate: 16000 });

    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    const workletUrl = URL.createObjectURL(
      new Blob([OMNI_CAPTURE_WORKLET], {
        type: "application/javascript",
      })
    );

    try {
      await this.context.audioWorklet.addModule(workletUrl);
    } finally {
      URL.revokeObjectURL(workletUrl);
    }

    this.workletNode = new AudioWorkletNode(
      this.context,
      "krishinayan-omni-capture"
    );
    this.workletNode.port.onmessage = (event) => {
      onChunk(float32ToBase64Pcm(event.data as Float32Array));
    };

    this.context
      .createMediaStreamSource(this.stream)
      .connect(this.workletNode);
  }

  enqueue() {
    // Deliberately ignore Omni agent audio. KrishiNayan uses Omni for STT only.
  }

  clear() {
    // No playback queue is used.
  }

  setMuted(muted: boolean) {
    for (const track of this.stream?.getAudioTracks() ?? []) {
      track.enabled = !muted;
    }
  }

  stop() {
    this.workletNode?.disconnect();
    this.workletNode = null;

    for (const track of this.stream?.getTracks() ?? []) {
      track.stop();
    }

    this.stream = null;
    void this.context?.close();
    this.context = null;
  }
}

function float32ToBase64Pcm(samples: Float32Array): string {
  const pcm = new Int16Array(samples.length);

  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    pcm[index] = sample < 0 ? sample * 32768 : sample * 32767;
  }

  const bytes = new Uint8Array(pcm.buffer);
  let binary = "";

  for (let index = 0; index < bytes.length; index += 32768) {
    binary += String.fromCharCode(
      ...bytes.subarray(index, index + 32768)
    );
  }

  return btoa(binary);
}

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

  if (language === "pa") {
    if (isHealthy) {
      return (
        `ਮੈਂ ਤੁਹਾਡਾ ਪਿਛਲਾ ਸਕੈਨ ਵੇਖਿਆ - ਤੁਹਾਡੀ ${scan.crop} ਫਸਲ ਸਿਹਤਮੰਦ ਲੱਗ ਰਹੀ ਹੈ ` +
        `(${scan.confidence}% ਭਰੋਸਾ)। ਨਿਗਰਾਨੀ, ਖਾਦ ਜਾਂ ਅਗਲਾ ਸਕੈਨ ਕਦੋਂ ਕਰਨਾ ਹੈ, ਇਸ ਬਾਰੇ ਪੁੱਛੋ।`
      );
    }

    return (
      `ਮੈਂ ਤੁਹਾਡਾ ਪਿਛਲਾ ਸਕੈਨ ਵੇਖਿਆ - ਤੁਹਾਡੀ ${scan.crop} ਫਸਲ ਵਿੱਚ ${scan.detected_issue} ਮਿਲਿਆ ` +
      `(${scan.confidence}% ਭਰੋਸਾ, ${scan.severity} ਜੋਖਮ)। ਇਲਾਜ, ਬਚਾਅ ਜਾਂ ਅਗਲੇ ਕਦਮਾਂ ਬਾਰੇ ਪੁੱਛੋ।`
    );
  }

  if (language === "mr") {
    if (isHealthy) {
      return (
        `मी तुमचा मागील स्कॅन पाहिला - तुमचे ${scan.crop} पीक निरोगी दिसत आहे ` +
        `(${scan.confidence}% विश्वास). निरीक्षण, खत किंवा पुढील स्कॅन कधी करायचा याबद्दल विचारा.`
      );
    }

    return (
      `मी तुमचा मागील स्कॅन पाहिला - तुमच्या ${scan.crop} पिकामध्ये ${scan.detected_issue} आढळले ` +
      `(${scan.confidence}% विश्वास, ${scan.severity} धोका). उपचार, प्रतिबंध किंवा पुढील पावले याबद्दल विचारा.`
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
  const { isGuest } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: GREETING.en },
  ]);
  useEffect(() => {
  setMessages((current) => {
    // No conversation yet: show greeting in selected language
    if (current.length === 0) {
      return [
        {
          role: "assistant",
          content: GREETING[language],
        },
      ];
    }

    // If only the initial greeting is visible,
    // update it whenever language changes.
    if (
      current.length === 1 &&
      current[0].role === "assistant" &&
      Object.values(GREETING).includes(
        current[0].content
      )
    ) {
      return [
        {
          role: "assistant",
          content: GREETING[language],
        },
      ];
    }

    return current;
  });
}, [language]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceStarting, setIsVoiceStarting] = useState(false);
  const [voiceError, setVoiceError] = useState("");

  const omniSessionRef = useRef<WebSession | null>(null);
  const isStartingVoiceRef = useRef(false);
  const [scanContext, setScanContext] =
    useState<PredictionResult | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const isNearBottomRef = useRef(true);
  const hasAppliedAnalysisGreetingRef = useRef(false);

  useEffect(() => {
    setMessages((current) => {
      if (
        current.length === 1 &&
        current[0].role === "assistant" &&
        Object.values(GREETING).includes(current[0].content)
      ) {
        return [{ role: "assistant", content: GREETING[language] }];
      }

      return current;
    });
  }, [language]);

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
    const order: Language[] = ["en", "hi", "pa", "mr"];
    const currentIndex = order.indexOf(language);
    const nextLanguage = order[(currentIndex + 1) % order.length];
    setLanguage(nextLanguage);
  }

  async function sendChatMessage(text: string) {
    const trimmed = text.trim();

    if (!trimmed || isSending) return;
    if (isGuest) {
      setVoiceError("Guest mode is read-only. Sign in as a farmer to Ask the Expert.");
      return;
    }

    // The farmer just acted - always show them their own message
    // and the reply that follows, regardless of prior scroll state.
    isNearBottomRef.current = true;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];

    setMessages(nextMessages);
    setInput("");
    setVoiceError("");
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
          : tr("Backend connection failed.", language);

      setMessages((current) => [
        ...current,
        { role: "assistant", content: message },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();

    await sendChatMessage(input);
  }

  async function startOmniVoice() {
    if (isGuest) {
      setVoiceError("Voice and Ask the Expert are disabled in Guest mode.");
      return;
    }
    if (
      isSending ||
      isListening ||
      isStartingVoiceRef.current ||
      omniSessionRef.current
    ) {
      return;
    }

    isStartingVoiceRef.current = true;
    setIsVoiceStarting(true);
    setVoiceError("");

    let data: VoiceSessionResponse;

    try {
      data = await apiJson<VoiceSessionResponse>("/voice/session", {
        method: "POST",
      });

      if (!data.ws_url) {
        throw new Error("Voice session did not return ws_url");
      }
    } catch (error) {
      console.error("Voice session request failed:", error);

      setVoiceError(getVoiceSessionErrorMessage(error, language));
      setIsListening(false);
      omniSessionRef.current = null;
      isStartingVoiceRef.current = false;
      setIsVoiceStarting(false);

      return;
    }

    try {
      const session = new WebSession({
        audioEngine: new SpeechToTextOnlyAudioEngine(),
      });

      session.on("status", (status) => {
        console.log("OmniDimension status:", status);

        if (typeof status === "object" && status.state === "ended") {
          if (omniSessionRef.current === session) {
            omniSessionRef.current = null;
          }

          setIsListening(false);
          setIsVoiceStarting(false);
        }
      });

      session.on("transcript", (transcript) => {
        console.log("Omni transcript:", transcript);

        if (transcript.role !== "user") return;

        setInput(transcript.text);

        if (transcript.final && transcript.text.trim()) {
          const finalText = transcript.text.trim();

          setInput(finalText);

          try {
            session.stop();
          } catch (error) {
            console.error("Error stopping completed voice session:", error);
          }

          if (omniSessionRef.current === session) {
            omniSessionRef.current = null;
          }

          setIsListening(false);
        }
      });

      session.on("error", (error) => {
        console.error("OmniDimension error:", error);

        setVoiceError(
          tr("There was a problem with voice recognition.", language)
        );

        setIsListening(false);
        setIsVoiceStarting(false);

        if (omniSessionRef.current === session) {
          omniSessionRef.current = null;
        }
      });

      omniSessionRef.current = session;

      await session.start({
        wsUrl: data.ws_url,
      });

      setIsListening(true);
    } catch (error) {
      console.error("Voice startup failed:", error);

      setVoiceError(getMicrophoneErrorMessage(error, language));

      setIsListening(false);
      omniSessionRef.current = null;
    } finally {
      isStartingVoiceRef.current = false;
      setIsVoiceStarting(false);
    }
  }

  function stopOmniVoice() {
    try {
      omniSessionRef.current?.stop();
    } catch (error) {
      console.error("Error stopping voice session:", error);
    }

    omniSessionRef.current = null;

    setIsListening(false);
    setIsVoiceStarting(false);
  }

  useEffect(() => {
    return () => {
      try {
        omniSessionRef.current?.stop();
      } catch {
        // Ignore cleanup errors.
      }

      omniSessionRef.current = null;
      isStartingVoiceRef.current = false;
    };
  }, []);

  return (
    <main className="flex h-dvh items-center justify-center bg-forest-deep sm:p-6">
      <section className="relative flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-cream pb-32 pt-6 sm:h-[844px] sm:rounded-[36px]">
        <header className="flex shrink-0 items-center justify-between px-5">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/10 bg-white text-forest"
            aria-label={tr("Go back", language)}
          >
            <ArrowLeft size={21} />
          </button>

          <div className="text-center">
            <h1 className="text-lg font-bold text-forest">
              {tr("Ask KrishiNayan AI", language)}
            </h1>
            <p className="text-[11px] text-muted">
              {tr("Grounded in ICAR/KVK farming guidance", language)}
            </p>
          </div>

          <button
            type="button"
            onClick={toggleLanguage}
            className="flex h-11 items-center gap-1.5 rounded-full border border-forest/10 bg-white px-3 text-xs font-bold text-forest"
            aria-label={tr("Toggle language", language)}
          >
            <Globe size={16} />
            {language === "en" ? "EN" : language === "hi" ? "हिं" : language === "pa" ? "ਪੰ" : "म"}
          </button>
        </header>

        {scanContext && (
          <div className="mx-5 mt-4 flex shrink-0 items-center gap-3 rounded-2xl bg-forest p-3 text-white">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-leaf text-forest-deep">
              <Sprout size={17} />
            </span>
            <p className="text-xs leading-5 text-white/80">
              {tr("Using your last scan:", language)}{" "}
              <span className="font-bold text-white">
                {scanContext.detected_issue}
              </span>{" "}
              ({scanContext.confidence}% {tr("confidence", language)})
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
              {tr("Thinking...", language)}
            </div>
          )}
        </div>

        {(isListening || isVoiceStarting) && (
          <div className="mx-5 mb-2 flex items-center justify-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <span className="text-xs font-semibold text-forest/70">
              {isVoiceStarting
                ? tr("Starting microphone...", language)
                : tr("Listening... speak now", language)}
            </span>
          </div>
        )}

        {voiceError && (
          <p className="mx-5 mb-2 text-xs text-red-600">{voiceError}</p>
        )}

        <form
          onSubmit={sendMessage}
          className="z-10 mx-5 mt-4 flex shrink-0 items-center gap-2 rounded-full border border-forest/10 bg-white p-2 shadow-lg"
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={tr("Type your farming question...", language)}
            className="flex-1 bg-transparent px-3 text-sm text-forest outline-none placeholder:text-muted"
          />

          <button
            type="button"
            onClick={isListening ? stopOmniVoice : startOmniVoice}
            disabled={isSending || isVoiceStarting}
            className={`group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:scale-110 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
              isListening || isVoiceStarting
                ? "bg-red-500 text-white shadow-md ring-4 ring-red-500/15 hover:bg-red-600"
                : "bg-forest/10 text-forest hover:bg-leaf hover:text-forest-deep"
            }`}
            aria-label={
              isListening
                ? tr("Stop listening", language)
                : tr("Start voice input", language)
            }
            title={
              isListening
                ? tr("Stop listening", language)
                : tr("Speak", language)
            }
          >
            {isListening || isVoiceStarting ? (
              <MicOff size={18} className="animate-pulse" />
            ) : (
              <Mic
                size={18}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            )}
          </button>

          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-leaf text-forest-deep disabled:opacity-40"
            aria-label={tr("Send message", language)}
          >
            <Send size={18} />
          </button>
        </form>

        <BottomNav />
      </section>
    </main>
  );
}

function getVoiceSessionErrorMessage(
  error: unknown,
  language: Language
): string {
  if (error instanceof ApiError) {
    return `${tr("Voice service could not start:", language)} ${error.message}`;
  }
  return tr(
    "Voice service is not running. Please keep the backend running on port 8000.",
    language
  );
}

function getMicrophoneErrorMessage(
  error: unknown,
  language: Language
): string {
  if (
    error instanceof DOMException &&
    (error.name === "NotAllowedError" ||
      error.name === "PermissionDeniedError")
  ) {
    return tr("Allow microphone access, then try again.", language);
  }
  return tr("Could not start the microphone.", language);
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
