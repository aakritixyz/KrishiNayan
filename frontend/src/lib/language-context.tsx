"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Language = "en" | "hi" | "pa" | "mr";

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<
  LanguageContextType | undefined
>(undefined);

const SUPPORTED_LANGUAGES: Language[] = [
  "en",
  "hi",
  "pa",
  "mr",
];

function isLanguage(
  value: string | null
): value is Language {
  return (
    value !== null &&
    SUPPORTED_LANGUAGES.includes(
      value as Language
    )
  );
}

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguageState] =
    useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem(
      "krishinayan-language"
    );

    if (isLanguage(saved)) {
      setLanguageState(saved);
    }
  }, []);

  function setLanguage(
    newLanguage: Language
  ) {
    setLanguageState(newLanguage);

    localStorage.setItem(
      "krishinayan-language",
      newLanguage
    );
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}