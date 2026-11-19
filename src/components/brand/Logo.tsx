import { Link } from "@tanstack/react-router";
import coin from "@/assets/joc-coin.webp";
import { cn } from "@/lib/utils";

export function CoinMark({ className, eager }: { className?: string; eager?: boolean }) {
  return (
    <img
      src={coin}
      alt=""
      aria-hidden="true"
      width={512}
      height={512}
      loading={eager ? "eager" : "lazy"}
      className={cn("select-none", className)}
      draggable={false}
    />
  );
}

export function Logo({ to = "/", className }: { to?: "/" | "/dashboard"; className?: string }) {
  return (
    <Link to={to} className={cn("flex items-center gap-2", className)} aria-label="JoCoin home">
      <CoinMark className="size-8" eager />
      <span className="font-display text-lg font-semibold tracking-tight">
        <span className="text-gold">Jo</span>Coin
      </span>
    </Link>
  );
}
