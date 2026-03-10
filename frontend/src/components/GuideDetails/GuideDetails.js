import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
    const media = normalizeItem(toArray(value)[0] || value);
    if (!media) return null;
    return {
        id: media.id || media.documentId || media.url || '',
        url: media.url || '',
        alt: media.alternativeText || media.name || '',
        mime: media.mime || '',
        name: media.name || '',
        ext: media.ext || ''
    };
};

const resolveMediaUrl = (baseUrl, mediaUrl) => {
    if (!mediaUrl) return '';
    if (/^https?:\/\//i.test(mediaUrl)) return mediaUrl;
    return `${baseUrl}${mediaUrl}`;
};

const isLocalhostUrl = (url) => {
    try {
        const parsed = new URL(url);
        return ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname);
    } catch {
        return false;
    }
};

const getYoutubeEmbed = (url) => {
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

const getVimeoEmbed = (url) => {
    const match = url.match(/vimeo\.com\/(\d+)/i);
    return match?.[1] ? `https://player.vimeo.com/video/${match[1]}` : '';
};

const normalizePosition = (value) => {
    const normalized = (value || '').toString().trim().toLowerCase();
    if (['left', 'right', 'top', 'bottom'].includes(normalized)) return normalized;
    return 'right';
};

const ResourcePreview = ({ url, mime }) => {
    const [pdfBlobUrl, setPdfBlobUrl] = useState('');
    const [fileCheckDone, setFileCheckDone] = useState(false);
    const [fileAvailable, setFileAvailable] = useState(true);
    const [pdfReady, setPdfReady] = useState(true);

    useEffect(() => {
        setPdfBlobUrl('');
        setFileCheckDone(false);
        setFileAvailable(true);
        setPdfReady(true);
    }, [url, mime]);

    useEffect(() => {
        if (!url) return;
        const lowerUrl = url.toLowerCase();
        const mimeLower = (mime || '').toLowerCase();
        const isDocLike =
            /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)(\?|#|$)/.test(lowerUrl) ||
            /(application\/(pdf|msword|vnd\.openxmlformats-officedocument\.(wordprocessingml|spreadsheetml|presentationml)\.document|vnd\.ms-excel|vnd\.ms-powerpoint))/i.test(mimeLower);
        if (!isDocLike) return;

        let cancelled = false;
        const checkAvailability = async () => {
            try {
                const response = await fetch(url, { method: 'HEAD' });
                if (!cancelled) {
                    setFileAvailable(response.ok);
                    setFileCheckDone(true);
                }
            } catch {
                if (!cancelled) {
                    setFileAvailable(true);
                    setFileCheckDone(true);
                }
            }
        };

        checkAvailability();

        return () => {
            cancelled = true;
        };
    }, [mime, url]);

    useEffect(() => {
        if (!url) return;
        const lowerUrl = url.toLowerCase();
        const mimeLower = (mime || '').toLowerCase();
        const isPdf = /\.(pdf)(\?|#|$)/.test(lowerUrl) || mimeLower === 'application/pdf';
        if (!isPdf || (fileCheckDone && !fileAvailable)) return;

        let cancelled = false;
        let objectUrl = '';

        const loadPdf = async () => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('PDF not accessible');
                const blob = await response.blob();
                objectUrl = URL.createObjectURL(blob);
                if (!cancelled) {
                    setPdfBlobUrl(objectUrl);
                }
            } catch {
                if (!cancelled) {
                    setPdfReady(false);
                }
            }
        };

        loadPdf();

        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [fileAvailable, fileCheckDone, mime, url]);

    if (!url) return null;

    const youtubeEmbed = getYoutubeEmbed(url);
    if (youtubeEmbed) {
        return (
            <div className='guide-details__preview-frame'>
                <iframe
                    src={youtubeEmbed}
                    title='Guide resource video'
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                    allowFullScreen
                />
            </div>
        );
    }

    const vimeoEmbed = getVimeoEmbed(url);
    if (vimeoEmbed) {
        return (
            <div className='guide-details__preview-frame'>
                <iframe
                    src={vimeoEmbed}
                    title='Guide resource video'
                    allow='autoplay; fullscreen; picture-in-picture'
                    allowFullScreen
                />
            </div>
        );
    }

    const lowerUrl = url.toLowerCase();
    const mimeLower = (mime || '').toLowerCase();

    const isVideo =
        /\.(mp4|webm|ogg)(\?|#|$)/.test(lowerUrl) ||
        mimeLower.startsWith('video/');

    if (isVideo) {
        return (
            <video className='guide-details__video' controls>
                <source src={url} />
                Your browser does not support video playback.
            </video>
        );
    }

    const isPdf = /\.(pdf)(\?|#|$)/.test(lowerUrl) || mimeLower === 'application/pdf';
    if (isPdf) {
        if (fileCheckDone && !fileAvailable) {
            return (
                <p className='guide-details__preview-unavailable'>
                    Preview unavailable. File was not found on the server. Open in a new tab.
                </p>
            );
        }

        if (!pdfReady) {
            return (
                <p className='guide-details__preview-unavailable'>
                    Preview unavailable for this file. Open in a new tab.
                </p>
            );
        }

        if (!pdfBlobUrl) {
            return (
                <p className='guide-details__preview-unavailable'>
                    Loading preview...
                </p>
            );
        }

        return (
            <div className='guide-details__preview-frame'>
                <iframe src={pdfBlobUrl} title='Guide resource document' />
            </div>
        );
    }

    const isOfficeDoc =
        /\.(doc|docx|xls|xlsx|ppt|pptx)(\?|#|$)/.test(lowerUrl) ||
        /(application\/(msword|vnd\.ms-word|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|vnd\.ms-powerpoint|vnd\.openxmlformats-officedocument\.presentationml\.presentation))/i.test(mimeLower);
    if (isOfficeDoc) {
        if (isLocalhostUrl(url)) {
            return (
                <p className='guide-details__preview-unavailable'>
                    Excel/Word/PowerPoint preview not available with a local URL. Download and open it on your device.
                </p>
            );
        }

        if (fileCheckDone && !fileAvailable) {
            return (
                <p className='guide-details__preview-unavailable'>
                    Preview unavailable. File was not found on the server. Open in a new tab.
                </p>
            );
        }

        const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
        return (
            <div className='guide-details__preview-frame'>
                <iframe src={officeViewerUrl} title='Guide resource document' />
            </div>
        );
    }

    const isImage =
        /\.(jpg|jpeg|png|gif|webp|svg)(\?|#|$)/.test(lowerUrl) ||
        mimeLower.startsWith('image/');
    if (isImage) {
        return (
            <img className='guide-details__image' src={url} alt='Guide attachment preview' />
        );
    }

    const isTextLike =
        /\.(txt|csv|tsv|json)(\?|#|$)/.test(lowerUrl) ||
        mimeLower.startsWith('text/') ||
        mimeLower === 'application/json' ||
        mimeLower === 'text/csv';

    if (isTextLike) {
        return (
            <div className='guide-details__preview-frame'>
                <iframe src={url} title='Guide text preview' />
            </div>
        );
    }

    return (
        <div className='guide-details__preview-frame'>
            <iframe src={url} title='Guide attachment' />
        </div>
    );
};

const GuideDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { locale, globalServerStrapi, globalTokenStrapi } = useContext(GlobalContext);
    const [fallbackTried, setFallbackTried] = useState(false);
    const [cachedGuide, setCachedGuide] = useState(null);

    const guideFilters = useMemo(() => ({ Guide_URL: slug || '' }), [slug]);

    const {
        data: guidesRows,
        loading,
        error
    } = useStrapiCollection(
        'guides',
        '[Guide_Content][populate]=*',
        'id',
        'asc',
        1,
        guideFilters
    );

    const guide = useMemo(() => normalizeItem(guidesRows?.[0]), [guidesRows]);

    useEffect(() => {
        if (guide) {
            setCachedGuide(guide);
        }
    }, [guide]);

    useEffect(() => {
        setFallbackTried(false);
    }, [slug, locale]);

    useEffect(() => {
        if (!cachedGuide || !locale || !globalServerStrapi) return;

        const cachedLocale = cachedGuide?.locale || cachedGuide?.attributes?.locale;
        if (cachedLocale && cachedLocale === locale) return;

        const documentId = cachedGuide?.documentId || cachedGuide?.attributes?.documentId;
        if (!documentId) return;

        const headers = {};
        if (globalTokenStrapi) headers.Authorization = `Bearer ${globalTokenStrapi}`;

        const baseUrl = globalServerStrapi.replace(/\/+$/, '');
        const url = `${baseUrl}/api/guides?filters[documentId][$eq]=${encodeURIComponent(documentId)}&pagination[limit]=1&locale=${locale}`;

        let cancelled = false;
        const fetchLocalized = async () => {
            try {
                const response = await fetch(url, { headers });
                if (!response.ok) return;
                const result = await response.json();
                if (cancelled) return;

                const localizedItem = Array.isArray(result?.data) ? result.data[0] : null;
                const localizedAttrs = localizedItem?.attributes || localizedItem;
                const localizedSlug = localizedAttrs?.Guide_URL;

                if (localizedSlug && localizedSlug !== slug) {
                    navigate(`/guide/${localizedSlug}${location.search}`, { replace: true });
                }
            } catch (fetchError) {
                console.error('Error fetching localized guide by documentId:', fetchError);
            }
        };

        fetchLocalized();

        return () => {
            cancelled = true;
        };
    }, [cachedGuide, globalServerStrapi, globalTokenStrapi, locale, location.search, navigate, slug]);

    useEffect(() => {
        if (loading || guide || !slug || fallbackTried || !locale || !globalServerStrapi) return;

        const headers = {};
        if (globalTokenStrapi) headers.Authorization = `Bearer ${globalTokenStrapi}`;

        const baseUrl = globalServerStrapi.replace(/\/+$/, '');
        const bySlugAllLocales = `${baseUrl}/api/guides?filters[Guide_URL][$eq]=${encodeURIComponent(slug)}&pagination[limit]=1&locale=all`;

        let cancelled = false;
        const fetchFallback = async () => {
            try {
                const response = await fetch(bySlugAllLocales, { headers });
                if (!response.ok) return;
                const result = await response.json();
                if (cancelled) return;

                const anyLocaleItem = Array.isArray(result?.data) ? result.data[0] : null;
                const anyLocaleAttrs = anyLocaleItem?.attributes || anyLocaleItem;
                const documentId = anyLocaleAttrs?.documentId;
                if (!documentId) return;

                const localizedUrl = `${baseUrl}/api/guides?filters[documentId][$eq]=${encodeURIComponent(documentId)}&pagination[limit]=1&locale=${locale}`;
                const localizedResponse = await fetch(localizedUrl, { headers });
                if (!localizedResponse.ok) return;
                const localizedResult = await localizedResponse.json();
                if (cancelled) return;

                const localizedItem = Array.isArray(localizedResult?.data) ? localizedResult.data[0] : null;
                const localizedAttrs = localizedItem?.attributes || localizedItem;
                const localizedSlug = localizedAttrs?.Guide_URL;

                if (localizedSlug && localizedSlug !== slug) {
                    navigate(`/guide/${localizedSlug}${location.search}`, { replace: true });
                }
            } catch (fetchError) {
                console.error('Error fetching fallback guide locale:', fetchError);
            }
        };

        setFallbackTried(true);
        fetchFallback();

        return () => {
            cancelled = true;
        };
    }, [
        fallbackTried,
        globalServerStrapi,
        globalTokenStrapi,
        guide,
        loading,
        locale,
        location.search,
        navigate,
        slug
    ]);

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
                                <ResourcePreview
                                    url={resolveMediaUrl(globalServerStrapi, section.media.url)}
                                    mime={section.media.mime}
                                />
                                <p className='guide-details__media-link'>
                                    <a
                                        href={resolveMediaUrl(globalServerStrapi, section.media.url)}
                                        target='_blank'
                                        rel='noreferrer'
                                    >
                                        Open resource in a new tab
                                    </a>
                                </p>
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
