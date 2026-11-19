import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, SimulatedNotice } from "@/components/app/ui-kit";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/withdraw")({
  head: () => ({ meta: [{ title: "JoCoin — withdraw" }, { name: "description", content: "JoCoin withdraw" }] }),
  component: WithdrawPage,
});

// Screen UI pending; backend actions for this page already exist in src/lib/api.ts.
function WithdrawPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <PageHeader title={t("wd.title")} />
      <Panel>
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </Panel>
      <SimulatedNotice compact />
    </div>
  );
}
