import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset your JoCoin password" },
      { name: "description", content: "Choose a new password for your JoCoin account." },
      { property: "og:title", content: "Reset your JoCoin password" },
      { property: "og:description", content: "Choose a new password for your JoCoin account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const isRecovery = window.location.hash.includes("type=recovery");
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data: s }) => setReady(isRecovery || !!s.session));
    return () => data.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(t("auth.passwordUpdated"));
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4">
      <div className="surface-card gold-border p-6">
        <h1 className="mb-5 text-xl font-semibold">{t("auth.resetTitle")}</h1>
        {ready === false ? (
          <div className="space-y-4 text-sm">
            <p>{t("auth.invalidLink")}</p>
            <Button asChild variant="glass">
              <Link to="/auth" search={{ mode: "forgot" }}>{t("auth.sendReset")}</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pw">{t("auth.newPassword")}</Label>
              <Input id="pw" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" dir="ltr" />
            </div>
            <Button type="submit" variant="gold" className="h-11 w-full" disabled={busy || ready === null}>
              {busy && <Loader2 className="animate-spin" />}
              {t("auth.updatePassword")}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
