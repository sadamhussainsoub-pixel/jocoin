import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];
export type Profile = Tables["profiles"]["Row"];
export type Wallet = Tables["wallets"]["Row"];
export type LedgerEntry = Tables["reward_ledger"]["Row"];
export type MiningSession = Tables["mining_sessions"]["Row"];
export type Settings = Tables["app_settings"]["Row"];
export type Airdrop = Tables["airdrops"]["Row"];
export type Withdrawal = Tables["withdrawal_requests"]["Row"];
export type AuditLog = Tables["audit_logs"]["Row"];
export type LedgerType = Database["public"]["Enums"]["ledger_entry_type"];

/** Error carrying a server error code (e.g. SESSION_NOT_READY) for translated display. */
export class ApiError extends Error {
  constructor(
    public code: string,
    public payload?: Record<string, unknown>,
  ) {
    super(code);
  }
}

type RpcResult = { ok: boolean; error?: string; [k: string]: unknown };

function codeFromPgMessage(message: string) {
  const m = message.match(/[A-Z_]{4,}/);
  return m ? m[0] : "UNKNOWN";
}

/** Calls an action RPC that returns { ok, error } JSON and throws ApiError on failure. */
async function action<T extends RpcResult>(promise: PromiseLike<{ data: unknown; error: { message: string } | null }>) {
  const { data, error } = await promise;
  if (error) throw new ApiError(codeFromPgMessage(error.message));
  const res = data as T;
  if (!res?.ok) throw new ApiError(res?.error ?? "UNKNOWN", res);
  return res;
}

/** Calls an admin RPC that raises on failure. */
async function adminCall<T>(promise: PromiseLike<{ data: T; error: { message: string } | null }>) {
  const { data, error } = await promise;
  if (error) throw new ApiError(codeFromPgMessage(error.message));
  return data;
}

function must<T>(res: { data: T; error: { message: string } | null }) {
  if (res.error) throw new ApiError(codeFromPgMessage(res.error.message));
  return res.data;
}

// ---------- Queries ----------
export const qk = {
  profile: (uid: string) => ["profile", uid] as const,
  wallet: (uid: string) => ["wallet", uid] as const,
  session: (uid: string) => ["session", uid] as const,
  settings: ["settings"] as const,
  ledger: (uid: string, page: number, type: string) => ["ledger", uid, page, type] as const,
  recent: (uid: string) => ["ledger-recent", uid] as const,
  isAdmin: (uid: string) => ["is-admin", uid] as const,
};

export const settingsQuery = () =>
  queryOptions({
    queryKey: qk.settings,
    queryFn: async () => must(await supabase.from("app_settings").select("*").eq("id", 1).single()),
    staleTime: 30_000,
  });

export const publicStatsQuery = () =>
  queryOptions({
    queryKey: ["public-stats"],
    queryFn: async () =>
      must(await supabase.rpc("get_public_stats")) as {
        miners: number;
        total_distributed: number;
        claims: number;
      },
    staleTime: 60_000,
  });

export const profileQuery = (uid: string) =>
  queryOptions({
    queryKey: qk.profile(uid),
    queryFn: async () => must(await supabase.from("profiles").select("*").eq("id", uid).single()),
  });

export const walletQuery = (uid: string) =>
  queryOptions({
    queryKey: qk.wallet(uid),
    queryFn: async () => must(await supabase.from("wallets").select("*").eq("user_id", uid).single()),
  });

export const activeSessionQuery = (uid: string) =>
  queryOptions({
    queryKey: qk.session(uid),
    queryFn: async () =>
      must(
        await supabase
          .from("mining_sessions")
          .select("*")
          .eq("user_id", uid)
          .eq("status", "active")
          .maybeSingle(),
      ),
  });

export const recentLedgerQuery = (uid: string) =>
  queryOptions({
    queryKey: qk.recent(uid),
    queryFn: async () =>
      must(
        await supabase
          .from("reward_ledger")
          .select("*")
          .eq("user_id", uid)
          .order("created_at", { ascending: false })
          .limit(5),
      ),
  });

export const PAGE_SIZE = 20;
export const ledgerQuery = (uid: string, page: number, type: LedgerType | "all") =>
  queryOptions({
    queryKey: qk.ledger(uid, page, type),
    queryFn: async () => {
      let q = supabase
        .from("reward_ledger")
        .select("*", { count: "exact" })
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      if (type !== "all") q = q.eq("entry_type", type);
      const res = await q;
      if (res.error) throw new ApiError(codeFromPgMessage(res.error.message));
      return { rows: res.data, count: res.count ?? 0 };
    },
  });

export const isAdminQuery = (uid: string) =>
  queryOptions({
    queryKey: qk.isAdmin(uid),
    queryFn: async () => must(await supabase.rpc("has_role", { _user_id: uid, _role: "admin" })),
    staleTime: 60_000,
  });

export const myRankQuery = (uid: string) =>
  queryOptions({
    queryKey: ["my-rank", uid],
    queryFn: async () => must(await supabase.rpc("get_my_rank")) as { rank: number; total: number } | null,
  });

export const leaderboardQuery = () =>
  queryOptions({
    queryKey: ["leaderboard"],
    queryFn: async () => must(await supabase.rpc("get_leaderboard", { p_limit: 50 })),
    staleTime: 30_000,
  });

export const myReferralsQuery = (uid: string) =>
  queryOptions({
    queryKey: ["my-referrals", uid],
    queryFn: async () => must(await supabase.rpc("get_my_referrals")),
  });

export const airdropsQuery = (uid: string) =>
  queryOptions({
    queryKey: ["airdrops", uid],
    queryFn: async () => {
      const [drops, claims] = await Promise.all([
        supabase.from("airdrops").select("*").eq("is_active", true).order("created_at", { ascending: false }),
        supabase.from("airdrop_claims").select("airdrop_id").eq("user_id", uid),
      ]);
      const claimed = new Set((must(claims) ?? []).map((c) => c.airdrop_id));
      return (must(drops) ?? []).map((a) => ({ ...a, claimed: claimed.has(a.id) }));
    },
  });

export const myWithdrawalsQuery = (uid: string) =>
  queryOptions({
    queryKey: ["withdrawals", uid],
    queryFn: async () =>
      must(
        await supabase
          .from("withdrawal_requests")
          .select("*")
          .eq("user_id", uid)
          .order("created_at", { ascending: false })
          .limit(50),
      ),
  });

// ---------- User actions (validated & executed atomically on the server) ----------
export const api = {
  startMining: () => action<RpcResult & { ends_at: string }>(supabase.rpc("start_mining")),
  claimReward: (idempotencyKey: string) =>
    action<RpcResult & { reward: number; balance: number; next_claim_at: string; replayed: boolean }>(
      supabase.rpc("claim_mining_reward", { p_idempotency_key: idempotencyKey }),
    ),
  claimAirdrop: (id: string) =>
    action<RpcResult & { amount: number; balance: number }>(supabase.rpc("claim_airdrop", { p_airdrop_id: id })),
  requestWithdrawal: (amount: number, address: string, network: string) =>
    action<RpcResult & { id: string }>(
      supabase.rpc("request_withdrawal", { p_amount: amount, p_wallet_address: address, p_network: network }),
    ),
  cancelWithdrawal: (id: string) => action(supabase.rpc("cancel_withdrawal", { p_id: id })),
  updateProfile: async (uid: string, patch: { display_name?: string; locale?: "en" | "ar" }) =>
    must(await supabase.from("profiles").update(patch).eq("id", uid).select().single()),
};

// ---------- Admin (every call re-checks the admin role on the server) ----------
export type AdminStats = Record<
  | "users"
  | "suspended"
  | "new_users_24h"
  | "active_miners_24h"
  | "claims_24h"
  | "circulating"
  | "locked"
  | "total_mined"
  | "total_referral"
  | "total_airdrop"
  | "pending_withdrawals"
  | "pending_withdrawal_amount"
  | "referrals",
  number
>;

export const adminStatsQuery = () =>
  queryOptions({
    queryKey: ["admin", "stats"],
    queryFn: async () => (await adminCall(supabase.rpc("admin_stats"))) as unknown as AdminStats,
  });

export const adminUsersQuery = (search: string, page: number) =>
  queryOptions({
    queryKey: ["admin", "users", search, page],
    queryFn: () =>
      adminCall(supabase.rpc("admin_list_users", { p_search: search, p_limit: 25, p_offset: page * 25 })),
  });

export const adminWithdrawalsQuery = (status: "pending" | "all") =>
  queryOptions({
    queryKey: ["admin", "withdrawals", status],
    queryFn: async () => {
      let q = supabase.from("withdrawal_requests").select("*").order("created_at", { ascending: false }).limit(100);
      if (status === "pending") q = q.eq("status", "pending");
      return must(await q);
    },
  });

export const adminAirdropsQuery = () =>
  queryOptions({
    queryKey: ["admin", "airdrops"],
    queryFn: async () => must(await supabase.from("airdrops").select("*").order("created_at", { ascending: false })),
  });

export const adminAuditQuery = (action: string) =>
  queryOptions({
    queryKey: ["admin", "audit", action],
    queryFn: async () => {
      let q = supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100);
      if (action) q = q.ilike("action", `${action}%`);
      return must(await q);
    },
  });

export const adminApi = {
  setUserStatus: (uid: string, status: "active" | "suspended", reason?: string) =>
    adminCall(supabase.rpc("admin_set_user_status", { p_user: uid, p_status: status, ...(reason ? { p_reason: reason } : {}) })),
  setAdmin: (uid: string, grant: boolean) => adminCall(supabase.rpc("admin_set_admin", { p_user: uid, p_grant: grant })),
  updateSettings: (patch: Partial<Settings>) =>
    adminCall(supabase.rpc("admin_update_settings", { p: patch as never })),
  reviewWithdrawal: (id: string, approve: boolean, note?: string) =>
    adminCall(supabase.rpc("admin_review_withdrawal", { p_id: id, p_approve: approve, ...(note ? { p_note: note } : {}) })),
  saveAirdrop: (a: {
    id: string | null;
    title: string;
    title_ar: string;
    description: string;
    description_ar: string;
    amount: number;
    starts_at: string;
    ends_at: string | null;
    max_claims: number | null;
    is_active: boolean;
  }) =>
    adminCall(
      supabase.rpc("admin_save_airdrop", {
        p_id: a.id as string,
        p_title: a.title,
        p_title_ar: a.title_ar,
        p_description: a.description,
        p_description_ar: a.description_ar,
        p_amount: a.amount,
        p_starts_at: a.starts_at,
        p_ends_at: a.ends_at as string,
        p_max_claims: a.max_claims as number,
        p_is_active: a.is_active,
      }),
    ),
};
