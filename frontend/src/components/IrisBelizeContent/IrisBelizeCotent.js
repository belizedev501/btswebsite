import React, { useContext } from 'react';
import ReactMarkdown from 'react-markdown';
import './IrisBelizeCotent.component.css';
import { useStrapiSingle } from '../Strapi/strapiCollection';
import { GlobalContext } from '../Context/Context';

const IrisBelizeCotent = () => {
    const { locale } = useContext(GlobalContext);
    const { data: irisBelizeData, loading } = useStrapiSingle('iris-belize', '=*');

    if (loading) return <div className="iris-belize-loading">Loading...</div>;
    if (!irisBelizeData) return null;

    const attributes = irisBelizeData.attributes || irisBelizeData;

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

    const title = attributes.IRIS_Belize_Title || 'IRIS Belize';
    const subTitle = attributes.IRIS_Belize_SubTitle || '';
    const textRaw = attributes.IRIS_Belize_Text || '';
    const text = typeof textRaw === 'string' ? textRaw : blocksToMarkdown(textRaw);

    const loginText = attributes.IRIS_Belize_Login_Button_Text
        || (locale === 'es' ? 'Iniciar sesión en IRIS Belize' : 'Login to IRIS Belize');
    const loginUrl = attributes.IRIS_Belize_Login_Button_URL || '#';
    const registerText = attributes.IRIS_Belize_Register_Button_Text || 'Register for an online user account';
    const registerUrl = attributes.IRIS_Belize_Register_Button_URL || '#';

    return (
        <section className="iris-belize-container">
            <div className="iris-belize-hero">
                <h2 className="iris-belize-title">{title}</h2>
                {subTitle && <h3 className="iris-belize-subtitle">{subTitle}</h3>}
            </div>

            {text && (
                <ReactMarkdown className="iris-belize-text">
                    {text}
                </ReactMarkdown>
            )}

            <div className="iris-belize-actions">
                {loginUrl && (
                    <a className="btn btn-primary iris-belize-button" href={loginUrl} target='_blank'>
                        <span className="iris-belize-button-text">{loginText}</span>
                    </a>
                )}
                {registerUrl && (
                    <a className="btn btn-secondary iris-belize-button" href={registerUrl} target='_blank'>
                        <span className="iris-belize-button-text">{registerText}</span>
                    </a>
                )}
            </div>
        </section>
    );
};

export default IrisBelizeCotent;
