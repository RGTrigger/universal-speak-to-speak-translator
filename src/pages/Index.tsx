import { useState } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import TranslatorApp from "@/components/TranslatorApp";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const [started, setStarted] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-background/70" />
      </div>

      <main className="relative z-10">
        {started ? <TranslatorApp /> : <WelcomeScreen onStart={() => setStarted(true)} />}
      </main>
    </div>
  );
};

export default Index;
