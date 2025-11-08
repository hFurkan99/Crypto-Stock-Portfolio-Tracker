import React, { useEffect, useState } from "react";
import en from "@/locales/en.json";
import tr from "@/locales/tr.json";
import { I18nContext } from "@/lib/i18nContext";
import type { I18nContextType } from "@/lib/i18nContext";

type Resources = Record<string, Record<string, unknown>>;

const resources: Resources = {
  en,
  tr,
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("app:lang") || "tr";
    }
    return "tr";
  });

  useEffect(() => {
    try {
      localStorage.setItem("app:lang", lang);
    } catch {
      // ignore
    }
  }, [lang]);

  const t = (key: string, fallback?: string) => {
    const parts = key.split(".");
    let cur: unknown = resources[lang] ?? {};
    for (const p of parts) {
      if (
        cur &&
        typeof cur === "object" &&
        p in (cur as Record<string, unknown>)
      ) {
        cur = (cur as Record<string, unknown>)[p];
      } else {
        cur = undefined;
        break;
      }
    }
    if (typeof cur === "string") return cur;
    // fallback to english
    cur = resources["en"];
    for (const p of parts) {
      if (
        cur &&
        typeof cur === "object" &&
        p in (cur as Record<string, unknown>)
      ) {
        cur = (cur as Record<string, unknown>)[p];
      } else {
        cur = undefined;
        break;
      }
    }
    if (typeof cur === "string") return cur;
    return fallback ?? key;
  };

  const changeLanguage: I18nContextType["changeLanguage"] = (lng) =>
    setLang(lng);

  const value: I18nContextType = { lang, t, changeLanguage };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export default I18nProvider;
