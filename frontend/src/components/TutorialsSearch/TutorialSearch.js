import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStrapiCollection, useStrapiSingle } from '../Strapi/strapiCollection';
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

const extractCategoriesFromParams = (params) => {
    const rawValues = params.getAll('category');
    return rawValues
        .flatMap((value) => value.split(','))
        .map((value) => value.trim())
        .filter(Boolean);
};

const TutorialSearch = () => {
    const [searchParams] = useSearchParams();
    const [titleQuery, setTitleQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState(() => extractCategoriesFromParams(searchParams));
    const [selectedTags, setSelectedTags] = useState([]);

    useEffect(() => {
        setSelectedCategories(extractCategoriesFromParams(searchParams));
    }, [searchParams]);

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

    const handleCheckboxToggle = (value, selected, setSelected) => {
        if (selected.includes(value)) {
            setSelected(selected.filter((item) => item !== value));
            return;
        }
        setSelected([...selected, value]);
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
                        <h3 className='tutorial-search__filter-title'>Categories</h3>
                        <div className='tutorial-search__check-grid'>
                            {availableCategories.map((category) => (
                                <label key={category} className='tutorial-search__check-item'>
                                    <input
                                        type='checkbox'
                                        checked={selectedCategories.includes(category)}
                                        onChange={() => handleCheckboxToggle(category, selectedCategories, setSelectedCategories)}
                                    />
                                    <span>{category}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {availableTags.length > 0 && (
                    <div className='tutorial-search__filter-group'>
                        <h3 className='tutorial-search__filter-title'>Tags</h3>
                        <div className='tutorial-search__check-grid'>
                            {availableTags.map((tag) => (
                                <label key={tag} className='tutorial-search__check-item'>
                                    <input
                                        type='checkbox'
                                        checked={selectedTags.includes(tag)}
                                        onChange={() => handleCheckboxToggle(tag, selectedTags, setSelectedTags)}
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
                                            <span className='tutorial-search__chip' key={`${tutorial.id}-category-${category}`}>
                                                {category}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {tutorial.tags.length > 0 && (
                                    <div className='tutorial-search__chips'>
                                        {tutorial.tags.map((tag) => (
                                            <span className='tutorial-search__chip tutorial-search__chip--tag' key={`${tutorial.id}-tag-${tag}`}>
                                                {tag}
                                            </span>
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
