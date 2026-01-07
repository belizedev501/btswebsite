import { createContext, useState, useEffect } from 'react';

export const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  // Valores de Strapi tomados del entorno de build (ver .env.*)
  const defaultStrapiToken = process.env.REACT_APP_STRAPI_TOKEN || '';
  const defaultStrapiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';

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
