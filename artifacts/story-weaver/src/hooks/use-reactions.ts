/**
 * Локальный like/dislike — хранится в localStorage, обновляется без перезагрузки.
 * Каждый товар имеет начальный seed (на основе исходного рейтинга), который
 * затем меняется реакциями пользователей этой сессии/устройства.
 */
import { useState, useEffect, useCallback } from "react";
import { products } from "@/lib/store";

export interface ReactionCounts {
  likes: number;
  dislikes: number;
  userReaction: "like" | "dislike" | null;
}

interface ReactionState {
  likes: number;
  dislikes: number;
}

const STORAGE_KEY = "fm_reactions_v1";
const USER_KEY = "fm_user_reactions_v1";

const counts = new Map<number, ReactionState>();
const userReactions = new Map<number, "like" | "dislike">();
let listeners: Array<() => void> = [];

function seedFromRating(rating: number): ReactionState {
  // rating 0..5 -> распределяем 100 реакций пропорционально
  const total = 100;
  const likeRatio = Math.max(0, Math.min(1, (rating - 1) / 4));
  const likes = Math.round(total * likeRatio);
  return { likes, dislikes: total - likes };
}

function load() {
  if (counts.size > 0) return;
  let stored: Record<string, ReactionState> = {};
  let user: Record<string, "like" | "dislike"> = {};
  try {
    stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    user = JSON.parse(localStorage.getItem(USER_KEY) || "{}");
  } catch {}

  for (const p of products) {
    counts.set(p.id, stored[p.id] ?? seedFromRating(p.rating ?? 4.5));
  }
  for (const [k, v] of Object.entries(user)) {
    userReactions.set(Number(k), v);
  }
}

function persist() {
  const obj: Record<number, ReactionState> = {};
  counts.forEach((v, k) => { obj[k] = v; });
  const userObj: Record<number, "like" | "dislike"> = {};
  userReactions.forEach((v, k) => { userObj[k] = v; });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    localStorage.setItem(USER_KEY, JSON.stringify(userObj));
  } catch {}
}

function notify() {
  listeners.forEach(l => l());
}

export function getRating(productId: number): number {
  load();
  const c = counts.get(productId);
  if (!c) return 0;
  const total = c.likes + c.dislikes;
  if (total === 0) return 0;
  return (c.likes / total) * 5;
}

export function getReactionCounts(productId: number): ReactionState {
  load();
  return counts.get(productId) ?? { likes: 0, dislikes: 0 };
}

export function useReactions(productId: number) {
  load();
  const [, force] = useState(0);

  useEffect(() => {
    const l = () => force(n => n + 1);
    listeners.push(l);
    return () => { listeners = listeners.filter(x => x !== l); };
  }, []);

  const c = counts.get(productId) ?? { likes: 0, dislikes: 0 };
  const userReaction = userReactions.get(productId) ?? null;

  const react = useCallback(
    (type: "like" | "dislike") => {
      const cur = counts.get(productId) ?? { likes: 0, dislikes: 0 };
      const prev = userReactions.get(productId) ?? null;
      const next = { ...cur };

      if (prev === type) {
        // снять реакцию
        next[`${type}s` as "likes" | "dislikes"] = Math.max(0, next[`${type}s` as "likes" | "dislikes"] - 1);
        userReactions.delete(productId);
      } else {
        if (prev) {
          next[`${prev}s` as "likes" | "dislikes"] = Math.max(0, next[`${prev}s` as "likes" | "dislikes"] - 1);
        }
        next[`${type}s` as "likes" | "dislikes"] += 1;
        userReactions.set(productId, type);
      }

      counts.set(productId, next);
      persist();
      notify();
    },
    [productId],
  );

  return {
    likes: c.likes,
    dislikes: c.dislikes,
    userReaction,
    react,
    loading: false,
    rating: getRating(productId),
  };
}
