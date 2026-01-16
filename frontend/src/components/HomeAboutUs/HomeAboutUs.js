import React, { useEffect, useState, useContext } from 'react';
import './HomeAboutUs.component.css'; 
import { GlobalContext } from '../Context/Context';

const HomeAboutUs = () => {
    const [aboutUsData, setAboutUsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { globalServerStrapi } = useContext(GlobalContext);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const baseUrl = globalServerStrapi || 'http://localhost:1337';
                
                const query = 'populate[About_Us_Content][populate]=*&populate[About_Us_Info][populate]=*';
                const url = `${baseUrl}/api/about-us?${query}`;
                
                const response = await fetch(url);
                const json = await response.json();

                if (json.data) {
                    setAboutUsData(json.data);
                }
            } catch (err) {
                console.error("Error loading About Us content:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [globalServerStrapi]);

    const renderBlockContent = (content) => {
        if (!content) return null;
        
        if (Array.isArray(content)) {
            return content.map((block, index) => {
                if (block.type === 'paragraph') {
                    return (
                        <p key={index} className="block-paragraph">
                            {block.children.map((child, idx) => {
                                if (child.bold) return <strong key={idx}>{child.text}</strong>;
                                if (child.italic) return <em key={idx}>{child.text}</em>;
                                if (child.underline) return <u key={idx}>{child.text}</u>;
                                return child.text;
                            })}
                        </p>
                    );
                }
                if (block.type === 'list') {
                    const ListTag = block.format === 'ordered' ? 'ol' : 'ul';
                    return (
                        <ListTag key={index} className="block-list">
                            {block.children.map((item, idx) => (
                                <li key={idx}>
                                    <p className="block-paragraph">
                                        {item.children.map(c => c.text).join('')}
                                    </p>
                                </li>
                            ))}
                        </ListTag>
                    );
                }
                if (block.type === 'heading') {
                    const HeaderTag = `h${block.level}`;
                    return (
                        <HeaderTag key={index} className="block-heading">
                            {block.children.map(c => c.text).join('')}
                        </HeaderTag>
                    );
                }
                return null;
            });
        }
        return <p className="block-paragraph">{content}</p>;
    };

    if (loading) return <div className="about-loading">Loading...</div>;
    if (!aboutUsData) return null;

    const attributes = aboutUsData.attributes || aboutUsData; 
    
    const title = attributes.About_Us_Title || "About Us";
    const contentList = attributes.About_Us_Content || [];
    const infoList = attributes.About_Us_Info || [];

    return (
        <div className="about-us-container">
            <h2 className="main-title">{title}</h2>

            <div className="content-section">
                {contentList.map((item, index) => {
                    const sectionTitle = item.About_Us_Content_Title;
                    const sectionText = item.About_Us_Content_Text;

                    return (
                        <div key={index} className="text-block">
                            <h3 className="section-title">{sectionTitle}</h3>
                            <div className="section-body">
                                {renderBlockContent(sectionText)}
                            </div>
                        </div>
                    );
                })}
            </div>

            {infoList.length > 0 && (
                <div className="pride-section">
                    <div className="pride-grid">
                        <div className="pride-top-container">
                            {infoList.map((info, index) => {
                                const letter = info.About_Us_Info_Letter;
                                const word = info.About_Us_Info_Word;

                                return (
                                    <div key={`top-${index}`} className="pride-card-top">
                                        <div className="pride-letter-container">
                                            <span className="pride-letter-shadow">{letter}</span>
                                            <span className="pride-letter">{letter}</span>
                                        </div>
                                        <div className="pride-word">{word}</div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pride-bottom-container">
                            {infoList.map((info, index) => {
                                const text = info.About_Us_Info_Text;

                                return (
                                    <div key={`bottom-${index}`} className="pride-card">
                                        <div className="pride-card-bottom">
                                            <p className="pride-text">{text}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeAboutUs;