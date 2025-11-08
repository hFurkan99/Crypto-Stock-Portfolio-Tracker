import React from "react";

export type I18nContextType = {
  lang: string;
  t: (key: string, fallback?: string) => string;
  changeLanguage: (lng: string) => void;
};

export const I18nContext = React.createContext<I18nContextType | undefined>(
  undefined
);

export default I18nContext;
