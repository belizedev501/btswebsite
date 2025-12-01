import React from "react";
import { Webchat } from "@botpress/webchat";
import CustomThemeProvider from "./CustomThemeProvider";
import { useChatBotTexts } from "../hooks/useChatBotTexts";

export default function BtsChat() {
  const { texts, loading } = useChatBotTexts();

  if (loading || !texts) return null;

  // Avatar del bot (cargar desde /public o desde Strapi)
  //const botAvatar = "/assets/bts_logo.png";

  return (
    <CustomThemeProvider
      colors={{
        primary: "#0D4D8B",
        secondary: "#F9B821"
      }}
    >
      <Webchat
        configuration={{
          // Obligatorio
          botId: "bts-assistant",
          clientId: "fc29bd8a-cea0-480f-a1c3-efc5b2d56956",

          // Avatar del bot
          botAvatarUrl: "/assets/bts_logo.png",

          // ===== HEADER =====
          header: {
            title: texts.Chat_Bot_Header_Title,       // "BTS Tax Expert"
            subtitle: texts.Chat_Bot_Header_Subtitle, // "Your personal tax advisor"
            onlineText: texts.Chat_Bot_Header_Online, // "Online"
            offlineText: texts.Chat_Bot_Header_Offline
          },

          // ===== COMPOSER =====
          composer: {
            placeholder: texts.Chat_Bot_Input_placeholder,   // "Write your message..."
            sendButtonLabel: texts.Chat_Bot_Button_Send,      // "Send"
            disabledPlaceholder: texts.Chat_Bot_Input_Disabled
          },

          // ===== BOT TYPING =====
          typing: {
            text: texts.Chat_Bot_Input_Typing // "Typing..."
          },

          // ===== ATTACH / UPLOAD =====
          attachments: {
            uploadLabel: texts.Chat_Bot_Button_Upload,       // "Upload"
            attachLabel: texts.Chat_Bot_Button_Attach,       // "Attach"
            fileTooLargeError: texts.Chat_Bot_File_Too_Large,
            unsupportedError: texts.Chat_Bot_File_Unsupported
          },

          // ===== SYSTEM MESSAGES =====
          systemMessages: {
            welcome: texts.Chat_Bot_System_Welcome,
            goodbye: texts.Chat_Bot_System_Goodbye,
            sessionExpired: texts.Chat_Bot_System_Session_Expired,
            noResponse: texts.Chat_Bot_System_No_Response,
            reconnecting: texts.Chat_Bot_System_Reconnect_prompt,
          },

          // ===== STATUS =====
          status: {
            connecting: texts.Chat_Bot_Status_Connecting,
            connected: texts.Chat_Bot_Status_Connected,
            disconnected: texts.Chat_Bot_Status_Disconnected,
            reconnecting: texts.Chat_Bot_Status_Reconnecting,
            agentJoined: texts.Chat_Bot_Status_Agent_Joined,
            agentLeft: texts.Chat_Bot_Status_Agent_Left,
            waitingAgent: texts.Chat_Bot_Status_Waiting_Agent
          },

          // ===== UI COLORS =====
          theme: {
            primaryColor: "#0D4D8B",
            secondaryColor: "#F9B821",
            backgroundColor: "#ffffff",
            textColor: "#1A1A1A"
          }
        }}
      />

    </CustomThemeProvider>
  );
}
