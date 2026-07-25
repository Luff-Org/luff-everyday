import type { ProfileStats } from "@/features/profile/types";

/** Typed client for the profile API. The single place that talks HTTP to `/api/profile`. */
export const profileApi = {
  async get(): Promise<ProfileStats> {
    const res = await fetch("/api/profile");
    if (!res.ok) throw new Error(`Request to /api/profile failed (${res.status})`);
    return res.json() as Promise<ProfileStats>;
  },
};
