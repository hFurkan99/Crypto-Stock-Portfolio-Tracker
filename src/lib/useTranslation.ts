import { useContext } from "react";
import { I18nContext } from "@/lib/i18nContext";
import type { I18nContextType } from "@/lib/i18nContext";

export function useTranslation() {
  const c = useContext(I18nContext) as I18nContextType | undefined;
  if (!c) {
    const fallback: I18nContextType = {
      lang: "en",
      t: (k: string) => k,
      changeLanguage: () => undefined,
    };
    return {
      t: fallback.t,
      i18n: { changeLanguage: fallback.changeLanguage },
      lang: fallback.lang,
    };
  }
  return { t: c.t, i18n: { changeLanguage: c.changeLanguage }, lang: c.lang };
}

export default useTranslation;
