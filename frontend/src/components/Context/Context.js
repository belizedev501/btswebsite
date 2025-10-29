import { createContext, useState, useEffect } from 'react';

export const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  // 🔑 Credenciales y servidor de Strapi
  const [globalTokenStrapi, setglobalTokenStrapi] = useState(
    "49bc7fde43cfb1ec77893d9afab479d8562960f6be526722d984d0c06b54f523aeed6ddd493baa3710940960b468f3a20fc203c373e1a2b5906b9dcca0b83e199a70523a00369bbeb876b79a2e0eb62f74d4e07cbf907db6a4b9759ee655e7362e48d6b8f2b0638302c6fd2bbb1611ec23d3ffe6211a7911cc544b49c3f4c180"
  );

  const [globalServerStrapi, setglobalServerStrapi] = useState(
    "http://10.147.18.240:1337"
  );

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
