import { createContext, useState, useEffect } from 'react';

export const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  // Valores de Strapi tomados de runtime (window.__ENV__) o del entorno de build (ver .env.*)
  const runtimeEnv = typeof window !== 'undefined' && window.__ENV__ ? window.__ENV__ : {};
  const defaultStrapiToken = runtimeEnv.REACT_APP_STRAPI_TOKEN || process.env.REACT_APP_STRAPI_TOKEN || '';
  const defaultStrapiUrl = runtimeEnv.REACT_APP_STRAPI_URL || process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';

  const [globalTokenStrapi, setglobalTokenStrapi] = useState(defaultStrapiToken);
  const [globalServerStrapi, setglobalServerStrapi] = useState(defaultStrapiUrl);

  // 🌍 Idioma global (persistente)
  const [locale, setLocale] = useState(localStorage.getItem('locale') || 'en');

  // 🔁 Guardar automáticamente el idioma en localStorage
  useEffect(() => {
    localStorage.setItem('locale', locale);
  }, [locale]);

  return (
    <GlobalContext.Provider
      value={{
        globalTokenStrapi,
        setglobalTokenStrapi,
        globalServerStrapi,
        setglobalServerStrapi,
        locale,
        setLocale
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
