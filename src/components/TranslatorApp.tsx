import { useState, useCallback, useRef } from "react";
import { Mic, MicOff, Volume2, RotateCcw, ArrowLeft, Languages, Loader2 } from "lucide-react";
import { type Language } from "@/lib/languages";
import { translateText, speakText } from "@/lib/translator";
import LanguageSelector from "./LanguageSelector";

type Step = "select-language" | "ready" | "recording" | "processing" | "result";

const TranslatorApp = () => {
  const [step, setStep] = useState<Step>("select-language");
  const [targetLang, setTargetLang] = useState<Language | null>(null);
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");

  const handleLanguageSelect = (lang: Language) => {
    setTargetLang(lang);
    setStep("ready");
    setOriginalText("");
    setTranslatedText("");
  };

  const doTranslation = useCallback(async (text: string, lang: Language) => {
    setOriginalText(text);
    setInterimText("");
    setStatusMsg("✅ Voice captured! Translating...");
    setStep("processing");

    try {
      const translated = await translateText(text, lang.code);
      setTranslatedText(translated);
      setStatusMsg("🔊 Speaking translation...");
      setStep("result");
      await speakText(translated, lang.code);
      setStatusMsg("✅ Translation complete!");
    } catch (err) {
      console.error("Translation error:", err);
      setTranslatedText("Translation failed. Please try again.");
      setStatusMsg("❌ Translation failed.");
      setStep("result");
    }
  }, []);

  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    transcriptRef.current = "";

    recognition.onresult = (event: any) => {
      let full = "";
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          full += t + " ";
        } else {
          interim += t;
        }
      }
      transcriptRef.current = full.trim();
      setInterimText(interim);
      if (full.trim()) {
        setOriginalText(full.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error:", event.error);
      if (event.error === "not-allowed") {
        setStatusMsg("⚠️ Microphone access denied. Allow it in browser settings.");
      } else if (event.error === "no-speech") {
        setStatusMsg("No speech detected. Speak louder or check your mic.");
      } else {
        setStatusMsg(`Error: ${event.error}`);
      }
      setStep("ready");
    };

    // When recognition ends (after we call stop()), trigger translation
    recognition.onend = () => {
      const captured = transcriptRef.current;
      if (captured && targetLang) {
        doTranslation(captured, targetLang);
      } else {
        setStatusMsg("No speech detected. Please try again.");
        setStep("ready");
      }
    };

    setOriginalText("");
    setTranslatedText("");
    setInterimText("");
    setStatusMsg("🎤 Listening... Speak now! Tap mic again to stop.");
    setStep("recording");
    recognition.start();
  }, [targetLang, doTranslation]);

  const stopRecording = useCallback(() => {
    // Stop recognition — onend will fire and trigger translation
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const reset = () => {
    setOriginalText("");
    setTranslatedText("");
    setInterimText("");
    setStatusMsg("");
    setStep("ready");
  };

  const changeLanguage = () => {
    try { recognitionRef.current?.stop(); } catch {}
    setStep("select-language");
    setOriginalText("");
    setTranslatedText("");
    setInterimText("");
    setStatusMsg("");
  };

  const replayTranslation = () => {
    if (translatedText && targetLang) {
      setStatusMsg("🔊 Replaying...");
      speakText(translatedText, targetLang.code).then(() => setStatusMsg("✅ Done!"));
    }
  };

  if (step === "select-language") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <LanguageSelector selected={targetLang} onSelect={handleLanguageSelect} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative">
      <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-primary/5 blur-3xl animate-float" />
      <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-secondary/5 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

      {/* Header */}
      <div className="w-full max-w-lg mb-8">
        <button onClick={changeLanguage} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-4">
          <ArrowLeft className="w-4 h-4" />
          Change language
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/20 border border-primary/30">
            <Languages className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg">Translating to</h2>
            <p className="text-primary text-sm font-medium">{targetLang?.flag} {targetLang?.name}</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-lg space-y-5">
        {/* Status */}
        {statusMsg && (
          <div className="glass-card px-4 py-3 text-center">
            <p className="text-sm font-medium text-foreground">{statusMsg}</p>
          </div>
        )}

        {/* Live interim text */}
        {step === "recording" && (interimText || originalText) && (
          <div className="glass-card p-5 border-accent/20 animate-fade-up">
            <p className="text-xs text-accent uppercase tracking-wider mb-2 font-medium">Hearing you say...</p>
            <p className="text-foreground text-lg">{originalText}{interimText && <span className="opacity-50 italic"> {interimText}</span>}</p>
          </div>
        )}

        {/* Original text (after recording) */}
        {step !== "recording" && originalText && (
          <div className="glass-card p-5 animate-fade-up">
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">You said</p>
            <p className="text-foreground text-lg">{originalText}</p>
          </div>
        )}

        {/* Processing */}
        {step === "processing" && (
          <div className="glass-card p-6 flex flex-col items-center gap-3 animate-fade-up">
            <div className="sound-wave">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="bar" />)}
            </div>
            <p className="text-sm text-muted-foreground">Translating to {targetLang?.name}...</p>
          </div>
        )}

        {/* Translation result */}
        {translatedText && step === "result" && (
          <div className="glass-card p-5 border-primary/20 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-primary uppercase tracking-wider font-medium">
                {targetLang?.flag} Translation ({targetLang?.name})
              </p>
              <button onClick={replayTranslation} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
                <Volume2 className="w-3 h-3" /> Replay
              </button>
            </div>
            <p className="text-foreground text-lg font-medium">{translatedText}</p>
          </div>
        )}

        {/* Mic button */}
        <div className="flex flex-col items-center gap-4 pt-4">
          {step === "recording" ? (
            <>
              <button onClick={stopRecording} className="mic-button recording w-20 h-20">
                <MicOff className="w-8 h-8 text-foreground" />
              </button>
              <div className="flex items-center gap-2">
                <div className="sound-wave">
                  {[1, 2, 3, 4, 5].map((i) => <div key={i} className="bar" />)}
                </div>
                <p className="text-sm text-muted-foreground">Tap mic to stop & translate</p>
              </div>
            </>
          ) : step === "processing" ? (
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-muted/50 border border-white/10">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : step === "result" ? (
            <button onClick={reset} className="mic-button w-16 h-16" title="Translate again">
              <RotateCcw className="w-6 h-6 text-primary-foreground" />
            </button>
          ) : (
            <>
              <button onClick={startRecording} className="mic-button w-20 h-20">
                <Mic className="w-8 h-8 text-primary-foreground" />
              </button>
              <p className="text-sm text-muted-foreground">Tap to speak</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslatorApp;
