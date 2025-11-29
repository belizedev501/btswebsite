import React from "react";
import { StylesheetProvider, generateThemeStylesheet } from "@botpress/webchat";

export default function CustomThemeProvider({ colors, children }) {
  const stylesheet = generateThemeStylesheet({
    themeName: "bts",
    theme: {
      primaryColor: colors.primary,
      secondaryColor: colors.secondary,
      textColorOnPrimary: "#ffffff",
      textColor: "#1a1a1a",
      backgroundColor: "#ffffff"
    }
  });

  return <StylesheetProvider stylesheet={stylesheet}>{children}</StylesheetProvider>;
}
