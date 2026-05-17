import { KZ_CITIES, type KzCity } from "./supabase";

const KEY = "qazaq-dama:identity-v1";

export type Identity = {
  nickname: string;
  city: KzCity;
};

export function loadIdentity(): Identity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Identity;
    if (!parsed?.nickname || !parsed?.city) return null;
    if (!KZ_CITIES.includes(parsed.city as KzCity)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveIdentity(identity: Identity): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(identity));
}
