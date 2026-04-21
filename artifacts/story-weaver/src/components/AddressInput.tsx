import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DadataSuggestion {
  value: string;
  unrestricted_value: string;
}

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

const TOKEN = (import.meta.env.VITE_DADATA_TOKEN as string | undefined)?.trim() ?? "";

const AddressInput = ({
  value,
  onChange,
  placeholder = "ул. Ленина, д. 1, кв. 5",
  id,
  className,
}: AddressInputProps) => {
  const [suggestions, setSuggestions] = useState<DadataSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const hasToken = TOKEN.length > 0;

  // Выводим в консоль статус токена при монтировании (для диагностики)
  useEffect(() => {
    if (hasToken) {
      console.log("[AddressInput] Dadata token loaded, length:", TOKEN.length);
    } else {
      console.warn("[AddressInput] VITE_DADATA_TOKEN not set — address suggestions disabled");
    }
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3 || !hasToken) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    setFetchError(null);

    try {
      const res = await fetch(
        "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Token ${TOKEN}`,
          },
          body: JSON.stringify({ query, count: 7, language: "ru" }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("[Dadata] HTTP", res.status, text);
        setFetchError(`Ошибка API ${res.status} — проверьте токен`);
        setSuggestions([]);
        setOpen(false);
      } else {
        const data = await res.json();
        const list: DadataSuggestion[] = data.suggestions ?? [];
        setSuggestions(list);
        setOpen(list.length > 0);
      }
    } catch (err: any) {
      console.error("[Dadata] Network error:", err);
      setFetchError("Нет связи с сервисом адресов");
      setSuggestions([]);
      setOpen(false);
    }

    setLoading(false);
  }, [hasToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setActiveIdx(-1);
    setFetchError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 350);
  };

  const handleSelect = (s: DadataSuggestion) => {
    onChange(s.value);
    setSuggestions([]);
    setOpen(false);
    setActiveIdx(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className={cn("pr-8", className)}
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {!loading && (
          <MapPin className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none" />
        )}
      </div>

      {/* Список подсказок */}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <li
              key={s.unrestricted_value}
              onMouseDown={() => handleSelect(s)}
              className={cn(
                "flex items-start gap-2 px-3 py-2.5 cursor-pointer text-sm transition-colors",
                i === activeIdx
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground"
              )}
            >
              <MapPin
                className={cn(
                  "h-3.5 w-3.5 mt-0.5 shrink-0",
                  i === activeIdx ? "text-primary-foreground" : "text-muted-foreground"
                )}
              />
              <span className="leading-snug">{s.value}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Статус */}
      {fetchError ? (
        <p className="flex items-center gap-1 text-xs text-destructive mt-1">
          <AlertCircle className="h-3 w-3" /> {fetchError}
        </p>
      ) : hasToken ? (
        <p className="flex items-center gap-1 text-xs text-primary mt-1">
          <CheckCircle2 className="h-3 w-3" /> Подсказки адресов активны — начните вводить
        </p>
      ) : (
        <p className="text-xs text-amber-600 mt-1">
          Подсказки адресов отключены — добавьте{" "}
          <code className="font-mono bg-muted px-1 rounded">VITE_DADATA_TOKEN</code> в секреты и перезапустите приложение
        </p>
      )}
    </div>
  );
};

export default AddressInput;
