import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../Context/Context";

export function useChatBotTexts() {
  const { globalServerStrapi, globalTokenStrapi, locale } = useContext(GlobalContext);
  const [texts, setTexts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${globalServerStrapi}/api/chat-bot?locale=${locale}`,
          {
            headers: {
              Authorization: `Bearer ${globalTokenStrapi}`
            }
          }
        );

        const json = await res.json();
        setTexts(json?.data?.attributes || null);
      } catch (err) {
        console.error("❌ Error loading chat-bot texts:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [globalServerStrapi, globalTokenStrapi, locale]);

  return { texts, loading };
}
