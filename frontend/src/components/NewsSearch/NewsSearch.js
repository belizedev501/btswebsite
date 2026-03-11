import React, { useState, useContext, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { GlobalContext } from '../Context/Context';
import './NewsSearch.component.css';
import { useStrapiCollection, useStrapiSingle } from '../Strapi/strapiCollection';

const extractValuesFromParams = (params, key) => {
    const rawValues = params.getAll(key);

    return rawValues
        .flatMap((value) => value.split(','))
        .map((value) => value.trim())
        .filter(Boolean);
};

const sameStringArray = (a, b) => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((value, index) => value === sortedB[index]);
};

const normalizeItem = (item) => {
    if (!item) return null;
    if (item.attributes) return { id: item.id, ...item.attributes };
    return item;
};

const normalizeRelationArray = (value) => {
    if (Array.isArray(value)) return value.map(normalizeItem).filter(Boolean);
    if (Array.isArray(value?.data)) return value.data.map(normalizeItem).filter(Boolean);
    if (value?.data) {
        const item = normalizeItem(value.data);
        return item ? [item] : [];
    }
    return [];
};

const getCategoryLabel = (item) => {
    if (typeof item === 'string') return item.trim();
    const normalizedItem = normalizeItem(item) || {};

    return (
        normalizedItem.Tax_Resource_Category_Name ||
        normalizedItem.News_Category_Name ||
        normalizedItem.News_Categories_Name ||
        normalizedItem.Tutorial_Category_Name ||
        normalizedItem.Category_Name ||
        normalizedItem.Category ||
        normalizedItem.Categories ||
        normalizedItem.name ||
        normalizedItem.Name ||
        normalizedItem.title ||
        normalizedItem.Title ||
        ''
    ).trim();
};

const getNewsCategories = (newsItem) => {
    const normalizedNewsItem = normalizeItem(newsItem) || {};
    const possibleSources = [
        normalizedNewsItem.News_Categories,
        normalizedNewsItem.News_Category,
        normalizedNewsItem.tax_resource_categories,
        normalizedNewsItem.Tax_Resource_Categories,
        normalizedNewsItem.categories,
        normalizedNewsItem.category,
        normalizedNewsItem.Categories,
        normalizedNewsItem.Category
    ];

    const categories = possibleSources.flatMap((source) => {
        if (typeof source === 'string') return [source.trim()];
        return normalizeRelationArray(source).map(getCategoryLabel);
    });

    return Array.from(new Set(categories.filter(Boolean)));
};

const sortNewsItems = (items) => {
    return [...items].sort((a, b) => {
        const first = new Date((normalizeItem(a)?.News_DateTime) || 0).getTime();
        const second = new Date((normalizeItem(b)?.News_DateTime) || 0).getTime();
        return second - first;
    });
};

const NewsSearch = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { globalServerStrapi, globalTokenStrapi, locale } = useContext(GlobalContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [results, setResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 6;
    const [newsSearch, setNewsSeacrh] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState(() => extractValuesFromParams(searchParams, 'type'));
    const [selectedCategories, setSelectedCategories] = useState(() => extractValuesFromParams(searchParams, 'category'));

    useEffect(() => {
        const requestedTypes = extractValuesFromParams(searchParams, 'type');
        const requestedCategories = extractValuesFromParams(searchParams, 'category');
        const hasRequestedFilters = requestedTypes.length > 0 || requestedCategories.length > 0;

        if (!locale || !globalServerStrapi || !hasRequestedFilters) return;

        const baseUrl = globalServerStrapi.replace(/\/+$/, '');
        const headers = {};
        if (globalTokenStrapi) headers.Authorization = `Bearer ${globalTokenStrapi}`;

        const supportedLocales = ['en', 'es'];
        const orderedLookupLocales = [locale, ...supportedLocales.filter((item) => item !== locale)];

        let cancelled = false;

        const fetchFirstLocalizedItem = async (endpoint, nameField, value) => {
            for (const lookupLocale of orderedLookupLocales) {
                const byNameUrl = `${baseUrl}/api/${endpoint}?filters[${nameField}][$eq]=${encodeURIComponent(value)}&pagination[limit]=1&locale=${lookupLocale}`;
                const byNameResponse = await fetch(byNameUrl, { headers });
                if (!byNameResponse.ok) continue;

                const byNameResult = await byNameResponse.json();
                const foundItem = Array.isArray(byNameResult?.data) ? byNameResult.data[0] : null;
                if (foundItem) return normalizeItem(foundItem);
            }

            return null;
        };

        const fetchLocalizedValue = async (endpoint, documentId, localizedField, fallbackValue) => {
            const localizedUrl = `${baseUrl}/api/${endpoint}?filters[documentId][$eq]=${encodeURIComponent(documentId)}&pagination[limit]=1&locale=${locale}`;
            const localizedResponse = await fetch(localizedUrl, { headers });
            if (!localizedResponse.ok) return fallbackValue;

            const localizedResult = await localizedResponse.json();
            const localizedItem = Array.isArray(localizedResult?.data) ? localizedResult.data[0] : null;
            const normalizedLocalizedItem = normalizeItem(localizedItem);
            return normalizedLocalizedItem?.[localizedField] || fallbackValue;
        };

        const redirectToLocalizedFilters = async () => {
            try {
                const localizedTypes = [];
                const localizedCategories = [];

                for (const typeName of requestedTypes) {
                    const matchedType = await fetchFirstLocalizedItem('newss', 'News_Type', typeName);

                    if (!matchedType?.documentId) {
                        localizedTypes.push(typeName);
                        continue;
                    }

                    const localizedType = await fetchLocalizedValue('newss', matchedType.documentId, 'News_Type', typeName);
                    localizedTypes.push(localizedType);
                }

                for (const categoryName of requestedCategories) {
                    const matchedCategory = await fetchFirstLocalizedItem('tax-resource-categories', 'Tax_Resource_Category_Name', categoryName);

                    if (!matchedCategory?.documentId) {
                        localizedCategories.push(categoryName);
                        continue;
                    }

                    const localizedCategory = await fetchLocalizedValue(
                        'tax-resource-categories',
                        matchedCategory.documentId,
                        'Tax_Resource_Category_Name',
                        categoryName
                    );
                    localizedCategories.push(localizedCategory);
                }

                if (cancelled) return;

                const typesChanged = localizedTypes.some((typeName, index) => typeName !== requestedTypes[index]);
                const categoriesChanged = localizedCategories.some((categoryName, index) => categoryName !== requestedCategories[index]);

                if (!typesChanged && !categoriesChanged) return;

                const nextParams = new URLSearchParams(searchParams);
                nextParams.delete('type');
                nextParams.delete('category');
                localizedTypes.forEach((typeName) => nextParams.append('type', typeName));
                localizedCategories.forEach((categoryName) => nextParams.append('category', categoryName));
                navigate(`${location.pathname}?${nextParams.toString()}`, { replace: true });
            } catch (fetchError) {
                console.error('Error localizing news search filters:', fetchError);
            }
        };

        redirectToLocalizedFilters();

        return () => {
            cancelled = true;
        };
    }, [globalServerStrapi, globalTokenStrapi, locale, location.pathname, navigate, searchParams]);

    const {
        data: newsRows,
        loading: newsRowsLoading,
        error: newsRowsError
    } = useStrapiCollection(
        'newss',
        '[News_Categories][fields][0]=Tax_Resource_Category_Name&populate[News_Image][fields][0]=url&populate[News_Image][fields][1]=alternativeText',
        'News_DateTime',
        'desc',
        300
    );

    const {
        data: strapiNewsSearch,
        loading: strapiNewsSearchLoading,
        error: strapiNewsSearchError
    } = useStrapiSingle('news-search', '=*');

    const allNews = useMemo(() => sortNewsItems(newsRows || []), [newsRows]);

    const newsTypes = useMemo(() => {
        const types = allNews
            .map((item) => normalizeItem(item)?.News_Type)
            .filter((type) => typeof type === 'string' && type.trim() !== '');

        return Array.from(new Set(types)).sort((a, b) => a.localeCompare(b));
    }, [allNews]);

    const newsCategories = useMemo(() => {
        const categories = allNews.flatMap((item) => getNewsCategories(item));
        return Array.from(new Set(categories)).sort((a, b) => a.localeCompare(b));
    }, [allNews]);

    useEffect(() => {
        const urlTypes = extractValuesFromParams(searchParams, 'type');
        const urlCategories = extractValuesFromParams(searchParams, 'category');

        setSelectedTypes((prev) => sameStringArray(prev, urlTypes) ? prev : urlTypes);
        setSelectedCategories((prev) => sameStringArray(prev, urlCategories) ? prev : urlCategories);
    }, [searchParams]);

    useEffect(() => {
        if (strapiNewsSearch) setNewsSeacrh(strapiNewsSearch);
        if (strapiNewsSearchError) {
            console.error('Error fetching News Search: ', strapiNewsSearchError);
        }
    }, [strapiNewsSearch, strapiNewsSearchError]);

    const updateParamList = (key, values) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete(key);
        values.forEach((value) => nextParams.append(key, value));
        setSearchParams(nextParams, { replace: true });
        setCurrentPage(1);
    };

    const handleTypeChange = (type) => {
        const nextSelectedTypes = selectedTypes.includes(type)
            ? selectedTypes.filter((item) => item !== type)
            : [...selectedTypes, type];

        setSelectedTypes(nextSelectedTypes);
        updateParamList('type', nextSelectedTypes);
    };

    const handleCategoryChange = (category) => {
        const nextSelectedCategories = selectedCategories.includes(category)
            ? selectedCategories.filter((item) => item !== category)
            : [...selectedCategories, category];

        setSelectedCategories(nextSelectedCategories);
        updateParamList('category', nextSelectedCategories);
    };

    const filteredNews = useMemo(() => {
        const normalizedSearch = appliedSearch.trim().toLowerCase();

        return allNews.filter((item) => {
            const attrs = normalizeItem(item) || {};
            const headline = (attrs.News_Headline || '').toLowerCase();
            const itemCategories = getNewsCategories(attrs);
            const matchesSearch = !normalizedSearch || headline.includes(normalizedSearch);
            const matchesType = selectedTypes.length === 0 || selectedTypes.includes(attrs.News_Type || '');
            const matchesCategory = selectedCategories.length === 0
                || selectedCategories.some((category) => itemCategories.includes(category));

            return matchesSearch && matchesType && matchesCategory;
        });
    }, [allNews, appliedSearch, selectedTypes, selectedCategories]);

    useEffect(() => {
        const nextTotalPages = Math.max(1, Math.ceil(filteredNews.length / pageSize));
        setTotalPages(nextTotalPages);
        setCurrentPage((prev) => Math.min(prev, nextTotalPages));
    }, [filteredNews]);

    useEffect(() => {
        const start = (currentPage - 1) * pageSize;
        setResults(filteredNews.slice(start, start + pageSize));
    }, [filteredNews, currentPage]);

    const handleSearch = (e, page = 1) => {
        if (e) e.preventDefault();
        setAppliedSearch(search);
        setCurrentPage(page);
    };

    const richTextToString = (richText) => {
        if (!richText) return '';
        if (Array.isArray(richText)) {
            return richText
                .map((block) => block.children?.map((child) => child.text).join(''))
                .join('\n');
        }
        if (typeof richText === 'string') return richText;
        return '';
    };

    return (
        <section className='newsSearch-section'>
            <div className='newsSearch-title-container'>
                <h2>{newsSearch.News_Search_Title}</h2>
            </div>
            <form onSubmit={(e) => handleSearch(e, 1)} className='newsSearch-container'>
                <input
                    type='text'
                    className='newsSearch-input'
                    placeholder={newsSearch.News_Search_Placeholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button type='submit' className='newsSearch-button'>
                    <span className='icon-size_1 icon-magnifying-glass-solid-full'></span>
                </button>
            </form>

            {newsTypes.length > 0 && (
                <div className='newsSearch-filter-group'>
                    <h3 className='newsSearch-filter-title'>Types</h3>
                    <div className='newsSearch-filters-container'>
                        {newsTypes.map((type) => (
                            <label key={type} className='newsSearch-filter-checkbox'>
                                <input
                                    type='checkbox'
                                    checked={selectedTypes.includes(type)}
                                    onChange={() => handleTypeChange(type)}
                                    className='newsSearch-checkbox-input'
                                />
                                <span className='newsSearch-checkbox-custom'></span>
                                <span className='newsSearch-checkbox-label'>{type}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {newsCategories.length > 0 && (
                <div className='newsSearch-filter-group'>
                    <h3 className='newsSearch-filter-title'>Categories</h3>
                    <div className='newsSearch-filters-container newsSearch-filters-container--categories'>
                        {newsCategories.map((category) => (
                            <label key={category} className='newsSearch-filter-checkbox newsSearch-filter-checkbox--category'>
                                <input
                                    type='checkbox'
                                    checked={selectedCategories.includes(category)}
                                    onChange={() => handleCategoryChange(category)}
                                    className='newsSearch-checkbox-input'
                                />
                                <span className='newsSearch-checkbox-custom newsSearch-checkbox-custom--category'></span>
                                <span className='newsSearch-checkbox-label'>{category}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            <div className='row newsSearch-result'>
                {newsRowsLoading || strapiNewsSearchLoading ? (
                    <ul className='newsSearch-list'>
                        {Array.from({ length: pageSize }).map((_, i) => (
                            <li key={i} className='newsSearch-card-skeleton'>
                                <div className='newsSearch-card-img-container'>
                                    <div className='newsSearch-skeleton newsSearch-skeleton-img' />
                                    <span className='newsSearch-card-category newsSearch-skeleton newsSearch-skeleton-chip'></span>
                                </div>
                                <div className='newsSearch-card-content'>
                                    <div className='newsSearch-skeleton newsSearch-skeleton-title' />
                                    <div className='newsSearch-skeleton newsSearch-skeleton-text' />
                                    <div className='newsSearch-skeleton newsSearch-skeleton-btn' />
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <>
                        {newsRowsError && <div className='newsSearch-error-message'>Error loading news.</div>}
                        {results.length === 0 && !newsRowsError && <div className='newsSearch-no-results'>No news was found.</div>}
                        <ul className='newsSearch-list'>
                            {results.map((news) => {
                                const attrs = normalizeItem(news) || {};
                                const newsImageUrl = attrs.News_Image?.data?.attributes?.url || attrs.News_Image?.url;
                                const newsType = attrs.News_Type || '';
                                const newsHeadline = attrs.News_Headline || '';
                                const newsSummary = richTextToString(attrs.News_Summary);
                                const newsUrlSlug = attrs.News_URL || '';
                                const newsDateTime = attrs.News_DateTime || '';
                                const newsItemCategories = getNewsCategories(attrs);
                                const summaryLimit = 150;
                                const summaryShort = newsSummary.length > summaryLimit ? `${newsSummary.slice(0, summaryLimit)}...` : newsSummary;

                                return (
                                    <li key={news.id} className='newsSearch-card'>
                                        <div className='newsSearch-card-img-container'>
                                            {newsImageUrl ? (
                                                <img
                                                    src={globalServerStrapi + newsImageUrl}
                                                    alt={newsHeadline}
                                                    className='newsSearch-card-img'
                                                />
                                            ) : (
                                                newsType === 'Alert' ? (
                                                    <img
                                                        src='/assets/img/alert_img.png'
                                                        alt={newsHeadline}
                                                        className='newsSearch-card-img'
                                                    />
                                                ) : (
                                                    newsType === 'Legal Publication' ? (
                                                        <img
                                                            src='/assets/img/legal_publication_img.png'
                                                            alt={newsHeadline}
                                                            className='newsSearch-card-img'
                                                        />
                                                    ) : (
                                                        <img
                                                            src='/assets/img/news_img.png'
                                                            alt={newsHeadline}
                                                            className='newsSearch-card-img'
                                                        />
                                                    )
                                                )
                                            )}
                                        </div>
                                        <div className='newsSearch-card-content'>
                                            <h6 className='newsSearch-card-category'>[{newsType}]</h6>
                                            {newsItemCategories.length > 0 && (
                                                <div className='newsSearch-card-categories'>
                                                    {newsItemCategories.map((category) => (
                                                        <span key={`${news.id}-${category}`} className='newsSearch-card-chip'>
                                                            {category}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <Link to={`/newsdetails/${newsUrlSlug}`} className='newsSearch-card-title-link'>
                                                <h5 className='newsSearch-card-title'>{newsHeadline}</h5>
                                            </Link>
                                            <p className='newsSearch-card-intro'>{summaryShort}</p>
                                            <p className='newsSearch-card-date'>{new Date(newsDateTime).toLocaleDateString()}</p>
                                            <Link to={`/news_details/${newsUrlSlug}`} className='newsSearch-card-details-link'>
                                                {newsSearch.News_Search_Details_Link_Text}
                                            </Link>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}
            </div>
            {totalPages > 1 && (
                <div className='newsSearch-pagination-container'>
                    <button
                        className={`newsSearch-pagination-btn${currentPage === 1 ? ' disabled' : ''}`}
                        onClick={() => currentPage > 1 && handleSearch(null, currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <span className='icon-size_1 icon-backward-solid'></span>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            className={`newsSearch-pagination-page${currentPage === i + 1 ? ' active' : ''}`}
                            onClick={() => handleSearch(null, i + 1)}
                            disabled={currentPage === i + 1}
                        >
                            <h5>{i + 1}</h5>
                        </button>
                    ))}
                    <button
                        className={`newsSearch-pagination-btn${currentPage === totalPages ? ' disabled' : ''}`}
                        onClick={() => currentPage < totalPages && handleSearch(null, currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <span className='icon-size_1 icon-forward-solid'></span>
                    </button>
                </div>
            )}
        </section>
    );
};

export default NewsSearch;
