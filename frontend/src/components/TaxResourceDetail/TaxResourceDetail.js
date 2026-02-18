import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { BlocksRenderer } from '@strapi/blocks-react-renderer';
import ReactMarkdown from 'react-markdown';
import { useStrapiCollection } from '../Strapi/strapiCollection';
import { GlobalContext } from '../Context/Context';
import './TaxResourceDetail.component.css';

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

const renderResourcePreview = (url) => {
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

    if (/\.(mp4|webm|ogg)(\?|#|$)/.test(lowerUrl)) {
        return (
            <video className='trd-video' controls>
                <source src={url} />
                Your browser does not support video playback.
            </video>
        );
    }

    const googleViewerUrl = `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`;
    const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;

    if (/\.(pdf)(\?|#|$)/.test(lowerUrl)) {
        if (isLocalhostUrl(url)) {
            return (
                <p className='trd-preview-unavailable'>
                    Preview unavailable in local environment. Open in a new tab.
                </p>
            );
        }

        return (
            <div className='trd-preview-frame'>
                <iframe src={googleViewerUrl} title='Tax resource document' />
            </div>
        );
    }

    if (/\.(doc|docx|xls|xlsx|ppt|pptx)(\?|#|$)/.test(lowerUrl)) {
        if (isLocalhostUrl(url)) {
            return (
                <p className='trd-preview-unavailable'>
                    Preview unavailable in local environment. Open in a new tab.
                </p>
            );
        }

        return (
            <div className='trd-preview-frame'>
                <iframe src={officeViewerUrl} title='Tax resource document' />
            </div>
        );
    }

    if (/\.(jpg|jpeg|png|gif|webp|svg)(\?|#|$)/.test(lowerUrl)) {
        return (
            <img className='trd-image' src={url} alt='Tax resource attachment preview' />
        );
    }

    return null;
};

const renderRichContent = (content) => {
    if (Array.isArray(content) && content.length > 0) {
        return <BlocksRenderer content={content} />;
    }

    if (typeof content === 'string' && content.trim()) {
        return <ReactMarkdown>{content}</ReactMarkdown>;
    }

    return null;
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
        '[tax_resource_categories][fields][0]=Tax_Resource_Category_ID&populate[tax_resource_categories][fields][1]=Tax_Resource_Category_Name&populate[Tax_Resource_Attachments][fields][0]=url&populate[Tax_Resource_Attachments][fields][1]=name&populate[Tax_Resource_Attachments][fields][2]=alternativeText&populate[Tax_Resource_Attachments][fields][3]=mime',
        'Tax_Resource_Effective_Date',
        'desc',
        1,
        filters
    );

    const resource = Array.isArray(resources) && resources.length > 0 ? resources[0] : null;
    const resourceCategories = normalizeCategories(resource);
    const primaryCategory = resourceCategories[0] || null;
    const resourceUrl = toAbsoluteUrl(resource?.Tax_Resurce_Url || resource?.Tax_Resource_Url, globalServerStrapi);
    const preview = renderResourcePreview(resourceUrl);
    const summaryContent = renderRichContent(resource?.Tax_Resource_Summary);
    const bodyContent = renderRichContent(resource?.Tax_Resource_Body);
    const resourceTypes = parseResourceTypes(resource?.Tax_Resource_Type);
    const categoryId = primaryCategory?.Tax_Resource_Category_ID || primaryCategory?.documentId || primaryCategory?.id;
    const fromPath = (searchParams.get('from') || '').trim();
    const fromCategoryName = (searchParams.get('fromCategoryName') || '').trim();
    const effectiveDate = resource?.Tax_Resource_Effective_Date
        ? new Date(resource.Tax_Resource_Effective_Date).toLocaleDateString()
        : '';
    const breadcrumbCategoryLink = fromPath.startsWith('/tax_resources/category/')
        ? fromPath
        : (categoryId ? `/tax_resources/category/${categoryId}` : '/tax_resources');
    const breadcrumbCategoryLabel = fromCategoryName || primaryCategory?.Tax_Resource_Category_Name || 'Category';

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

    if (loading) return <p>Loading Tax Resource...</p>;
    if (error) return <p>Error loading Tax Resource.</p>;
    if (!resource) return <p>Tax Resource not found.</p>;

    return (
        <section className='tax-resource-detail'>
            <nav className='trd-breadcrumb' aria-label='Breadcrumb'>
                <Link to='/tax_resources'>Tax Resources</Link>
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
                    {preview}
                    <p>
                        <a href={resourceUrl} target='_blank' rel='noreferrer'>
                            Open resource in a new tab
                        </a>
                    </p>
                </div>
            )}

            {Array.isArray(resource?.Tax_Resource_Attachments) && resource.Tax_Resource_Attachments.length > 0 && (
                <div className='trd-attachments'>
                    {resource.Tax_Resource_Attachments.map((file) => {
                        const fileUrl = toAbsoluteUrl(file?.url, globalServerStrapi);
                        if (!fileUrl) return null;
                        const filePreview = renderResourcePreview(fileUrl);

                        return (
                            <div className='trd-attachment-item' key={file.documentId || file.id || fileUrl}>
                                <a href={fileUrl} target='_blank' rel='noreferrer'>
                                    {file.alternativeText || file.name || 'Download file'}
                                </a>
                                {filePreview}
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
};

export default TaxResourceDetail;
