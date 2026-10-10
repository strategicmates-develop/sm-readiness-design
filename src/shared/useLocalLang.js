// Local language hook for the public assessment pages (no i18next). Keeps the
// bilingual copy inside each page as a `T = { es, en }` object and persists the
// choice in localStorage. Vendored from sm-platform AssessmentLayout.jsx.
import { useState } from 'react';

export function useLocalLang(translations) {
  const [lang, setLang] = useState(
    () => localStorage.getItem('sm_assessment_lang') || 'es',
  );
  const setLanguage = (l) => {
    setLang(l);
    localStorage.setItem('sm_assessment_lang', l);
  };
  const t = (key, vars = {}) => {
    let str = translations[lang]?.[key] ?? translations.en?.[key] ?? key;
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, v);
    });
    return str;
  };
  return { lang, setLanguage, t };
}