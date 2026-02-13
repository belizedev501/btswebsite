import React, { useContext, useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BlocksRenderer } from '@strapi/blocks-react-renderer';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useStrapiCollection } from '../Strapi/strapiCollection';
import { GlobalContext } from '../Context/Context';
import './TaxResourcesCategoryContent.component.css';

const normalizeItems = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) {
        return value.data.map((item) => item?.attributes || item).filter(Boolean);
    }
    return [];
};

const normalizeResourceCategories = (resource) => {
    const fromLowerMany = normalizeItems(resource?.tax_resource_categories);
    if (fromLowerMany.length > 0) return fromLowerMany;

    const fromLegacyMany = normalizeItems(resource?.Tax_Resource_Categories);
    if (fromLegacyMany.length > 0) return fromLegacyMany;

    const fromSingle = resource?.Tax_Resource_Category;
    if (!fromSingle) return [];
    if (fromSingle?.attributes) return [fromSingle.attributes];
    return [fromSingle];
};

const canonicalType = (value) => {
    if (typeof value !== 'string') return '';
    const normalized = value.trim();
    if (!normalized) return '';

    const compact = normalized.toLowerCase().replace(/\s+/g, ' ');
    if (compact === 'forms & downloads' || compact === 'forms & download' || compact === 'forms download') {
        return 'Forms & Downloads';
    }
    if (compact === 'tax rulings') {
        return 'Tax Ruling';
    }
    return normalized;
};

const parseResourceTypes = (value) => {
    if (Array.isArray(value)) {
        return Array.from(new Set(value.map((item) => canonicalType(item)).filter(Boolean)));
    }

    if (typeof value !== 'string') return [];
    const normalized = value.trim();
    if (!normalized) return [];

    try {
        const parsed = JSON.parse(normalized);
        if (Array.isArray(parsed)) {
            return Array.from(new Set(parsed.map((item) => canonicalType(item)).filter(Boolean)));
        }
    } catch {
        // Falls back to single-value parsing for enum/string values.
    }

    return [canonicalType(normalized)].filter(Boolean);
};

const toAbsoluteUrl = (rawUrl, serverUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string' || !serverUrl) return '';
    if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
    return `${serverUrl}${rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`}`;
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

const TaxResourcesCategoryContent = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { locale, globalServerStrapi, globalTokenStrapi } = useContext(GlobalContext);
    const [fallbackTried, setFallbackTried] = useState(false);
    const [cachedCategory, setCachedCategory] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const titleFilter = (searchParams.get('title') || '').trim();
    const typeFilter = (searchParams.get('type') || '').trim();

    const filters = useMemo(() => ({ Tax_Resource_Category_ID: categoryId }), [categoryId]);

    const {
        data: categoryRows,
        loading,
        error
    } = useStrapiCollection(
        'tax-resource-categories',
        '[Tax_Resources][fields][0]=Tax_Resource_ID&populate[Tax_Resources][fields][1]=Tax_Resource_Title&populate[Tax_Resources][fields][2]=Tax_Resource_Type&populate[Tax_Resources][fields][3]=Tax_Resource_Summary&populate[Tax_Resources][fields][4]=Tax_Resource_Effective_Date&populate[Tax_Resources][populate][Tax_Resource_Attachments][fields][0]=url&populate[Tax_Resources][populate][Tax_Resource_Attachments][fields][1]=name&populate[Tax_Resources][populate][Tax_Resource_Attachments][fields][2]=alternativeText&populate[Tax_Resources][populate][tax_resource_categories][fields][0]=Tax_Resource_Category_ID&populate[Tax_Resources][populate][tax_resource_categories][fields][1]=Tax_Resource_Category_Name',
        'Tax_Resource_Category_Name',
        'asc',
        1,
        filters
    );

    const category = Array.isArray(categoryRows) && categoryRows.length > 0 ? categoryRows[0] : null;
    const relatedResources = normalizeItems(category?.Tax_Resources);

    useEffect(() => {
        if (category) {
            setCachedCategory(category);
        }
    }, [category]);

    useEffect(() => {
        setFallbackTried(false);
    }, [categoryId, locale]);

    useEffect(() => {
        if (!cachedCategory || !locale || !globalServerStrapi) return;

        const cachedLocale = cachedCategory?.locale || cachedCategory?.attributes?.locale;
        if (cachedLocale && cachedLocale === locale) return;

        const documentId = cachedCategory?.documentId || cachedCategory?.attributes?.documentId;
        if (!documentId) return;

        const headers = {};
        if (globalTokenStrapi) headers.Authorization = `Bearer ${globalTokenStrapi}`;

        const baseUrl = globalServerStrapi.replace(/\/+$/, '');
        const url = `${baseUrl}/api/tax-resource-categories?filters[documentId][$eq]=${encodeURIComponent(documentId)}&pagination[limit]=1&locale=${locale}`;

        let cancelled = false;
        const fetchLocalized = async () => {
            try {
                const response = await fetch(url, { headers });
                if (!response.ok) return;
                const result = await response.json();
                if (cancelled) return;

                const localizedItem = Array.isArray(result?.data) ? result.data[0] : null;
                const localizedAttrs = localizedItem?.attributes || localizedItem;
                const localizedCategoryId = localizedAttrs?.Tax_Resource_Category_ID;

                if (localizedCategoryId && localizedCategoryId !== categoryId) {
                    navigate(`/tax_resources/category/${localizedCategoryId}${location.search}`, { replace: true });
                }
            } catch (fetchError) {
                console.error('Error fetching localized tax resource category by documentId:', fetchError);
            }
        };

        fetchLocalized();

        return () => {
            cancelled = true;
        };
    }, [cachedCategory, categoryId, globalServerStrapi, globalTokenStrapi, locale, location.search, navigate]);

    useEffect(() => {
        if (loading || category || !categoryId || fallbackTried || !locale || !globalServerStrapi) return;

        const headers = {};
        if (globalTokenStrapi) headers.Authorization = `Bearer ${globalTokenStrapi}`;

        const baseUrl = globalServerStrapi.replace(/\/+$/, '');
        const byIdAllLocales = `${baseUrl}/api/tax-resource-categories?filters[Tax_Resource_Category_ID][$eq]=${encodeURIComponent(categoryId)}&pagination[limit]=1&locale=all`;

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

                const localizedUrl = `${baseUrl}/api/tax-resource-categories?filters[documentId][$eq]=${encodeURIComponent(documentId)}&pagination[limit]=1&locale=${locale}`;
                const localizedResponse = await fetch(localizedUrl, { headers });
                if (!localizedResponse.ok) return;
                const localizedResult = await localizedResponse.json();
                if (cancelled) return;

                const localizedItem = Array.isArray(localizedResult?.data) ? localizedResult.data[0] : null;
                const localizedAttrs = localizedItem?.attributes || localizedItem;
                const localizedCategoryId = localizedAttrs?.Tax_Resource_Category_ID;

                if (localizedCategoryId && localizedCategoryId !== categoryId) {
                    navigate(`/tax_resources/category/${localizedCategoryId}${location.search}`, { replace: true });
                }
            } catch (fetchError) {
                console.error('Error fetching fallback tax resource category locale:', fetchError);
            }
        };

        setFallbackTried(true);
        fetchFallback();

        return () => {
            cancelled = true;
        };
    }, [
        category,
        categoryId,
        fallbackTried,
        globalServerStrapi,
        globalTokenStrapi,
        loading,
        locale,
        location.search,
        navigate
    ]);

    const resourceTypes = useMemo(() => {
        const values = new Set();
        relatedResources.forEach((item) => {
            parseResourceTypes(item?.Tax_Resource_Type).forEach((type) => values.add(type));
        });
        return Array.from(values).sort();
    }, [relatedResources]);

    const filteredResources = useMemo(() => {
        return relatedResources
            .filter((item) => {
            const itemTypes = parseResourceTypes(item?.Tax_Resource_Type);
            const matchesTitle = !titleFilter
                || (item?.Tax_Resource_Title || '').toLowerCase().includes(titleFilter.toLowerCase());
            const matchesType = !typeFilter || itemTypes.includes(typeFilter);
            return matchesTitle && matchesType;
            })
            .sort((a, b) => {
                const dateA = a?.Tax_Resource_Effective_Date ? new Date(a.Tax_Resource_Effective_Date).getTime() : 0;
                const dateB = b?.Tax_Resource_Effective_Date ? new Date(b.Tax_Resource_Effective_Date).getTime() : 0;
                return dateB - dateA;
            });
    }, [relatedResources, titleFilter, typeFilter]);

    const updateFilter = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (value) {
            next.set(key, value);
        } else {
            next.delete(key);
        }
        setSearchParams(next);
    };

    if (loading) return <p>Loading Tax Resources category...</p>;
    if (error) return <p>Error loading Tax Resources category.</p>;
    if (!category) return <p>Tax Resources category not found.</p>;

    return (
        <section className='trc-content'>
            <nav className='trc-breadcrumb' aria-label='Breadcrumb'>
                <Link to='/tax_resources'>Tax Resources</Link>
                <span>/</span>
                <span>{category.Tax_Resource_Category_Name}</span>
            </nav>

            <div className='trc-header'>
                <h2>{category.Tax_Resource_Category_Name}</h2>
            </div>

            {category?.Tax_Resource_Category_Text && (
                <div className='trc-description'>
                    <ReactMarkdown>{category.Tax_Resource_Category_Text}</ReactMarkdown>
                </div>
            )}

            <div className='trc-filters'>
                <input
                    type='text'
                    className='form-control'
                    placeholder='Filter by title'
                    value={titleFilter}
                    onChange={(event) => updateFilter('title', event.target.value)}
                />
                <select
                    className='form-select'
                    value={typeFilter}
                    onChange={(event) => updateFilter('type', event.target.value)}
                >
                    <option value=''>All types</option>
                    {resourceTypes.map((type) => (
                        <option value={type} key={type}>{type}</option>
                    ))}
                </select>
            </div>

            <div className='trc-list'>
                {filteredResources.length === 0 && (
                    <p>No related Tax Resources found for the selected filters.</p>
                )}
                {filteredResources.map((resource) => {
                    const summaryContent = renderRichContent(resource?.Tax_Resource_Summary);
                    const effectiveDate = resource?.Tax_Resource_Effective_Date
                        ? new Date(resource.Tax_Resource_Effective_Date).toLocaleDateString()
                        : '';
                    const resourceTypesForItem = parseResourceTypes(resource?.Tax_Resource_Type);
                    const resourceCategories = normalizeResourceCategories(resource);
                    const attachment = normalizeItems(resource?.Tax_Resource_Attachments)[0];
                    const attachmentUrl = toAbsoluteUrl(attachment?.url, globalServerStrapi);
                    const attachmentLabel = attachment?.alternativeText || attachment?.name || 'Open attachment';
                    const detailSearch = new URLSearchParams();
                    detailSearch.set('from', `${location.pathname}${location.search}`);
                    if (category?.Tax_Resource_Category_Name) {
                        detailSearch.set('fromCategoryName', category.Tax_Resource_Category_Name);
                    }
                    return (
                        <article className='trc-item' key={resource.documentId || resource.id || resource.Tax_Resource_ID}>
                            <div className='trc-item-title'>
                                <Link to={`/tax_resources/${resource.Tax_Resource_ID}?${detailSearch.toString()}`}>
                                    <h5>{resource.Tax_Resource_Title}</h5>
                                </Link>
                            </div>
                            {(resourceTypesForItem.length > 0 || effectiveDate) && (
                                <div className='trc-item-badges'>
                                    {resourceTypesForItem.map((type) => (
                                        <span className='trc-type-badge' key={type}>{type}</span>
                                    ))}
                                    {effectiveDate && <span className='trc-date-badge'>Effective: {effectiveDate}</span>}
                                </div>
                            )}
                            {resourceCategories.length > 0 && (
                                <div className='trc-item-badges'>
                                    {resourceCategories.map((resourceCategory) => {
                                        const resourceCategoryId = resourceCategory?.Tax_Resource_Category_ID || resourceCategory?.documentId || resourceCategory?.id;
                                        const resourceCategoryName = resourceCategory?.Tax_Resource_Category_Name;
                                        if (!resourceCategoryId || !resourceCategoryName) return null;

                                        return (
                                            <Link className='trc-category-badge' key={`${resourceCategoryId}-${resourceCategoryName}`} to={`/tax_resources/category/${resourceCategoryId}`}>
                                                {resourceCategoryName}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                            {summaryContent && <div className='trc-item-summary'>{summaryContent}</div>}
                            {attachmentUrl && (
                                <a className='trc-attachment-link' href={attachmentUrl} target='_blank' rel='noreferrer'>
                                    {attachmentLabel}
                                </a>
                            )}
                        </article>
                    );
                })}
            </div>
        </section>
    );
};

export default TaxResourcesCategoryContent;
