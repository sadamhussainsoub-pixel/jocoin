import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, SimulatedNotice } from "@/components/app/ui-kit";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/airdrops")({
  head: () => ({ meta: [{ title: "JoCoin — airdrops" }, { name: "description", content: "JoCoin airdrops" }] }),
  component: AirdropsPage,
});

// Screen UI pending; backend actions for this page already exist in src/lib/api.ts.
function AirdropsPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <PageHeader title={t("air.title")} />
      <Panel>
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </Panel>
      <SimulatedNotice compact />
    </div>
  );
}
