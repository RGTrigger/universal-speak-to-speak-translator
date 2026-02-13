import { useEffect, useState } from "react";
import { Mic, Volume2, ArrowRight } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    // Speak welcome message
    const utterance = new SpeechSynthesisUtterance(
      "Welcome. Universal speech to speech translator is ready."
    );
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center relative overflow-hidden">
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-secondary/10 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <div
        className={`transition-all duration-1000 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center bg-primary/20 border border-primary/30 backdrop-blur-xl">

            {/* 🔥 YOUR LOGO HERE */}
            <img
              src="/logo.png"
              alt="Logo"
              className="w-12 h-12 object-contain"
            />

          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 gradient-text leading-tight">
          Universal Translator
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto mb-12 font-light">
          Speak in any language. Get instant translations spoken aloud in your target language.
        </p>

        <div className="flex gap-6 justify-center mb-12">
          {[
            { icon: Mic, label: "Speak", color: "text-primary" },
            { icon: Mic, label: "Translate", color: "text-secondary" },
            { icon: Volume2, label: "Listen", color: "text-accent" },
          ].map(({ icon: Icon, label, color }, i) => (
            <div
              key={label}
              className="glass-card p-4 flex flex-col items-center gap-2 w-28"
              style={{
                animationDelay: `${0.3 + i * 0.15}s`,
                animation: "fade-up 0.6s ease-out forwards",
                opacity: 0,
              }}
            >
              <Icon className={`w-6 h-6 ${color}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          className="group mic-button px-8 py-4 text-primary-foreground font-display font-semibold text-lg gap-3 inline-flex items-center"
        >
          Get Started
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
