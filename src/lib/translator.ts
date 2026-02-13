export async function translateText(text: string, targetLang: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|${targetLang}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.responseStatus === 200) {
    return data.responseData.translatedText;
  }
  throw new Error("Translation failed");
}

export function speakText(text: string, lang: string): Promise<void> {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    speechSynthesis.speak(utterance);
  });
}
