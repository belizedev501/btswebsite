import React, { useEffect, useMemo, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import './FAQsContent.component.css';
import { useStrapiCollection, useStrapiSingle } from '../Strapi/strapiCollection';

const normalizeItem = (item) => {
    if (!item) return null;
    if (item.attributes) {
        return { id: item.id, ...item.attributes };
    }
    return item;
};

const toArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (Array.isArray(value.data)) return value.data;
    if (value.data) return [value.data];
    return [];
};

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

const FAQsContent = () => {
    const { data: faqPageData, loading: faqPageLoading } = useStrapiSingle(
        'faq-page',
        '=*'
    );

    const {
        data: faqSectionsData,
        loading: faqSectionsLoading
    } = useStrapiCollection(
        'faq-sections',
        '[fields][0]=FAQ_Section_Name&populate[faq_themes][fields][0]=FAQ_Theme_Name&populate[faq_themes][populate][faqs][fields][0]=FAQ_Question&populate[faq_themes][populate][faqs][fields][1]=FAQ_Answer',
        'id',
        'asc'
    );

    const sections = useMemo(() => {
        return (faqSectionsData || [])
            .map(normalizeItem)
            .filter(Boolean);
    }, [faqSectionsData]);

    const [selectedThemeBySection, setSelectedThemeBySection] = useState({});
    const [openFaqByTheme, setOpenFaqByTheme] = useState({});

    useEffect(() => {
        if (!sections.length) return;
        setSelectedThemeBySection((prev) => {
            const next = { ...prev };
            sections.forEach((section) => {
                const themesRaw = toArray(section.faq_themes);
                const themes = themesRaw.map(normalizeItem).filter(Boolean);
                if (!next[section.id] && themes[0]) {
                    next[section.id] = themes[0].id;
                }
            });
            return next;
        });
    }, [sections]);

    const handleThemeSelect = useCallback((sectionId, themeId) => {
        setSelectedThemeBySection((prev) => ({
            ...prev,
            [sectionId]: themeId
        }));
        setOpenFaqByTheme((prev) => ({
            ...prev,
            [themeId]: null
        }));
    }, []);

    const toggleFaq = useCallback((themeId, faqId) => {
        setOpenFaqByTheme((prev) => ({
            ...prev,
            [themeId]: prev[themeId] === faqId ? null : faqId
        }));
    }, []);

    if (faqPageLoading || faqSectionsLoading) {
        return <div className="faqs-loading">Loading...</div>;
    }

    if (!faqPageData && !sections.length) return null;

    const pageAttributes = normalizeItem(faqPageData) || {};
    const pageTitle = pageAttributes.FAQ_Page_Title || 'Frequently Asked Questions (FAQs)';
    const pageTextRaw = pageAttributes.FAQ_Page_Text || '';
    const pageText = typeof pageTextRaw === 'string' ? pageTextRaw : blocksToMarkdown(pageTextRaw);

    return (
        <section className="faqs-container">
            <div className="faqs-header">
                <h2 className="faqs-title">{pageTitle}</h2>
                {pageText && (
                    <ReactMarkdown className="faqs-page-text">
                        {pageText}
                    </ReactMarkdown>
                )}
            </div>

            {sections.map((section) => {
                const sectionName = section.FAQ_Section_Name || '';
                const sectionTextRaw = section.FAQ_Section_Text || '';
                const sectionText = typeof sectionTextRaw === 'string'
                    ? sectionTextRaw
                    : blocksToMarkdown(sectionTextRaw);

                const themes = toArray(section.faq_themes)
                    .map(normalizeItem)
                    .filter(Boolean);

                const selectedThemeId = selectedThemeBySection[section.id]
                    || (themes[0] && themes[0].id);

                const selectedTheme = themes.find((theme) => theme.id === selectedThemeId) || themes[0];
                const faqs = selectedTheme
                    ? toArray(selectedTheme.faqs).map(normalizeItem).filter(Boolean)
                    : [];

                return (
                    <div key={section.id} className="faqs-section">
                        {sectionName && (
                            <h3 className="faqs-section-name">{sectionName}</h3>
                        )}

                        {sectionText && (
                            <ReactMarkdown className="faqs-section-info">
                                {sectionText}
                            </ReactMarkdown>
                        )}

                        <div className="faqs-section-body">
                            <div className="faqs-theme-list">
                                {themes.map((theme) => {
                                    const themeName = theme.FAQ_Theme_Name || '';
                                    const isActive = theme.id === selectedThemeId;
                                    return (
                                        <button
                                            key={theme.id}
                                            type="button"
                                            className={`faqs-theme-item ${isActive ? 'active' : ''}`}
                                            onClick={() => handleThemeSelect(section.id, theme.id)}
                                        >
                                            {themeName}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="faqs-accordion">
                                {faqs.length === 0 && (
                                    <p className="faqs-empty">No FAQs available.</p>
                                )}
                                {faqs.map((faq) => {
                                    const faqQuestion = faq.FAQ_Question || '';
                                    const answerRaw = faq.FAQ_Answer || '';
                                    const answer = typeof answerRaw === 'string'
                                        ? answerRaw
                                        : blocksToMarkdown(answerRaw);
                                    const isOpen = openFaqByTheme[selectedThemeId] === faq.id;

                                    return (
                                        <div
                                            key={faq.id}
                                            className={`faqs-accordion-item ${isOpen ? 'open' : ''}`}
                                        >
                                            <button
                                                type="button"
                                                className="faqs-accordion-header"
                                                onClick={() => toggleFaq(selectedThemeId, faq.id)}
                                            >
                                                <span className="faqs-accordion-question">{faqQuestion}</span>
                                                <span className="faqs-accordion-icon">{isOpen ? '-' : '+'}</span>
                                            </button>
                                            {isOpen && (
                                                <div className="faqs-accordion-body">
                                                    <ReactMarkdown>
                                                        {answer}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            })}
        </section>
    );
};

export default FAQsContent;
