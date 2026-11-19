import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function LanguageToggle({ onChange }: { onChange?: (l: "en" | "ar") => void }) {
  const { locale, setLocale } = useI18n();
  const next = locale === "en" ? "ar" : "en";
  return (
    <Button
      variant="glass"
      size="sm"
      onClick={() => {
        setLocale(next);
        onChange?.(next);
      }}
      aria-label={next === "ar" ? "التبديل إلى العربية" : "Switch to English"}
    >
      <Languages />
      <span>{next === "ar" ? "العربية" : "English"}</span>
    </Button>
  );
}
