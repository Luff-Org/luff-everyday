import type { ProfileStats, ProfileUser } from "@/features/profile/types";

/** Typed client for the profile API. The single place that talks HTTP to `/api/profile`. */
export const profileApi = {
  async get(): Promise<ProfileStats> {
    const res = await fetch("/api/profile");
    if (!res.ok) throw new Error(`Request to /api/profile failed (${res.status})`);
    return res.json() as Promise<ProfileStats>;
  },

  async update(input: { name: string; image?: string | null }): Promise<ProfileUser> {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`Request to /api/profile failed (${res.status})`);
    return res.json() as Promise<ProfileUser>;
  },
};
