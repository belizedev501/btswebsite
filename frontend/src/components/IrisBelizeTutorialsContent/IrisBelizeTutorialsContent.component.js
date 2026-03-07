import React, { useCallback, useEffect, useState } from 'react';
import './IrisBelizeTutorialsContent.component.css';
import { renderRichText } from '../utils/richText';

const getYoutubeEmbed = (url = '') => {
    const patterns = [
        /youtube\.com\/watch\?v=([^&]+)/i,
        /youtu\.be\/([^?&]+)/i,
        /youtube\.com\/embed\/([^?&]+)/i
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}`;
    }
    return '';
};

const getVimeoEmbed = (url = '') => {
    const match = url.match(/vimeo\.com\/(\d+)/i);
    return match?.[1] ? `https://player.vimeo.com/video/${match[1]}` : '';
};

const getVideoEmbedUrl = (url = '') => {
    return getYoutubeEmbed(url) || getVimeoEmbed(url) || '';
};

const IrisBelizeTutorialsContentComponent = ({
    title,
    topText,
    bottomText,
    tutorials,
    faqSection,
    loading,
    error
}) => {
    const [selectedThemeId, setSelectedThemeId] = useState(null);
    const [openFaqByTheme, setOpenFaqByTheme] = useState({});

    useEffect(() => {
        const firstThemeId = faqSection?.themes?.[0]?.id || null;
        setSelectedThemeId(firstThemeId);
        setOpenFaqByTheme({});
    }, [faqSection]);

    const handleThemeSelect = useCallback((themeId) => {
        setSelectedThemeId(themeId);
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

    if (loading) return <p className='iris-tutorials-loading'>Loading tutorials...</p>;
    if (error) return <p className='iris-tutorials-error'>Error loading tutorials.</p>;

    return (
        <section className='iris-tutorials'>
            <div className='iris-tutorials-header'>
                <h2 className='iris-tutorials-title'>{title}</h2>
                {renderRichText(topText, { className: 'iris-tutorials-top-text' })}
            </div>

            <div className='iris-tutorials-list'>
                {tutorials.map((tutorial) => {
                    const embedUrl = getVideoEmbedUrl(tutorial.videoUrl);

                    return (
                        <article className='iris-tutorial-card' key={tutorial.id}>
                            <div className='iris-tutorial-card-body'>
                                <h3 className='iris-tutorial-card-title'>{tutorial.title}</h3>

                                {tutorial.summary && (
                                    renderRichText(tutorial.summary, { className: 'iris-tutorial-card-summary' })
                                )}

                                {tutorial.categories.length > 0 && (
                                    <div className='iris-tutorial-card-categories'>
                                        {tutorial.categories.map((category) => (
                                            <span className='iris-tutorial-category' key={`${tutorial.id}-${category}`}>
                                                {category}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {embedUrl ? (
                                <div className='iris-tutorial-video'>
                                    <iframe
                                        src={embedUrl}
                                        title={tutorial.title || 'Tutorial video'}
                                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                                        allowFullScreen
                                    />
                                </div>
                            ) : (
                                tutorial.videoUrl && (
                                    <a
                                        className='iris-tutorial-link'
                                        href={tutorial.videoUrl}
                                        target='_blank'
                                        rel='noreferrer'
                                    >
                                        Watch tutorial
                                    </a>
                                )
                            )}
                        </article>
                    );
                })}

                {tutorials.length === 0 && (
                    <p className='iris-tutorials-empty'>No tutorials available for tag "IRIS Belize".</p>
                )}
            </div>

            {faqSection && faqSection.themes.length > 0 && (
                <section className='iris-tutorials-faq'>
                    <h3 className='iris-tutorials-faq-title'>FAQs - {faqSection.name || 'FAQs'}</h3>
                    {renderRichText(faqSection.text, { className: 'iris-tutorials-faq-text' })}

                    <div className='iris-tutorials-faq-body'>
                        <div className='iris-tutorials-faq-theme-list'>
                            {faqSection.themes.map((theme) => {
                                const isActive = theme.id === selectedThemeId;
                                return (
                                    <button
                                        key={theme.id}
                                        type='button'
                                        className={`iris-tutorials-faq-theme-item ${isActive ? 'active' : ''}`}
                                        onClick={() => handleThemeSelect(theme.id)}
                                    >
                                        {theme.name}
                                    </button>
                                );
                            })}
                        </div>

                        <div className='iris-tutorials-faq-accordion'>
                            {(faqSection.themes.find((theme) => theme.id === selectedThemeId)?.faqs || []).map((faq) => {
                                const isOpen = openFaqByTheme[selectedThemeId] === faq.id;
                                return (
                                    <div className={`iris-tutorials-faq-accordion-item ${isOpen ? 'open' : ''}`} key={faq.id}>
                                        <button
                                            type='button'
                                            className='iris-tutorials-faq-accordion-header'
                                            onClick={() => toggleFaq(selectedThemeId, faq.id)}
                                        >
                                            <span className='iris-tutorials-faq-question'>{faq.question}</span>
                                            <span className='iris-tutorials-faq-icon'>{isOpen ? '-' : '+'}</span>
                                        </button>
                                        {isOpen && faq.answer && (
                                            <div className='iris-tutorials-faq-answer'>
                                                {renderRichText(faq.answer)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}
            <div className='iris-tutorials-bottom-area'>
                {renderRichText(bottomText, { className: 'iris-tutorials-bottom-text' })}
            </div>
        </section>
    );
};

export default IrisBelizeTutorialsContentComponent;
