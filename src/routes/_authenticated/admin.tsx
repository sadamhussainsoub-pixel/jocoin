import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, SimulatedNotice } from "@/components/app/ui-kit";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "JoCoin — admin" }, { name: "description", content: "JoCoin admin" }] }),
  component: AdminPage,
});

// Screen UI pending; backend actions for this page already exist in src/lib/api.ts.
function AdminPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <PageHeader title={t("admin.title")} />
      <Panel>
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </Panel>
      <SimulatedNotice compact />
    </div>
  );
}
