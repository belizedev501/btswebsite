import React from 'react';
import ReactMarkdown from 'react-markdown';
import './AboutUsContent.component.css';
import { useStrapiSingle } from '../Strapi/strapiCollection';

const AboutUsContent = () => {
    const { data: aboutUsData, loading } = useStrapiSingle(
        'about-us',
        '[About_Us_Content][populate]=*&populate[About_Us_Info][populate]=*'
    );

    if (loading) return <div className="about-us-loading">Loading...</div>;
    if (!aboutUsData) return null;

    const attributes = aboutUsData.attributes || aboutUsData;

    const title = attributes.About_Us_Title || "About Us";
    const contentList = attributes.About_Us_Content?.data || attributes.About_Us_Content || [];
    const infoList = attributes.About_Us_Info?.data || attributes.About_Us_Info || [];

    const blocksToMarkdown = (blocks) => {
        if (!Array.isArray(blocks)) return '';
        const renderInline = (children = []) => children.map((child) => {
            const text = child.text || '';
            if (child.bold) return `**${text}**`;
            if (child.italic) return `*${text}*`;
            if (child.underline) return `__${text}__`;
            return text;
        }).join('');

        return blocks.map((block) => {
            if (block.type === 'paragraph') {
                return renderInline(block.children);
            }
            if (block.type === 'heading') {
                const level = Math.min(Math.max(block.level || 2, 1), 6);
                return `${'#'.repeat(level)} ${renderInline(block.children)}`;
            }
            if (block.type === 'list') {
                const ordered = block.format === 'ordered';
                return (block.children || []).map((item, idx) => {
                    const prefix = ordered ? `${idx + 1}. ` : '- ';
                    return `${prefix}${renderInline(item.children)}`;
                }).join('\n');
            }
            return '';
        }).filter(Boolean).join('\n\n');
    };

    return (
        <div className="about-us-container">
            <h2 className="about-us-main-title">{title}</h2>

            <div className="about-us-content-section">
                {contentList.map((item, index) => {
                    const sectionTitle = item?.attributes?.About_Us_Content_Title || item?.About_Us_Content_Title;
                    const sectionTextRaw = item?.attributes?.About_Us_Content_Text || item?.About_Us_Content_Text;
                    const sectionText = typeof sectionTextRaw === 'string'
                        ? sectionTextRaw
                        : blocksToMarkdown(sectionTextRaw);

                    return (
                        <div key={index} className="about-us-text-block">
                            <h3 className="about-us-section-title">{sectionTitle}</h3>
                            <ReactMarkdown className="about-us-content-section-bodyy">
                                {sectionText || ''}
                            </ReactMarkdown>
                        </div>
                    );
                })}


                {infoList.length > 0 && (
                    <div className="about-us-pride-section">
                        <div className="row">

                            {infoList.map((info, index) => {
                                const letter = info.About_Us_Info_Letter;
                                const word = info.About_Us_Info_Word;
                                const text = info.About_Us_Info_Text;
                                return (
                                    <div key={index} className="col-md">
                                        <div key={index} className="about-us-pride-letter-section">
                                            <div className='row'>
                                                <h4>{letter}</h4>
                                            </div>
                                            <div className='row'>
                                                <h5>{word}</h5>
                                            </div>
                                            <div className='row'>
                                                <p>{text}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AboutUsContent;
