import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { JocAmount, PageHeader, Panel, SimulatedNotice, StatCard } from "@/components/app/ui-kit";
import { Button } from "@/components/ui/button";
import { walletQuery } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/wallet")({
  head: () => ({ meta: [{ title: "Wallet — JoCoin" }, { name: "description", content: "Your internal JoCoin balance." }] }),
  component: WalletPage,
});

function WalletPage() {
  const { user } = Route.useRouteContext();
  const { t } = useI18n();
  const { data: w } = useQuery(walletQuery(user.id));
  return (
    <div className="space-y-6">
      <PageHeader title={t("wallet.title")} />
      <Panel className="gold-border">
        <p className="text-sm text-muted-foreground">{t("wallet.available")}</p>
        <p className="mt-2 text-3xl font-semibold text-gold-light"><JocAmount value={w?.balance} /></p>
        <div className="mt-4 flex gap-2">
          <Button asChild variant="gold"><Link to="/withdraw">{t("nav.withdraw")}</Link></Button>
          <Button asChild variant="glass"><Link to="/history">{t("nav.history")}</Link></Button>
        </div>
      </Panel>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label={t("wallet.locked")} value={<JocAmount value={w?.locked} />} />
        <StatCard label={t("wallet.mined")} value={<JocAmount value={w?.total_mined} />} />
        <StatCard label={t("wallet.referral")} value={<JocAmount value={w?.total_referral} />} />
        <StatCard label={t("wallet.airdrop")} value={<JocAmount value={w?.total_airdrop} />} />
      </div>
      <Panel>
        <h2 className="text-base font-semibold">{t("wallet.internal")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("wallet.internalBody")}</p>
      </Panel>
      <SimulatedNotice compact />
    </div>
  );
}
