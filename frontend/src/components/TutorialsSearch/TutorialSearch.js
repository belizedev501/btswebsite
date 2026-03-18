import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useStrapiCollection, useStrapiSingle } from '../Strapi/strapiCollection';
import { GlobalContext } from '../Context/Context';
import { normalizeRichText, renderRichText } from '../utils/richText';
import './TutorialSearch.component.css';

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

const normalizeForSearch = (value) => {
    if (typeof value !== 'string') return '';
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
};

const extractCategoryName = (category) => {
    const item = normalizeItem(category) || {};
    return (
        item.Tax_Resource_Category_Name
        || item.Tutorial_Category_Name
        || item.Category_Name
        || item.name
        || ''
    );
};

const extractTagName = (tag) => {
    const item = normalizeItem(tag) || {};
    return (
        item.Tag_Name
        || item.tag_name
        || item.name
        || ''
    );
};

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

const getVideoEmbedUrl = (url = '') => getYoutubeEmbed(url) || getVimeoEmbed(url) || '';

const extractValuesFromParams = (params, key) => {
    const rawValues = params.getAll(key);
    return rawValues
        .flatMap((value) => value.split(','))
        .map((value) => value.trim())
        .filter(Boolean);
};

const extractTitleFromParams = (params) => (params.get('title') || '').trim();

const TutorialSearch = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [titleQuery, setTitleQuery] = useState(() => extractTitleFromParams(searchParams));
    const [selectedCategories, setSelectedCategories] = useState(() => extractValuesFromParams(searchParams, 'category'));
    const [selectedTags, setSelectedTags] = useState(() => extractValuesFromParams(searchParams, 'tag'));
    const { globalServerStrapi, globalTokenStrapi, locale } = useContext(GlobalContext);

    useEffect(() => {
        setTitleQuery(extractTitleFromParams(searchParams));
        setSelectedCategories(extractValuesFromParams(searchParams, 'category'));
        setSelectedTags(extractValuesFromParams(searchParams, 'tag'));
    }, [searchParams]);

    useEffect(() => {
        const requestedCategories = extractValuesFromParams(searchParams, 'category');
        if (!locale || !globalServerStrapi || requestedCategories.length === 0) return;

        const baseUrl = globalServerStrapi.replace(/\/+$/, '');
        const headers = {};
        if (globalTokenStrapi) headers.Authorization = `Bearer ${globalTokenStrapi}`;

        const supportedLocales = ['en', 'es'];
        const orderedLookupLocales = [locale, ...supportedLocales.filter((item) => item !== locale)];

        let cancelled = false;
        const redirectToLocalizedCategories = async () => {
            try {
                const localizedCategories = [];

                for (const categoryName of requestedCategories) {
                    let matchedCategory = null;

                    for (const lookupLocale of orderedLookupLocales) {
                        const byNameUrl = `${baseUrl}/api/tax-resource-categories?filters[Tax_Resource_Category_Name][$eq]=${encodeURIComponent(categoryName)}&pagination[limit]=1&locale=${lookupLocale}`;
                        const byNameResponse = await fetch(byNameUrl, { headers });
                        if (!byNameResponse.ok) continue;

                        const byNameResult = await byNameResponse.json();
                        const foundItem = Array.isArray(byNameResult?.data) ? byNameResult.data[0] : null;
                        if (foundItem) {
                            matchedCategory = normalizeItem(foundItem);
                            break;
                        }
                    }

                    if (!matchedCategory?.documentId) {
                        localizedCategories.push(categoryName);
                        continue;
                    }

                    const localizedUrl = `${baseUrl}/api/tax-resource-categories?filters[documentId][$eq]=${encodeURIComponent(matchedCategory.documentId)}&pagination[limit]=1&locale=${locale}`;
                    const localizedResponse = await fetch(localizedUrl, { headers });

                    if (!localizedResponse.ok) {
                        localizedCategories.push(categoryName);
                        continue;
                    }

                    const localizedResult = await localizedResponse.json();
                    const localizedItem = Array.isArray(localizedResult?.data) ? localizedResult.data[0] : null;
                    const localizedCategory = normalizeItem(localizedItem);
                    localizedCategories.push(localizedCategory?.Tax_Resource_Category_Name || categoryName);
                }

                if (cancelled) return;

                const changed = localizedCategories.some((categoryName, index) => categoryName !== requestedCategories[index]);
                if (!changed) return;

                const nextParams = new URLSearchParams(searchParams);
                nextParams.delete('category');
                localizedCategories.forEach((categoryName) => nextParams.append('category', categoryName));
                navigate(`${location.pathname}?${nextParams.toString()}`, { replace: true });
            } catch (fetchError) {
                console.error('Error localizing tutorial search categories:', fetchError);
            }
        };

        redirectToLocalizedCategories();

        return () => {
            cancelled = true;
        };
    }, [globalServerStrapi, globalTokenStrapi, locale, location.pathname, navigate, searchParams]);

    const {
        data: tutorialSearchData,
        loading: tutorialSearchLoading,
        error: tutorialSearchError
    } = useStrapiSingle('tutorial-search', '=*');

    const {
        data: tutorialsRows,
        loading: tutorialsLoading,
        error: tutorialsError
    } = useStrapiCollection('tutorials', '=*', 'Tutorial_Order', 'asc', 300);

    const tutorials = useMemo(() => {
        return (tutorialsRows || [])
            .map(normalizeItem)
            .filter(Boolean)
            .map((tutorial) => {
                const categories = toArray(tutorial.Tutorial_Categories)
                    .map(extractCategoryName)
                    .filter(Boolean);

                const tags = toArray(tutorial.Tutorial_Tags)
                    .map(extractTagName)
                    .filter(Boolean);

                return {
                    id: tutorial.id || tutorial.documentId || tutorial.Tutorial_Title,
                    title: tutorial.Tutorial_Title || '',
                    summary: normalizeRichText(tutorial.Tutorial_Summary),
                    videoUrl: tutorial.Tutorial_Video_URL || '',
                    categories,
                    tags
                };
            });
    }, [tutorialsRows]);

    const availableCategories = useMemo(() => {
        return [...new Set(
            tutorials
                .flatMap((tutorial) => tutorial.categories)
                .filter(Boolean)
        )].sort((a, b) => a.localeCompare(b));
    }, [tutorials]);

    const availableTags = useMemo(() => {
        return [...new Set(
            tutorials
                .flatMap((tutorial) => tutorial.tags)
                .filter(Boolean)
        )].sort((a, b) => a.localeCompare(b));
    }, [tutorials]);

    const filteredTutorials = useMemo(() => {
        const normalizedQuery = normalizeForSearch(titleQuery);

        return tutorials.filter((tutorial) => {
            const titleMatch = !normalizedQuery
                || normalizeForSearch(tutorial.title).includes(normalizedQuery);

            const categoryMatch = selectedCategories.length === 0
                || tutorial.categories.some((category) => selectedCategories.includes(category));

            const tagMatch = selectedTags.length === 0
                || tutorial.tags.some((tag) => selectedTags.includes(tag));

            return titleMatch && categoryMatch && tagMatch;
        });
    }, [tutorials, titleQuery, selectedCategories, selectedTags]);

    const syncFilterValuesWithUrl = (key, values) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete(key);
        values.forEach((value) => nextParams.append(key, value));
        navigate(`${location.pathname}?${nextParams.toString()}`);
    };

    const handleCategoryToggle = (category) => {
        const nextCategories = selectedCategories.includes(category)
            ? selectedCategories.filter((item) => item !== category)
            : [...selectedCategories, category];
        setSelectedCategories(nextCategories);
        syncFilterValuesWithUrl('category', nextCategories);
    };

    const handleTagToggle = (tag) => {
        const nextTags = selectedTags.includes(tag)
            ? selectedTags.filter((item) => item !== tag)
            : [...selectedTags, tag];
        setSelectedTags(nextTags);
        syncFilterValuesWithUrl('tag', nextTags);
    };

    const handleCategoryBadgeClick = (category) => {
        setSelectedCategories([category]);
        syncFilterValuesWithUrl('category', [category]);
    };

    const handleTagBadgeClick = (tag) => {
        setSelectedTags([tag]);
        syncFilterValuesWithUrl('tag', [tag]);
    };

    const page = normalizeItem(tutorialSearchData) || {};
    const title = page.Tutorial_Search_Title || 'Tutorial Search';
    const text = normalizeRichText(page.Tutorial_Search_Text);
    const searchFieldLabel = page.Tutorial_Search_Title_Search_Field_Name || 'Title';
    const searchFieldPlaceholder = page.Tutorial_Search_Title_Search_Field_Placeholder || 'Search by title';

    const loading = tutorialSearchLoading || tutorialsLoading;
    const error = tutorialSearchError || tutorialsError;

    if (loading) return <p className='tutorial-search-feedback'>Loading tutorials...</p>;
    if (error) return <p className='tutorial-search-feedback tutorial-search-feedback--error'>Error loading tutorials.</p>;

    return (
        <section className='tutorial-search'>
            <header className='tutorial-search__header'>
                <h2 className='tutorial-search__title'>{title}</h2>
                {renderRichText(text, { className: 'tutorial-search__text' })}
            </header>

            <div className='tutorial-search__filters'>
                <div className='tutorial-search__input-group'>
                    <label htmlFor='tutorial-search-title' className='tutorial-search__label'>
                        {searchFieldLabel}
                    </label>
                    <input
                        id='tutorial-search-title'
                        type='text'
                        className='tutorial-search__input'
                        placeholder={searchFieldPlaceholder}
                        value={titleQuery}
                        onChange={(event) => setTitleQuery(event.target.value)}
                    />
                </div>

                {availableCategories.length > 0 && (
                    <div className='tutorial-search__filter-group'>
                        <label className='tutorial-search__label'>Categories</label>
                        <div className='tutorial-search__check-grid'>
                            {availableCategories.map((category) => (
                                <label key={category} className='tutorial-search__check-item'>
                                    <input
                                        type='checkbox'
                                        checked={selectedCategories.includes(category)}
                                        onChange={() => handleCategoryToggle(category)}
                                    />
                                    <span>{category}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {availableTags.length > 0 && (
                    <div className='tutorial-search__filter-group'>
                        <label className='tutorial-search__label'>Tags</label>
                        <div className='tutorial-search__check-grid'>
                            {availableTags.map((tag) => (
                                <label key={tag} className='tutorial-search__check-item'>
                                    <input
                                        type='checkbox'
                                        checked={selectedTags.includes(tag)}
                                        onChange={() => handleTagToggle(tag)}
                                    />
                                    <span>{tag}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className='tutorial-search__results'>
                {filteredTutorials.length === 0 && (
                    <p className='tutorial-search-feedback'>No tutorials match the selected filters.</p>
                )}

                {filteredTutorials.map((tutorial) => {
                    const embedUrl = getVideoEmbedUrl(tutorial.videoUrl);

                    return (
                        <article className='tutorial-search__card' key={tutorial.id}>
                            <div className='tutorial-search__card-body'>
                                <h3 className='tutorial-search__card-title'>{tutorial.title}</h3>

                                {tutorial.summary && (
                                    renderRichText(tutorial.summary, { className: 'tutorial-search__card-summary' })
                                )}

                                {tutorial.categories.length > 0 && (
                                    <div className='tutorial-search__chips'>
                                        {tutorial.categories.map((category) => (
                                            <button
                                                type='button'
                                                className='tutorial-search__chip tutorial-search__chip--button'
                                                key={`${tutorial.id}-category-${category}`}
                                                onClick={() => handleCategoryBadgeClick(category)}
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {tutorial.tags.length > 0 && (
                                    <div className='tutorial-search__chips'>
                                        {tutorial.tags.map((tag) => (
                                            <button
                                                type='button'
                                                className='tutorial-search__chip tutorial-search__chip--button tutorial-search__chip--tag'
                                                key={`${tutorial.id}-tag-${tag}`}
                                                onClick={() => handleTagBadgeClick(tag)}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {embedUrl ? (
                                <div className='tutorial-search__video'>
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
                                        className='tutorial-search__video-link'
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
            </div>
        </section>
    );
};

export default TutorialSearch;
