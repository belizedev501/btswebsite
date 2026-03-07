import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStrapiCollection, useStrapiSingle } from '../Strapi/strapiCollection';
import { normalizeRichText, renderRichText } from '../utils/richText';
import './GuideSearch.component.css';

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

const extractCategoriesFromParams = (params) => {
    const rawValues = params.getAll('category');
    return rawValues
        .flatMap((value) => value.split(','))
        .map((value) => value.trim())
        .filter(Boolean);
};

const GuideSearch = () => {
    const [searchParams] = useSearchParams();
    const [titleQuery, setTitleQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState(() => extractCategoriesFromParams(searchParams));
    const [selectedTags, setSelectedTags] = useState([]);

    useEffect(() => {
        setSelectedCategories(extractCategoriesFromParams(searchParams));
    }, [searchParams]);

    const {
        data: guideSearchData,
        loading: guideSearchLoading,
        error: guideSearchError
    } = useStrapiSingle('guide-search', '=*');

    const {
        data: guidesRows,
        loading: guidesLoading,
        error: guidesError
    } = useStrapiCollection('guides', '=*', 'id', 'asc', 300);

    const guides = useMemo(() => {
        return (guidesRows || [])
            .map(normalizeItem)
            .filter(Boolean)
            .map((guide) => {
                const categories = toArray(guide.tax_resource_categories || guide.Tax_Resource_Categories)
                    .map(extractCategoryName)
                    .filter(Boolean);

                const tags = toArray(guide.tags || guide.Tags)
                    .map(extractTagName)
                    .filter(Boolean);

                return {
                    id: guide.id || guide.documentId || guide.Guide_URL || guide.Guide_Title,
                    title: guide.Guide_Title || '',
                    slug: guide.Guide_URL || '',
                    summary: normalizeRichText(guide.Guide_Summary),
                    categories,
                    tags
                };
            });
    }, [guidesRows]);

    const availableCategories = useMemo(() => {
        return [...new Set(
            guides
                .flatMap((guide) => guide.categories)
                .filter(Boolean)
        )].sort((a, b) => a.localeCompare(b));
    }, [guides]);

    const availableTags = useMemo(() => {
        return [...new Set(
            guides
                .flatMap((guide) => guide.tags)
                .filter(Boolean)
        )].sort((a, b) => a.localeCompare(b));
    }, [guides]);

    const filteredGuides = useMemo(() => {
        const normalizedQuery = normalizeForSearch(titleQuery);

        return guides.filter((guide) => {
            const titleMatch = !normalizedQuery
                || normalizeForSearch(guide.title).includes(normalizedQuery);

            const categoryMatch = selectedCategories.length === 0
                || guide.categories.some((category) => selectedCategories.includes(category));

            const tagMatch = selectedTags.length === 0
                || guide.tags.some((tag) => selectedTags.includes(tag));

            return titleMatch && categoryMatch && tagMatch;
        });
    }, [guides, titleQuery, selectedCategories, selectedTags]);

    const handleCheckboxToggle = (value, selected, setSelected) => {
        if (selected.includes(value)) {
            setSelected(selected.filter((item) => item !== value));
            return;
        }
        setSelected([...selected, value]);
    };

    const page = normalizeItem(guideSearchData) || {};
    const title = page.Guide_Search_Title || 'Guide Search';
    const text = normalizeRichText(page.Guide_Search_Text);
    const searchFieldLabel = page.Guide_Search_Title_Search_Field_Name || 'Title';
    const searchFieldPlaceholder = page.Guide_Search_Title_Search_Field_Placeholder || 'Search by title';

    const loading = guideSearchLoading || guidesLoading;
    const error = guideSearchError || guidesError;

    if (loading) return <p className='guide-search-feedback'>Loading guides...</p>;
    if (error) return <p className='guide-search-feedback guide-search-feedback--error'>Error loading guides.</p>;

    return (
        <section className='guide-search'>
            <header className='guide-search__header'>
                <h2 className='guide-search__title'>{title}</h2>
                {renderRichText(text, { className: 'guide-search__text' })}
            </header>

            <div className='guide-search__filters'>
                <div className='guide-search__input-group'>
                    <label htmlFor='guide-search-title' className='guide-search__label'>
                        {searchFieldLabel}
                    </label>
                    <input
                        id='guide-search-title'
                        type='text'
                        className='guide-search__input'
                        placeholder={searchFieldPlaceholder}
                        value={titleQuery}
                        onChange={(event) => setTitleQuery(event.target.value)}
                    />
                </div>

                {availableCategories.length > 0 && (
                    <div className='guide-search__filter-group'>
                        <h3 className='guide-search__filter-title'>Categories</h3>
                        <div className='guide-search__check-grid'>
                            {availableCategories.map((category) => (
                                <label key={category} className='guide-search__check-item'>
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
                    <div className='guide-search__filter-group'>
                        <h3 className='guide-search__filter-title'>Tags</h3>
                        <div className='guide-search__check-grid'>
                            {availableTags.map((tag) => (
                                <label key={tag} className='guide-search__check-item'>
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

            <div className='guide-search__results'>
                {filteredGuides.length === 0 && (
                    <p className='guide-search-feedback'>No guides match the selected filters.</p>
                )}

                {filteredGuides.map((guide) => (
                    <article className='guide-search__card' key={guide.id}>
                        <div className='guide-search__card-body'>
                            {guide.slug ? (
                                <Link className='guide-search__card-title-link' to={`/guide/${guide.slug}`}>
                                    <h3 className='guide-search__card-title'>{guide.title}</h3>
                                </Link>
                            ) : (
                                <h3 className='guide-search__card-title'>{guide.title}</h3>
                            )}

                            {guide.summary && (
                                renderRichText(guide.summary, { className: 'guide-search__card-summary' })
                            )}

                            {guide.categories.length > 0 && (
                                <div className='guide-search__chips'>
                                    {guide.categories.map((category) => (
                                        <span className='guide-search__chip' key={`${guide.id}-category-${category}`}>
                                            {category}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {guide.tags.length > 0 && (
                                <div className='guide-search__chips'>
                                    {guide.tags.map((tag) => (
                                        <span className='guide-search__chip guide-search__chip--tag' key={`${guide.id}-tag-${tag}`}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default GuideSearch;
