import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, SimulatedNotice } from "@/components/app/ui-kit";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/leaderboard")({
  head: () => ({ meta: [{ title: "JoCoin — leaderboard" }, { name: "description", content: "JoCoin leaderboard" }] }),
  component: LeaderboardPage,
});

// Screen UI pending; backend actions for this page already exist in src/lib/api.ts.
function LeaderboardPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <PageHeader title={t("lb.title")} />
      <Panel>
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </Panel>
      <SimulatedNotice compact />
    </div>
  );
}
