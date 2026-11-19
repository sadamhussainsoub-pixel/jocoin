import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Circle } from "lucide-react";
import { PublicHeader } from "@/components/app/PublicHeader";
import { SimulatedNotice } from "@/components/app/ui-kit";
import { Badge } from "@/components/ui/badge";
import { useI18n, type DictKey } from "@/lib/i18n";
import { NETWORKS } from "@/lib/blockchain";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "JoCoin Roadmap — From internal rewards to the JOC token" },
      {
        name: "description",
        content:
          "How JoCoin moves from an internal rewards ledger to an audited JOC token contract, compliance review and on-chain distribution.",
      },
      { property: "og:title", content: "JoCoin Roadmap — From internal rewards to the JOC token" },
      { property: "og:description", content: "The staged plan for JOC: platform, smart contract, compliance, distribution." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Roadmap,
});

const phases: { title: DictKey; body: DictKey; live: boolean }[] = [
  { title: "roadmap.p1", body: "roadmap.p1Body", live: true },
  { title: "roadmap.p2", body: "roadmap.p2Body", live: false },
  { title: "roadmap.p3", body: "roadmap.p3Body", live: false },
  { title: "roadmap.p4", body: "roadmap.p4Body", live: false },
];

function Roadmap() {
  const { t } = useI18n();
  return (
    <div className="min-h-dvh">
      <PublicHeader />
      <main id="main" className="mx-auto max-w-3xl px-4 py-12 md:py-20">
        <h1 className="text-3xl font-semibold md:text-5xl">
          <span className="text-gold">{t("roadmap.title")}</span>
        </h1>
        <p className="mt-4 text-muted-foreground">{t("roadmap.subtitle")}</p>

        <ol className="relative mt-12 space-y-6 border-s border-gold/20 ps-8">
          {phases.map((p) => (
            <li key={p.title} className="relative">
              <span className="absolute -start-[42px] top-1 flex size-5 items-center justify-center rounded-full bg-background">
                {p.live ? (
                  <CheckCircle2 className="size-5 text-gold" aria-hidden />
                ) : (
                  <Circle className="size-5 text-muted-foreground" aria-hidden />
                )}
              </span>
              <div className={p.live ? "surface-card gold-border p-5" : "surface-card p-5"}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-semibold md:text-lg">{t(p.title)}</h2>
                  <Badge variant={p.live ? "gold" : "muted"}>{p.live ? t("roadmap.now") : t("roadmap.next")}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{t(p.body)}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap gap-2" aria-label="Candidate networks">
          {Object.values(NETWORKS).map((n) => (
            <Badge key={n.id} variant="outline" className="border-border text-muted-foreground">
              {n.label}
            </Badge>
          ))}
        </div>
        <div className="mt-6">
          <SimulatedNotice />
        </div>
      </main>
    </div>
  );
}
