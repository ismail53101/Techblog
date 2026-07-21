"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "techblog:bookmarks";
const EVENT = "techblog:bookmarks-changed";

export type Bookmark = {
  slug: string;
  title: string;
  savedAt: number;
};

function read(): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Bookmark[]) : [];
  } catch {
    return [];
  }
}

function write(list: Bookmark[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Reader bookmarks persisted in localStorage (no account required).
 * Multiple mounted components stay in sync via a custom window event.
 */
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setBookmarks(read());
    setHydrated(true);
    const sync = () => setBookmarks(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isBookmarked = useCallback(
    (slug: string) => bookmarks.some((b) => b.slug === slug),
    [bookmarks]
  );

  const toggle = useCallback((bookmark: Omit<Bookmark, "savedAt">) => {
    const current = read();
    const exists = current.some((b) => b.slug === bookmark.slug);
    const next = exists
      ? current.filter((b) => b.slug !== bookmark.slug)
      : [{ ...bookmark, savedAt: Date.now() }, ...current];
    write(next);
    return !exists;
  }, []);

  const remove = useCallback((slug: string) => {
    write(read().filter((b) => b.slug !== slug));
  }, []);

  return { bookmarks, isBookmarked, toggle, remove, hydrated };
}
