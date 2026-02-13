import { LANGUAGES, type Language } from "@/lib/languages";
import { Search } from "lucide-react";
import { useState } from "react";

interface LanguageSelectorProps {
  selected: Language | null;
  onSelect: (lang: Language) => void;
}

const LanguageSelector = ({ selected, onSelect }: LanguageSelectorProps) => {
  const [search, setSearch] = useState("");

  const filtered = LANGUAGES.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-display font-semibold mb-1 gradient-text-primary">
        Select Target Language
      </h2>
      <p className="text-muted-foreground text-sm mb-6">
        Choose the language you want your speech translated into
      </p>

      <div className="glass-card flex items-center gap-3 px-4 py-3 mb-6">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search languages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground w-full text-sm"
        />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {filtered.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSelect(lang)}
            className={`language-chip flex flex-col items-center gap-1 py-3 ${
              selected?.code === lang.code ? "selected" : ""
            }`}
          >
            <span className="text-2xl">{lang.flag}</span>
            <span className="text-xs">{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
