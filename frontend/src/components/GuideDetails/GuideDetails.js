import React, { useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { GlobalContext } from '../Context/Context';
import { useStrapiCollection } from '../Strapi/strapiCollection';
import { normalizeRichText, renderRichText } from '../utils/richText';
import './GuideDetails.component.css';

const normalizeItem = (item) => {
    if (!item) return null;
    if (item.attributes) return { id: item.id, ...item.attributes };
    return item;
};

const toArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (Array.isArray(value.data)) return value.data;
    if (value.data) return [value.data];
    return [];
};

const getMediaData = (value) => {
    const media = normalizeItem(toArray(value)[0]);
    if (!media) return null;
    return {
        url: media.url || '',
        alt: media.alternativeText || media.name || ''
    };
};

const normalizePosition = (value) => {
    const normalized = (value || '').toString().trim().toLowerCase();
    if (['left', 'right', 'top', 'bottom'].includes(normalized)) return normalized;
    return 'right';
};

const GuideDetails = () => {
    const { slug } = useParams();
    const { globalServerStrapi } = useContext(GlobalContext);

    const guideFilters = useMemo(() => ({ Guide_URL: slug || '' }), [slug]);

    const {
        data: guidesRows,
        loading,
        error
    } = useStrapiCollection(
        'guides',
        '=*',
        'id',
        'asc',
        1,
        guideFilters
    );

    const guide = useMemo(() => normalizeItem(guidesRows?.[0]), [guidesRows]);

    const sections = useMemo(() => {
        return toArray(guide?.Guide_Content)
            .map(normalizeItem)
            .filter(Boolean)
            .map((section, index) => {
                const media = getMediaData(section.Guide_Content_Media);
                return {
                    id: section.id || section.documentId || `${guide?.Guide_URL || guide?.Guide_Title}-${index}`,
                    title: section.Guide_Content_Title || '',
                    text: normalizeRichText(section.Guide_Content_Text),
                    mediaName: section.Guide_Content_Media_Name || '',
                    media,
                    position: normalizePosition(section.Guide_Content_Media_Position)
                };
            });
    }, [guide]);

    if (loading) return <p className='guide-details-feedback'>Loading guide...</p>;
    if (error) return <p className='guide-details-feedback guide-details-feedback--error'>Error loading guide.</p>;
    if (!guide) return <p className='guide-details-feedback'>Guide not found.</p>;

    const summary = normalizeRichText(guide.Guide_Summary);

    return (
        <section className='guide-details'>
            <header className='guide-details__header'>
                <h2 className='guide-details__title'>{guide.Guide_Title}</h2>
                {renderRichText(summary, { className: 'guide-details__summary', blankLineClassName: 'guide-details__markdown-blankline' })}
            </header>

            <div className='guide-details__content'>
                {sections.map((section) => (
                    <article
                        className={`guide-details__segment guide-details__segment--${section.position}`}
                        key={section.id}
                    >
                        <div className='guide-details__segment-text'>
                            {section.title && <h3 className='guide-details__segment-title'>{section.title}</h3>}
                            {renderRichText(section.text, { className: 'guide-details__segment-markdown', blankLineClassName: 'guide-details__markdown-blankline' })}
                        </div>

                        {section.media?.url && (
                            <figure className='guide-details__media'>
                                <img
                                    src={`${globalServerStrapi}${section.media.url}`}
                                    alt={section.mediaName || section.media.alt || section.title || guide.Guide_Title || 'Guide media'}
                                    loading='lazy'
                                />
                                {section.mediaName && <figcaption>{section.mediaName}</figcaption>}
                            </figure>
                        )}
                    </article>
                ))}
            </div>
        </section>
    );
};

export default GuideDetails;
