import { createContext, useState, useEffect } from 'react';

export const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  // 🔑 Credenciales y servidor de Strapi
  const [globalTokenStrapi, setglobalTokenStrapi] = useState(
    //Llave para strapi en BTS desarrollo AS
    "2e3357edded339312988141c6ab724bdc403a884a37f8c50e53af56c44c1a01286d9e6d72f8f4c6eb7c4ba0d5f83e6a10538406a4fffd71c7b8bfe507fbfffb553278bde949d99820e381eb7b2f8e7991f79a75c5b98285b978c0ab67dbe1330bccdb147faadafa9d8841061dba4d3ea96296a59aaeeeb580032675683a9796a"
  );

  const [globalServerStrapi, setglobalServerStrapi] = useState(
    //Servidor para strapi en BTS desarrollo AS
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
