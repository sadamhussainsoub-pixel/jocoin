import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Gift,
  History,
  LayoutGrid,
  LogOut,
  Pickaxe,
  Send,
  Shield,
  Trophy,
  User,
  Users,
  Wallet,
  Map,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isAdminQuery, walletQuery } from "@/lib/api";
import { useI18n, type DictKey } from "@/lib/i18n";
import { Logo } from "@/components/brand/Logo";
import { LanguageToggle } from "./LanguageToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: DictKey; icon: typeof Pickaxe };

const primary: NavItem[] = [
  { to: "/dashboard", label: "nav.dashboard", icon: Pickaxe },
  { to: "/wallet", label: "nav.wallet", icon: Wallet },
  { to: "/airdrops", label: "nav.airdrops", icon: Gift },
  { to: "/referrals", label: "nav.referrals", icon: Users },
];

const secondary: NavItem[] = [
  { to: "/history", label: "nav.history", icon: History },
  { to: "/withdraw", label: "nav.withdraw", icon: Send },
  { to: "/leaderboard", label: "nav.leaderboard", icon: Trophy },
  { to: "/profile", label: "nav.profile", icon: User },
  { to: "/roadmap", label: "nav.roadmap", icon: Map },
];

const adminItem: NavItem = { to: "/admin", label: "nav.admin", icon: Shield };

export function AppShell({ userId, children }: { userId: string; children: ReactNode }) {
  const { t, fmtNum } = useI18n();
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: wallet } = useQuery(walletQuery(userId));
  const { data: isAdmin } = useQuery(isAdminQuery(userId));
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const all = [...primary, ...secondary, ...(isAdmin ? [adminItem] : [])];
  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-dvh md:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-e border-sidebar-border bg-sidebar/80 p-4 backdrop-blur md:flex">
        <Logo to="/dashboard" className="px-2 py-2" />
        <nav aria-label="Main" className="mt-6 flex flex-1 flex-col gap-1">
          {all.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                isActive(item.to)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
              aria-current={isActive(item.to) ? "page" : undefined}
            >
              <item.icon className={cn("size-4", isActive(item.to) && "text-gold")} aria-hidden />
              {t(item.label)}
            </Link>
          ))}
        </nav>
        <div className="space-y-2 border-t border-sidebar-border pt-4">
          <LanguageToggle />
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={signOut}>
            <LogOut /> {t("nav.signOut")}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur md:px-8">
          <Logo to="/dashboard" className="md:hidden" />
          <div className="hidden items-center gap-2 md:flex">
            <Badge variant="gold">{t("simulated.badge")}</Badge>
          </div>
          <Link
            to="/wallet"
            className="num flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1.5 text-sm text-gold-light"
            dir="ltr"
          >
            <Wallet className="size-4 text-gold" aria-hidden />
            {fmtNum(wallet?.balance ?? 0, 2)} JOC
          </Link>
        </header>

        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-12">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Main"
        className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/90 backdrop-blur-xl md:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-5 px-2 pt-2">
          {primary.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px]",
                  isActive(item.to) ? "text-gold-light" : "text-muted-foreground",
                )}
                aria-current={isActive(item.to) ? "page" : undefined}
              >
                <item.icon className={cn("size-5", isActive(item.to) && "text-gold")} aria-hidden />
                {t(item.label)}
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={cn(
                "flex w-full flex-col items-center gap-1 rounded-xl py-1.5 text-[11px]",
                [...secondary, adminItem].some((i) => isActive(i.to)) ? "text-gold-light" : "text-muted-foreground",
              )}
              aria-haspopup="dialog"
            >
              <LayoutGrid className="size-5" aria-hidden />
              {t("nav.more")}
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl border-border bg-popover pb-8">
          <SheetHeader>
            <SheetTitle className="font-display">{t("nav.more")}</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-3 px-4">
            {[...secondary, ...(isAdmin ? [adminItem] : [])].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMoreOpen(false)}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface-2/60 p-4 text-xs"
              >
                <item.icon className="size-5 text-gold" aria-hidden />
                {t(item.label)}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 px-4">
            <LanguageToggle />
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut /> {t("nav.signOut")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
