import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LovableMark } from "@lovable.dev/cloud-auth-js/react";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { CoinMark } from "@/components/brand/Logo";
import { LanguageToggle } from "@/components/app/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/use-session";
import { useI18n } from "@/lib/i18n";

type Mode = "signin" | "signup" | "forgot";
type AuthSearch = { mode?: Mode; redirect?: string; ref?: string };

function safeRedirect(r?: string) {
  return r && r.startsWith("/") && !r.startsWith("//") ? r : "/dashboard";
}

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): AuthSearch => ({
    mode: s.mode === "signup" || s.mode === "forgot" ? s.mode : undefined,
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
    ref: typeof s.ref === "string" ? s.ref.slice(0, 20) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in to JoCoin" },
      { name: "description", content: "Sign in or create your JoCoin account to start claiming JOC rewards." },
      { property: "og:title", content: "Sign in to JoCoin" },
      { property: "og:description", content: "Create your account and start claiming JOC rewards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const GoogleG = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
  </svg>
);

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const { data: session } = useSession();
  const [mode, setMode] = useState<Mode>(search.mode ?? (search.ref ? "signup" : "signin"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [refCode, setRefCode] = useState(search.ref ?? "");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const target = safeRedirect(search.redirect);

  useEffect(() => {
    if (session) navigate({ to: target, replace: true });
  }, [session, target, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: target, replace: true });
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/dashboard",
            data: {
              display_name: name.trim() || undefined,
              referral_code: refCode.trim().toUpperCase() || undefined,
              locale,
            },
          },
        });
        if (error) throw error;
        if (data.session) navigate({ to: target, replace: true });
        else setSent(t("auth.checkEmail"));
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        setSent(t("auth.resetSent"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setBusy(false);
    }
  }

  async function oauth(provider: "google" | "lovable") {
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin + "/auth" });
    if (result.error) {
      toast.error(t("common.error"));
      return;
    }
    if (result.redirected) return;
    navigate({ to: target, replace: true });
  }

  const title = mode === "signup" ? t("auth.signUpTitle") : mode === "forgot" ? t("auth.sendReset") : t("auth.signInTitle");

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="grid-lines pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative flex items-center justify-between px-4 py-4">
        <Link to="/" className="font-display text-lg font-semibold">
          <span className="text-gold">Jo</span>Coin
        </Link>
        <LanguageToggle />
      </div>
      <main id="main" className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-12">
        <div className="mb-6 text-center animate-rise">
          <CoinMark eager className="mx-auto size-20 animate-float" />
          <h1 className="mt-4 text-2xl font-semibold">{t("auth.welcome")}</h1>
        </div>

        <div className="surface-card gold-border p-6 animate-rise">
          {sent ? (
            <div className="space-y-4 text-center" role="status">
              <MailCheck className="mx-auto size-10 text-gold" aria-hidden />
              <p className="text-sm">{sent}</p>
              <Button variant="glass" onClick={() => { setSent(null); setMode("signin"); }}>
                {t("auth.backToSignIn")}
              </Button>
            </div>
          ) : (
            <>
              <h2 className="mb-5 text-lg font-semibold">{title}</h2>
              {mode !== "forgot" && (
                <>
                  <div className="grid gap-2">
                    <Button type="button" variant="glass" className="h-11" onClick={() => oauth("google")}>
                      <GoogleG /> {t("auth.google")}
                    </Button>
                    <Button type="button" variant="glass" className="h-11" onClick={() => oauth("lovable")}>
                      <LovableMark className="size-[18px]" /> {t("auth.lovable")}
                    </Button>
                  </div>
                  <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="h-px flex-1 bg-border" />
                    {t("auth.or")}
                    <span className="h-px flex-1 bg-border" />
                  </div>
                </>
              )}
              <form onSubmit={onSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name">{t("auth.displayName")}</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} minLength={2} autoComplete="nickname" />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" dir="ltr" />
                </div>
                {mode !== "forgot" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">{t("auth.password")}</Label>
                      {mode === "signin" && (
                        <button type="button" className="text-xs text-gold-light hover:underline" onClick={() => setMode("forgot")}>
                          {t("auth.forgot")}
                        </button>
                      )}
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      dir="ltr"
                    />
                  </div>
                )}
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="ref">{t("auth.referralCode")}</Label>
                    <Input id="ref" value={refCode} onChange={(e) => setRefCode(e.target.value.toUpperCase())} maxLength={20} dir="ltr" className="num" />
                  </div>
                )}
                <Button type="submit" variant="gold" className="h-11 w-full" disabled={busy}>
                  {busy && <Loader2 className="animate-spin" />}
                  {mode === "signup" ? t("auth.submitSignUp") : mode === "forgot" ? t("auth.sendReset") : t("auth.submitSignIn")}
                </Button>
              </form>
              <div className="mt-5 text-center text-sm">
                {mode === "signin" ? (
                  <button type="button" className="text-gold-light hover:underline" onClick={() => setMode("signup")}>
                    {t("auth.toSignUp")}
                  </button>
                ) : (
                  <button type="button" className="text-gold-light hover:underline" onClick={() => setMode("signin")}>
                    {t("auth.toSignIn")}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
