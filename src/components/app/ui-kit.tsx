import type { ReactNode } from "react";
import { AlertTriangle, Info, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 animate-rise">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("surface-card p-5", className)}>{children}</section>;
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className={cn("surface-card p-4", accent && "gold-border")}>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{label}</span>
        {icon && <span className="text-gold [&_svg]:size-4">{icon}</span>}
      </div>
      <div className="num mt-2 text-xl font-semibold text-foreground md:text-2xl">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function SimulatedNotice({ compact }: { compact?: boolean }) {
  const { t } = useI18n();
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-xl border border-gold/25 bg-gold/5 text-gold-light/90",
        compact ? "p-3 text-xs" : "p-4 text-sm",
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
      <p>{t("simulated.notice")}</p>
    </div>
  );
}

export function EmptyState({ children }: { children?: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {children ?? t("common.empty")}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const { t } = useI18n();
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm">
      <AlertTriangle className="size-5 text-destructive" aria-hidden />
      <p>{t("common.error")}</p>
      {onRetry && (
        <Button variant="glass" size="sm" onClick={onRetry}>
          <RotateCw /> {t("common.retry")}
        </Button>
      )}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl bg-muted" />
      ))}
    </div>
  );
}

export function JocAmount({
  value,
  className,
  signed,
}: {
  value: number | string | null | undefined;
  className?: string;
  signed?: boolean;
}) {
  const { fmtNum } = useI18n();
  const n = Number(value ?? 0);
  return (
    <span className={cn("num", className)} dir="ltr">
      {signed && n > 0 ? "+" : ""}
      {fmtNum(n, 4)} <span className="text-[0.75em] text-muted-foreground">JOC</span>
    </span>
  );
}
