import { useEffect, useState } from 'react';
/*import React, { useEffect, useState, useContext } from 'react';*/
import './ChatBot.component.css';
import { useStrapiSingle } from '../Strapi/strapiCollection';
/*import { GlobalContext } from '../Context/Context'; // ⬅️ importar contexto*/

const ChatBot = () => {
    const [chatBot, setChatBot] = useState(null);
    const [loading, setLoading] = useState(true);
    /*const { globalServerStrapi } = useContext(GlobalContext);*/
    const {
        data: strapiChatBot,
        loading: strapiChatBotLoading,
        error: strapiChatBotError
    } = useStrapiSingle(`chat-bot`, `=*`);

    useEffect(() => {
        if (strapiChatBot) setChatBot(strapiChatBot);
        setLoading(strapiChatBotLoading);
        if (strapiChatBotError) {
            console.error("Error fetching Chat Bot:", strapiChatBotError);
        }
    }, [strapiChatBot, strapiChatBotLoading, strapiChatBotError]);

    return (
        (!loading && chatBot?.Chat_Bot_Input_placeholder) ? (
            <div className='chat-bot-container'>
                <div className='row chat-bot-title-area'>
                    <div className='col-2 chat-bot-title-icon-area'>
                        <span className='icon-size_1 icon-headset-solid' />
                    </div>
                    <div className='col-10'>
                        <h5>{chatBot.Chat_Bot_Header_Title}</h5>
                        <h6>{chatBot.Chat_Bot_Header_Subtitle}</h6>
                    </div>
                </div>
                <div className='chat-bot-status-area'>
                    <p>{chatBot.Chat_Bot_Status_Disconnected}</p>
                </div>

                <div className='chat-bot-chat-area'>
                </div>

                <div className='chat-bot-message-area'>
                    <div className='col-10 chat-bot-message-typing-area'>
                        <input
                            type="text"
                            className='chat-bot-message-typing-input'
                            placeholder={chatBot.Chat_Bot_Input_placeholder}
                        />
                    </div>
                    <div className='col-2 chat-bot-message-buttons-area'>
                        <div className='chat-bot-message-send-button' title={chatBot.Chat_Bot_Button_Send}>
                            <span className='icon-size_4 icon-paper-plane-solid' />
                        </div>
                        <div className='chat-bot-message-clear-button' title={chatBot.Chat_Bot_Button_Clear}>
                            <span className='icon-size_3 icon-eraser-solid-full' />
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <div>Loading...</div>
        )
    )
};

export default ChatBot;