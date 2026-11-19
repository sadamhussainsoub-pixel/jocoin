import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Clock, Languages, Lock, Play, ScrollText, ShieldCheck, Sparkles, Users } from "lucide-react";
import { PublicHeader } from "@/components/app/PublicHeader";
import { CoinMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { publicStatsQuery, settingsQuery } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JoCoin (JOC) — Claim premium rewards every hour" },
      {
        name: "description",
        content:
          "JoCoin is a black-and-gold rewards ecosystem: start a session, claim JOC every interval, invite friends and join airdrops. Server-verified and ledger-backed.",
      },
      { property: "og:title", content: "JoCoin (JOC) — Claim premium rewards every hour" },
      {
        property: "og:description",
        content: "Start a session, claim JOC every interval, invite friends and join airdrops.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t, fmtNum } = useI18n();
  const { data: stats } = useQuery(publicStatsQuery());
  const { data: settings } = useQuery(settingsQuery());

  const steps = [
    { icon: Play, title: t("landing.step1Title"), body: t("landing.step1Body") },
    { icon: Clock, title: t("landing.step2Title"), body: t("landing.step2Body") },
    { icon: Sparkles, title: t("landing.step3Title"), body: t("landing.step3Body") },
  ];
  const features = [
    { icon: ShieldCheck, title: t("landing.f1Title"), body: t("landing.f1Body") },
    { icon: ScrollText, title: t("landing.f2Title"), body: t("landing.f2Body") },
    { icon: Users, title: t("landing.f3Title"), body: t("landing.f3Body") },
    { icon: Languages, title: t("landing.f4Title"), body: t("landing.f4Body") },
  ];

  return (
    <div className="min-h-dvh">
      <PublicHeader />
      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="grid-lines pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 md:grid-cols-2 md:pb-24 md:pt-20">
            <div className="animate-rise text-center md:text-start">
              <p className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-xs text-gold-light">
                <span className="size-1.5 rounded-full bg-gold animate-glow" aria-hidden />
                {t("landing.eyebrow")}
              </p>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.05] md:text-6xl">
                {t("landing.title1")} <span className="text-gold-sheen">{t("landing.title2")}</span>
              </h1>
              <p className="mx-auto mt-5 max-w-md text-base text-muted-foreground md:mx-0">{t("landing.subtitle")}</p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:justify-start sm:justify-center">
                <Button asChild variant="gold" size="xl">
                  <Link to="/auth" search={{ mode: "signup" }}>
                    {t("landing.cta")} <ArrowRight className="rtl:rotate-180" />
                  </Link>
                </Button>
                <Button asChild variant="glass" size="xl">
                  <Link to="/roadmap">{t("landing.ctaSecondary")}</Link>
                </Button>
              </div>
            </div>

            <div className="relative mx-auto aspect-square w-full max-w-[420px]">
              <div className="absolute inset-[6%] rounded-full border border-gold/20 animate-spin-slow" aria-hidden>
                <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-gold shadow-gold" />
              </div>
              <div className="absolute inset-[16%] rounded-full border border-dashed border-gold/15" aria-hidden />
              <div className="absolute inset-[20%] rounded-full bg-gold/20 blur-3xl" aria-hidden />
              <CoinMark eager className="absolute inset-[18%] size-[64%] animate-float drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]" />
              {settings && (
                <div className="surface-card absolute bottom-4 end-0 px-4 py-3 text-xs">
                  <p className="text-muted-foreground">{t("dash.rate")}</p>
                  <p className="num text-base font-semibold text-gold-light" dir="ltr">
                    +{fmtNum(settings.reward_per_claim)} JOC / {settings.claim_interval_minutes}m
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section aria-label="Platform stats" className="mx-auto max-w-6xl px-4">
          <div className="surface-card grid grid-cols-3 divide-x divide-border rtl:divide-x-reverse">
            {[
              { label: t("landing.statMiners"), value: stats?.miners },
              { label: t("landing.statDistributed"), value: stats?.total_distributed },
              { label: t("landing.statClaims"), value: stats?.claims },
            ].map((s) => (
              <div key={s.label} className="p-4 text-center md:p-6">
                <p className="num text-lg font-semibold text-gold-light md:text-3xl" dir="ltr">
                  {s.value === undefined ? "—" : fmtNum(s.value, 0)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground md:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <h2 className="text-center text-2xl font-semibold md:text-4xl">{t("landing.howTitle")}</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="surface-card relative p-6">
                <span className="num absolute end-5 top-5 text-4xl font-bold text-gold/15">0{i + 1}</span>
                <span className="flex size-11 items-center justify-center rounded-2xl bg-gold text-primary-foreground">
                  <s.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Features */}
        <section className="border-y border-border/60 bg-surface/50">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
            <h2 className="text-2xl font-semibold md:text-4xl">
              <span className="text-gold">{t("landing.featuresTitle")}</span>
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <div key={f.title} className="rounded-2xl border border-border bg-card/60 p-6">
                  <f.icon className="size-6 text-gold" aria-hidden />
                  <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Honesty */}
        <section className="mx-auto max-w-3xl px-4 py-16 text-center md:py-24">
          <Lock className="mx-auto size-8 text-gold" aria-hidden />
          <h2 className="mt-4 text-2xl font-semibold md:text-3xl">{t("landing.honestTitle")}</h2>
          <p className="mt-4 text-muted-foreground">{t("landing.honestBody")}</p>
          <Button asChild variant="gold" size="xl" className="mt-8">
            <Link to="/auth" search={{ mode: "signup" }}>
              {t("landing.cta")} <ArrowRight className="rtl:rotate-180" />
            </Link>
          </Button>
        </section>
      </main>
      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {t("landing.footer")}
      </footer>
    </div>
  );
}
