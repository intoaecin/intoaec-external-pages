import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const SUPPORTED_LANGUAGES = ["en", "es"] as const;

const loadTranslation = async (language: (typeof SUPPORTED_LANGUAGES)[number]) => {
  const response = await fetch(`/locales/${language}/translation.json`);
  if (!response.ok) {
    throw new Error(`Unable to load ${language} translations.`);
  }
  return response.json();
};

export const initializeI18n = async () => {
  if (i18n.isInitialized) return i18n;

  const translations = await Promise.all(
    SUPPORTED_LANGUAGES.map(async (language) => [language, await loadTranslation(language)]),
  );
  const resources = Object.fromEntries(
    translations.map(([language, translation]) => [language, { translation }]),
  );
  const preferredLanguage = localStorage.getItem("preferredLanguage");
  const language = SUPPORTED_LANGUAGES.includes(preferredLanguage as "en" | "es")
    ? preferredLanguage!
    : "en";

  await i18n.use(initReactI18next).init({
    resources,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    fallbackLng: "en",
    lng: language,
    defaultNS: "translation",
    ns: ["translation"],
    debug: false,
    load: "currentOnly",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

  document.documentElement.lang = language;
  return i18n;
};
