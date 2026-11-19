import { ArrowDownLeft, ArrowUpRight, Gift, Pickaxe, Users, Undo2 } from "lucide-react";
import type { LedgerEntry } from "@/lib/api";
import { useI18n, type DictKey } from "@/lib/i18n";
import { JocAmount } from "./ui-kit";
import { cn } from "@/lib/utils";

const icons = {
  mining: Pickaxe,
  referral_bonus: Users,
  referral_commission: Users,
  airdrop: Gift,
  withdrawal_hold: ArrowUpRight,
  withdrawal_refund: Undo2,
} as const;

export function LedgerRow({ entry, showBalance }: { entry: LedgerEntry; showBalance?: boolean }) {
  const { t, fmtDate, fmtNum } = useI18n();
  const Icon = icons[entry.entry_type] ?? ArrowDownLeft;
  const positive = Number(entry.amount) > 0;
  return (
    <li className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface/60 px-3 py-3">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full border",
          positive ? "border-gold/30 bg-gold/10 text-gold" : "border-border bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{t(`ledger.${entry.entry_type}` as DictKey)}</p>
        <p className="text-xs text-muted-foreground">{fmtDate(entry.created_at, true)}</p>
      </div>
      <div className="text-end">
        <JocAmount
          value={entry.amount}
          signed
          className={cn("text-sm font-semibold", positive ? "text-gold-light" : "text-muted-foreground")}
        />
        {showBalance && (
          <p className="num text-[11px] text-muted-foreground" dir="ltr">
            {t("history.balanceAfter")}: {fmtNum(entry.balance_after, 4)}
          </p>
        )}
      </div>
    </li>
  );
}
