import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, SimulatedNotice } from "@/components/app/ui-kit";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "JoCoin — history" }, { name: "description", content: "JoCoin history" }] }),
  component: HistoryPage,
});

// Screen UI pending; backend actions for this page already exist in src/lib/api.ts.
function HistoryPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <PageHeader title={t("nav.history")} />
      <Panel>
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </Panel>
      <SimulatedNotice compact />
    </div>
  );
}
