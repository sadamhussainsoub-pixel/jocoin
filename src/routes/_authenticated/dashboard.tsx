import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pickaxe, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { CoinMark } from "@/components/brand/Logo";
import { LedgerRow } from "@/components/app/LedgerRow";
import { JocAmount, PageHeader, Panel, SimulatedNotice, StatCard } from "@/components/app/ui-kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApiError } from "@/hooks/use-api-error";
import { formatDuration, useNow } from "@/hooks/use-now";
import { activeSessionQuery, api, profileQuery, recentLedgerQuery, settingsQuery, walletQuery } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Mining dashboard — JoCoin" }, { name: "description", content: "Start a session and claim your JOC reward." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();
  const { t, fmtNum } = useI18n();
  const { notify } = useApiError();
  const qc = useQueryClient();
  const now = useNow();
  const { data: settings } = useQuery(settingsQuery());
  const { data: wallet } = useQuery(walletQuery(user.id));
  const { data: profile } = useQuery(profileQuery(user.id));
  const { data: session, isLoading } = useQuery(activeSessionQuery(user.id));
  const { data: recent } = useQuery(recentLedgerQuery(user.id));
  const [busy, setBusy] = useState(false);
  const claimKey = useRef<string | null>(null);

  const ends = session ? new Date(session.ends_at).getTime() : 0;
  const starts = session ? new Date(session.started_at).getTime() : 0;
  const remaining = ends - now;
  const ready = !!session && remaining <= 0;
  const progress = session ? Math.min(1, Math.max(0, (now - starts) / Math.max(1, ends - starts))) : 0;
  const paused = settings && !settings.mining_enabled;
  const suspended = profile?.status === "suspended";

  const refresh = () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["session", user.id] }),
      qc.invalidateQueries({ queryKey: ["wallet", user.id] }),
      qc.invalidateQueries({ queryKey: ["ledger-recent", user.id] }),
    ]);

  async function onAction() {
    setBusy(true);
    try {
      if (!session) {
        await api.startMining();
      } else {
        // Same key is reused on retry so a network hiccup can never double-credit.
        claimKey.current ??= crypto.randomUUID();
        const res = await api.claimReward(claimKey.current);
        claimKey.current = null;
        toast.success(t("dash.claimed", { amount: fmtNum(res.reward, 4) }));
      }
      await refresh();
    } catch (e) {
      notify(e);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  const R = 120;
  const C = 2 * Math.PI * R;
  const status = paused ? t("dash.statusPaused") : !session ? t("dash.statusIdle") : ready ? t("dash.statusReady") : t("dash.statusMining");

  return (
    <div className="space-y-6">
      <PageHeader title={t("dash.title")} action={<Badge variant="gold">{t("simulated.badge")}</Badge>} />
      {suspended && <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">{t("dash.suspended")}</div>}

      <Panel className="flex flex-col items-center gap-6 py-8">
        <div className="relative size-64">
          <svg viewBox="0 0 260 260" className="absolute inset-0 -rotate-90" aria-hidden>
            <circle cx="130" cy="130" r={R} fill="none" stroke="var(--color-border)" strokeWidth="6" />
            <circle cx="130" cy="130" r={R} fill="none" stroke="var(--color-gold)" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - progress)} className="transition-[stroke-dashoffset] duration-1000" />
          </svg>
          <CoinMark eager className={`absolute inset-8 size-48 ${session && !ready ? "animate-float" : ""}`} />
        </div>
        <div className="text-center" aria-live="polite">
          <Badge variant={ready ? "success" : session ? "gold" : "muted"}>{status}</Badge>
          {session && !ready && (
            <p className="mt-3 text-sm text-muted-foreground">
              {t("dash.nextClaim")} <span className="num text-2xl font-semibold text-gold-light" dir="ltr">{formatDuration(remaining)}</span>
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">{!session ? t("dash.idleHint") : ready ? t("dash.readyHint") : ""}</p>
        </div>
        <Button variant="gold" size="xl" className="min-w-56" onClick={onAction}
          disabled={busy || isLoading || !!paused || suspended || (!!session && !ready)}>
          {busy ? <Loader2 className="animate-spin" /> : session ? <Sparkles /> : <Pickaxe />}
          {busy ? (session ? t("dash.claiming") : t("dash.starting")) : session ? t("dash.claim") : t("dash.start")}
        </Button>
      </Panel>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard accent label={t("dash.balance")} value={<JocAmount value={wallet?.balance} />} />
        <StatCard label={t("dash.totalEarned")} value={<JocAmount value={wallet?.total_earned} />} />
        <StatCard label={t("dash.rate")} value={<JocAmount value={settings?.reward_per_claim} />} />
        <StatCard label={t("dash.interval")} value={`${settings?.claim_interval_minutes ?? "—"} ${t("dash.minutes")}`} />
      </div>

      <Panel>
        <h2 className="mb-3 text-base font-semibold">{t("dash.recent")}</h2>
        <ul className="space-y-2">{(recent ?? []).map((e) => <LedgerRow key={e.id} entry={e} />)}</ul>
      </Panel>
      <SimulatedNotice compact />
    </div>
  );
}
