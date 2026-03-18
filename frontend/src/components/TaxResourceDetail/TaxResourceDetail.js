import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useStrapiCollection } from '../Strapi/strapiCollection';
import { GlobalContext } from '../Context/Context';
import './TaxResourceDetail.component.css';
import { renderRichText } from '../utils/richText';

const toAbsoluteUrl = (rawUrl, serverUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
    return `${serverUrl}${rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`}`;
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

const normalizeAttachments = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (Array.isArray(value?.data)) {
        return value.data.map((item) => item?.attributes || item).filter(Boolean);
    }
    return [];
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
            /(application\/(pdf|msword|vnd\.openxmlformats\-officedocument\.(wordprocessingml|spreadsheetml|presentationml)\.document|vnd\.ms\-excel|vnd\.ms\-powerpoint))/i.test(mimeLower);
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
                    // If HEAD fails (CORS/network), allow preview to proceed with a GET.
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
            <div className='trd-preview-frame'>
                <iframe
                    src={youtubeEmbed}
                    title='Tax resource video'
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                    allowFullScreen
                />
            </div>
        );
    }

    const vimeoEmbed = getVimeoEmbed(url);
    if (vimeoEmbed) {
        return (
            <div className='trd-preview-frame'>
                <iframe
                    src={vimeoEmbed}
                    title='Tax resource video'
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
            <video className='trd-video' controls>
                <source src={url} />
                Your browser does not support video playback.
            </video>
        );
    }

    const isPdf = /\.(pdf)(\?|#|$)/.test(lowerUrl) || mimeLower === 'application/pdf';
    if (isPdf) {
        if (fileCheckDone && !fileAvailable) {
            return (
                <p className='trd-preview-unavailable'>
                    Preview unavailable. File was not found on the server. Open in a new tab.
                </p>
            );
        }

        if (!pdfReady) {
            return (
                <p className='trd-preview-unavailable'>
                    Preview unavailable for this file. Open in a new tab.
                </p>
            );
        }

        if (!pdfBlobUrl) {
            return (
                <p className='trd-preview-unavailable'>
                    Loading preview...
                </p>
            );
        }

        return (
            <div className='trd-preview-frame'>
                <iframe src={pdfBlobUrl} title='Tax resource document' />
            </div>
        );
    }

    const isOfficeDoc =
        /\.(doc|docx|xls|xlsx|ppt|pptx)(\?|#|$)/.test(lowerUrl) ||
        /(application\/(msword|vnd\.ms\-word|vnd\.openxmlformats\-officedocument\.wordprocessingml\.document|vnd\.ms\-excel|vnd\.openxmlformats\-officedocument\.spreadsheetml\.sheet|vnd\.ms\-powerpoint|vnd\.openxmlformats\-officedocument\.presentationml\.presentation))/i.test(mimeLower);
    if (isOfficeDoc) {
        if (isLocalhostUrl(url)) {
            return (
                <p className='trd-preview-unavailable'>
                    Excel/Word/PowerPoint preview not available with a local URL. Download and open it on your device.
                </p>
            );
        }

        if (fileCheckDone && !fileAvailable) {
            return (
                <p className='trd-preview-unavailable'>
                    Preview unavailable. File was not found on the server. Open in a new tab.
                </p>
            );
        }

        const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
        return (
            <div className='trd-preview-frame'>
                <iframe src={officeViewerUrl} title='Tax resource document' />
            </div>
        );
    }

    const isImage =
        /\.(jpg|jpeg|png|gif|webp|svg)(\?|#|$)/.test(lowerUrl) ||
        mimeLower.startsWith('image/');
    if (isImage) {
        return (
            <img className='trd-image' src={url} alt='Tax resource attachment preview' />
        );
    }

    const isTextLike =
        /\.(txt|csv|tsv|json)(\?|#|$)/.test(lowerUrl) ||
        mimeLower.startsWith('text/') ||
        mimeLower === 'application/json' ||
        mimeLower === 'text/csv';

    if (isTextLike) {
        return (
            <div className='trd-preview-frame'>
                <iframe src={url} title='Tax resource text preview' />
            </div>
        );
    }

    // Fallback: try generic iframe so at least some file types render or prompt the browser download UI.
    return (
        <div className='trd-preview-frame'>
            <iframe src={url} title='Tax resource attachment' />
        </div>
    );
};

const parseResourceTypes = (value) => {
    if (Array.isArray(value)) {
        return Array.from(new Set(value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean)));
    }

    if (typeof value !== 'string') return [];
    const normalized = value.trim();
    if (!normalized) return [];

    try {
        const parsed = JSON.parse(normalized);
        if (Array.isArray(parsed)) {
            return Array.from(new Set(parsed.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean)));
        }
    } catch {
        // Falls back to delimiter-based parsing.
    }

    return Array.from(
        new Set(
            normalized
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean)
        )
    );
};

const normalizeCategories = (resource) => {
    const normalizeRelation = (relation) => {
        if (Array.isArray(relation)) return relation.filter(Boolean);
        if (Array.isArray(relation?.data)) {
            return relation.data.map((item) => item?.attributes || item).filter(Boolean);
        }
        return [];
    };

    const manyRelation = normalizeRelation(resource?.tax_resource_categories);
    if (manyRelation.length > 0) return manyRelation;

    const legacyManyRelation = normalizeRelation(resource?.Tax_Resource_Categories);
    if (legacyManyRelation.length > 0) return legacyManyRelation;

    const singleRelation = resource?.Tax_Resource_Category;
    if (singleRelation?.attributes) return [singleRelation.attributes];
    return singleRelation ? [singleRelation] : [];
};

const normalizeTags = (resource) => {
    const relation = resource?.Tax_Resource_Tags;
    if (Array.isArray(relation)) return relation.filter(Boolean);
    if (Array.isArray(relation?.data)) {
        return relation.data.map((item) => item?.attributes || item).filter(Boolean);
    }
    return [];
};

const getTagLabel = (tag) => {
    if (!tag) return '';
    return (
        tag.Tag_Name
        || tag.tag_name
        || tag.Name
        || tag.name
        || tag.Title
        || ''
    );
};

const TaxResourceDetail = () => {
    const { resourceId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { locale, globalServerStrapi, globalTokenStrapi } = useContext(GlobalContext);
    const [fallbackTried, setFallbackTried] = useState(false);
    const [cachedResource, setCachedResource] = useState(null);

    const filters = useMemo(() => ({ Tax_Resource_ID: resourceId }), [resourceId]);

    const {
        data: resources,
        loading,
        error
    } = useStrapiCollection(
        'tax-resources',
        '[tax_resource_categories][fields][0]=Tax_Resource_Category_ID&populate[tax_resource_categories][fields][1]=Tax_Resource_Category_Name&populate[Tax_Resource_Attachments][fields][0]=url&populate[Tax_Resource_Attachments][fields][1]=name&populate[Tax_Resource_Attachments][fields][2]=alternativeText&populate[Tax_Resource_Attachments][fields][3]=mime&populate[Tax_Resource_Tags][fields][0]=Tag_Name',
        'Tax_Resource_Effective_Date',
        'desc',
        1,
        filters
    );

    const resource = Array.isArray(resources) && resources.length > 0 ? resources[0] : null;
    const resourceCategories = normalizeCategories(resource);
    const primaryCategory = resourceCategories[0] || null;
    const resourceUrl = toAbsoluteUrl(resource?.Tax_Resurce_Url || resource?.Tax_Resource_Url, globalServerStrapi);
    const summaryContent = renderRichText(resource?.Tax_Resource_Summary);
    const bodyContent = renderRichText(resource?.Tax_Resource_Body);
    const resourceTypes = parseResourceTypes(resource?.Tax_Resource_Type);
    const resourceTags = normalizeTags(resource);
    const isSpanish = locale === 'es';
    const texts = {
        taxResources: isSpanish ? 'Recursos Tributarios' : 'Tax Resources',
        category: isSpanish ? 'Categoria' : 'Category',
        loading: isSpanish ? 'Cargando recurso tributario...' : 'Loading Tax Resource...',
        error: isSpanish ? 'Error cargando el recurso tributario.' : 'Error loading Tax Resource.',
        notFound: isSpanish ? 'Recurso tributario no encontrado.' : 'Tax Resource not found.'
    };
    const categoryId = primaryCategory?.Tax_Resource_Category_ID || primaryCategory?.documentId || primaryCategory?.id;
    const fromPath = (searchParams.get('from') || '').trim();
    const fromCategoryName = (searchParams.get('fromCategoryName') || '').trim();
    const effectiveDate = resource?.Tax_Resource_Effective_Date
        ? new Date(resource.Tax_Resource_Effective_Date).toLocaleDateString()
        : '';
    const breadcrumbCategoryLink = fromPath.startsWith('/tax_resources/category/')
        ? fromPath
        : (categoryId ? `/tax_resources/category/${categoryId}` : '/tax_resources');
    const breadcrumbCategoryLabel = primaryCategory?.Tax_Resource_Category_Name || fromCategoryName || texts.category;

    useEffect(() => {
        if (resource) {
            setCachedResource(resource);
        }
    }, [resource]);

    useEffect(() => {
        setFallbackTried(false);
    }, [resourceId, locale]);

    useEffect(() => {
        if (!cachedResource || !locale || !globalServerStrapi) return;

        const cachedLocale = cachedResource?.locale || cachedResource?.attributes?.locale;
        if (cachedLocale && cachedLocale === locale) return;

        const documentId = cachedResource?.documentId || cachedResource?.attributes?.documentId;
        if (!documentId) return;

        const headers = {};
        if (globalTokenStrapi) headers.Authorization = `Bearer ${globalTokenStrapi}`;

        const baseUrl = globalServerStrapi.replace(/\/+$/, '');
        const url = `${baseUrl}/api/tax-resources?filters[documentId][$eq]=${encodeURIComponent(documentId)}&pagination[limit]=1&locale=${locale}`;

        let cancelled = false;
        const fetchLocalized = async () => {
            try {
                const response = await fetch(url, { headers });
                if (!response.ok) return;
                const result = await response.json();
                if (cancelled) return;

                const localizedItem = Array.isArray(result?.data) ? result.data[0] : null;
                const localizedAttrs = localizedItem?.attributes || localizedItem;
                const localizedResourceId = localizedAttrs?.Tax_Resource_ID;

                if (localizedResourceId && localizedResourceId !== resourceId) {
                    navigate(`/tax_resources/${localizedResourceId}${location.search}`, { replace: true });
                }
            } catch (fetchError) {
                console.error('Error fetching localized tax resource by documentId:', fetchError);
            }
        };

        fetchLocalized();

        return () => {
            cancelled = true;
        };
    }, [cachedResource, globalServerStrapi, globalTokenStrapi, locale, location.search, navigate, resourceId]);

    useEffect(() => {
        if (loading || resource || !resourceId || fallbackTried || !locale || !globalServerStrapi) return;

        const headers = {};
        if (globalTokenStrapi) headers.Authorization = `Bearer ${globalTokenStrapi}`;

        const baseUrl = globalServerStrapi.replace(/\/+$/, '');
        const byIdAllLocales = `${baseUrl}/api/tax-resources?filters[Tax_Resource_ID][$eq]=${encodeURIComponent(resourceId)}&pagination[limit]=1&locale=all`;

        let cancelled = false;
        const fetchFallback = async () => {
            try {
                const response = await fetch(byIdAllLocales, { headers });
                if (!response.ok) return;
                const result = await response.json();
                if (cancelled) return;

                const anyLocaleItem = Array.isArray(result?.data) ? result.data[0] : null;
                const anyLocaleAttrs = anyLocaleItem?.attributes || anyLocaleItem;
                const documentId = anyLocaleAttrs?.documentId;
                if (!documentId) return;

                const localizedUrl = `${baseUrl}/api/tax-resources?filters[documentId][$eq]=${encodeURIComponent(documentId)}&pagination[limit]=1&locale=${locale}`;
                const localizedResponse = await fetch(localizedUrl, { headers });
                if (!localizedResponse.ok) return;
                const localizedResult = await localizedResponse.json();
                if (cancelled) return;

                const localizedItem = Array.isArray(localizedResult?.data) ? localizedResult.data[0] : null;
                const localizedAttrs = localizedItem?.attributes || localizedItem;
                const localizedResourceId = localizedAttrs?.Tax_Resource_ID;

                if (localizedResourceId && localizedResourceId !== resourceId) {
                    navigate(`/tax_resources/${localizedResourceId}${location.search}`, { replace: true });
                }
            } catch (fetchError) {
                console.error('Error fetching fallback tax resource locale:', fetchError);
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
        loading,
        locale,
        location.search,
        navigate,
        resource,
        resourceId
    ]);

    const attachments = normalizeAttachments(resource?.Tax_Resource_Attachments);

    if (loading) return <p>{texts.loading}</p>;
    if (error) return <p>{texts.error}</p>;
    if (!resource) return <p>{texts.notFound}</p>;

    return (
        <section className='tax-resource-detail'>
            <nav className='trd-breadcrumb' aria-label='Breadcrumb'>
                <Link to='/tax_resources'>{texts.taxResources}</Link>
                <span>/</span>
                <Link to={breadcrumbCategoryLink}>{breadcrumbCategoryLabel}</Link>
                <span>/</span>
                <span>{resource?.Tax_Resource_Title}</span>
            </nav>

            <div className='trd-header'>
                <h2 className='trd-title'>{resource?.Tax_Resource_Title}</h2>
            </div>

            <div className='trd-meta'>
                {resourceTypes.map((type) => (
                    <span className='trd-tag trd-tag-type' key={type}>{type}</span>
                ))}
                {effectiveDate && <span className='trd-tag trd-tag-date'>Effective Date: {effectiveDate}</span>}
                {resourceCategories.map((category) => {
                    const relatedCategoryId = category?.Tax_Resource_Category_ID || category?.documentId || category?.id;
                    const relatedCategoryName = category?.Tax_Resource_Category_Name;
                    if (!relatedCategoryId || !relatedCategoryName) return null;

                    return (
                        <Link
                            className='trd-tag trd-tag-category trd-link'
                            key={`${relatedCategoryId}-${relatedCategoryName}`}
                            to={`/tax_resources/category/${relatedCategoryId}`}
                        >
                            {relatedCategoryName}
                        </Link>
                    );
                })}
            </div>

            {summaryContent && (
                <div className='trd-summary'>
                    {summaryContent}
                </div>
            )}

            {bodyContent && (
                <div className='trd-body'>
                    {bodyContent}
                </div>
            )}

            {resourceUrl && (
                <div className='trd-external'>
                    <h5>Reference</h5>
                    <ResourcePreview url={resourceUrl} />
                    <p>
                        <a href={resourceUrl} target='_blank' rel='noreferrer'>
                            Open resource in a new tab
                        </a>
                    </p>
                </div>
            )}

            {attachments.length > 0 && (
                <div className='trd-attachments'>
                    {attachments.map((file) => {
                        const fileUrl = toAbsoluteUrl(file?.url, globalServerStrapi);
                        if (!fileUrl) return null;
                        return (
                            <div className='trd-attachment-item' key={file.documentId || file.id || fileUrl}>
                                <a href={fileUrl} target='_blank' rel='noreferrer'>
                                    {file.alternativeText || file.name || 'Download file'}
                                </a>
                                <ResourcePreview url={fileUrl} mime={file?.mime} />
                            </div>
                        );
                    })}
                </div>
            )}

            {resourceTags.length > 0 && (
                <div className='trd-related-tags'>
                    <h5>Tags</h5>
                    <div className='trd-related-tags-list'>
                        {resourceTags.map((tag, index) => {
                            const label = getTagLabel(tag);
                            if (!label) return null;

                            return (
                                <span className='trd-tag trd-tag-related' key={`${label}-${tag.documentId || tag.id || index}`}>
                                    {label}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
};

export default TaxResourceDetail;
