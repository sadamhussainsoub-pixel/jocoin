import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";

export function PublicHeader() {
  const { t } = useI18n();
  const { data: session } = useSession();
  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Logo />
        <nav aria-label="Primary" className="flex items-center gap-2">
          <Link to="/roadmap" className="hidden px-2 text-sm text-muted-foreground hover:text-foreground sm:inline">
            {t("nav.roadmap")}
          </Link>
          <LanguageToggle />
          {session ? (
            <Button asChild variant="gold" size="sm">
              <Link to="/dashboard">{t("nav.openApp")}</Link>
            </Button>
          ) : (
            <Button asChild variant="goldOutline" size="sm">
              <Link to="/auth">{t("nav.signIn")}</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
