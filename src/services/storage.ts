import type { Holding } from "@/types/holding.types";
import type { WatchlistItem } from "@/types/watchlist.types";

// Şu anda kullanılmıyor

const STORAGE_KEYS = {
  HOLDINGS: "crypto-portfolio-holdings",
  WATCHLIST: "crypto-portfolio-watchlist",
  SETTINGS: "crypto-portfolio-settings",
} as const;

export const storage = {
  // Generic get
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  },

  // Generic set
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
    }
  },

  // Generic remove
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
    }
  },

  // Clear all
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },

  // Specific methods
  holdings: {
    get: () => storage.get<Holding[]>(STORAGE_KEYS.HOLDINGS) || [],
    set: (holdings: Holding[]) => storage.set(STORAGE_KEYS.HOLDINGS, holdings),
  },

  watchlist: {
    get: () => storage.get<WatchlistItem[]>(STORAGE_KEYS.WATCHLIST) || [],
    set: (watchlist: WatchlistItem[]) =>
      storage.set(STORAGE_KEYS.WATCHLIST, watchlist),
  },
};
