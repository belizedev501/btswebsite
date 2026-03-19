import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStrapiCollection, useStrapiSingle } from '../Strapi/strapiCollection';
import { GlobalContext } from '../Context/Context';
import './TaxResourcesContent.component.css';
import { renderRichText } from '../utils/richText';

const TYPE_ICON = {
    'Legal': 'icon-book-solid',
    'Publication': 'icon-newspaper-solid',
    'Forms & Downloads': 'icon-download-solid',
    'Tax Ruling': 'icon-scale-balanced-solid',
    'Guidelines': 'icon-list-check-solid'
};

const TYPE_ORDER = ['Legal', 'Publication', 'Forms & Downloads', 'Tax Ruling', 'Guidelines'];

const sortTypes = (types) => {
    return [...types].sort((a, b) => {
        const indexA = TYPE_ORDER.indexOf(a);
        const indexB = TYPE_ORDER.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });
};

const normalizeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) {
        return value.data.map((item) => item?.attributes || item).filter(Boolean);
    }
    return [];
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

const TaxResourcesContent = () => {
    const { locale } = useContext(GlobalContext);
    const isSpanish = locale === 'es';
    const texts = {
        loading: isSpanish ? 'Cargando recursos tributarios...' : 'Loading Tax Resources...',
        error: isSpanish ? 'Error cargando recursos tributarios.' : 'Error loading Tax Resources.',
        defaultTitle: isSpanish ? 'Recursos Tributarios' : 'Tax Resources',
        defaultText: isSpanish ? 'Accede a leyes, formularios, guias y actualizaciones para todos los tipos de impuestos.' : 'Access laws, forms, guidelines, and updates for all tax types.',
        newsTitle: isSpanish ? 'Noticias y Actualizaciones' : 'News & Updates',
        newsText: isSpanish ? 'Mantente informado con las ultimas actualizaciones del Belize Tax Service.' : 'Stay informed with the latest updates from Belize Tax Service.',
        upcomingEvents: isSpanish ? 'Proximos Eventos' : 'Upcoming Events'
    };

    const {
        data: pageData,
        loading: pageLoading
    } = useStrapiSingle('tax-resources-page', '=*');

    const {
        data: categoryRows,
        loading: categoriesLoading,
        error: categoriesError
    } = useStrapiCollection(
        'tax-resource-categories',
        '[Tax_Resources][fields][0]=Tax_Resource_ID&populate[Tax_Resources][fields][1]=Tax_Resource_Title&populate[Tax_Resources][fields][2]=Tax_Resource_Type&populate[Tax_Resources][fields][3]=Tax_Resource_Summary',
        'Tax_Resource_Category_Name',
        'asc',
        null,
        null
    );

    const {
        data: newsRows,
        loading: newsLoading
    } = useStrapiCollection(
        'newss',
        '=*',
        'News_DateTime',
        'desc',
        100
    );

    const {
        data: eventsRows,
        loading: eventsLoading
    } = useStrapiCollection(
        'events-and-deadlines',
        '=*',
        'Event_Deadline_DateTime',
        'asc',
        100
    );

    const categoryCards = normalizeArray(categoryRows);

    const newsByType = useMemo(() => {
        const grouped = {};
        normalizeArray(newsRows).forEach((item) => {
            const newsType = (item?.News_Type || '').trim();
            if (!newsType) return;
            if (!grouped[newsType]) grouped[newsType] = [];
            grouped[newsType].push(item);
        });
        return grouped;
    }, [newsRows]);

    const orderedNewsTypes = useMemo(() => {
        return Object.keys(newsByType).sort((a, b) => a.localeCompare(b));
    }, [newsByType]);

    if (categoriesLoading || pageLoading || newsLoading || eventsLoading) {
        return <p>{texts.loading}</p>;
    }

    if (categoriesError) {
        return <p>{texts.error}</p>;
    }

    return (
        <section className='tr-content'>
            <div className='tr-header'>
                <h2>{pageData?.Tax_Resources_Page_Title || texts.defaultTitle}</h2>
                <h6>{pageData?.Tax_Resources_Page_Text || texts.defaultText}</h6>
            </div>

            <div className='tr-grid'>
                {categoryCards.map((category) => {
                    const categoryId = category?.Tax_Resource_Category_ID || category?.documentId || category?.id;
                    const resources = normalizeArray(category?.Tax_Resources);
                    const typeCounts = resources.reduce((acc, resource) => {
                        parseResourceTypes(resource?.Tax_Resource_Type).forEach((type) => {
                            acc[type] = (acc[type] || 0) + 1;
                        });
                        return acc;
                    }, {});
                    const categoryTypes = sortTypes(Object.keys(typeCounts));

                    return (
                        <article className='tr-card' key={categoryId}>
                            <Link className='tr-card-title-link' to={`/tax_resources/category/${categoryId}`}>
                                <h3 className='tr-card-title'>{category?.Tax_Resource_Category_Name}</h3>
                            </Link>

                            <div className='tr-card-description'>
                                {renderRichText(category?.Tax_Resource_Category_Text || '')}
                            </div>

                            <div className='tr-card-types'>
                                {categoryTypes.map((type) => {
                                    const iconClass = TYPE_ICON[type] || 'icon-file-solid';
                                    return (
                                        <Link
                                            className='tr-type-link'
                                            key={`${categoryId}-${type}`}
                                            to={`/tax_resources/category/${categoryId}?type=${encodeURIComponent(type)}`}
                                        >
                                            <span className={`icon-size_5 ${iconClass}`} />
                                            <span>{type} ({typeCounts[type] || 0})</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </article>
                    );
                })}

                <article className='tr-card'>
                    <h3 className='tr-card-title'>{pageData?.Tax_Resources_Page_News_Title || texts.newsTitle}</h3>
                    <div className='tr-card-description'>
                        <p>{pageData?.Tax_Resources_Page_News_Text || texts.newsText}</p>
                    </div>
                    <div className='tr-card-types'>
                        {orderedNewsTypes.map((newsType) => (
                            <Link
                                className='tr-type-link'
                                key={newsType}
                                to={`/news?type=${encodeURIComponent(newsType)}`}
                            >
                                <span className='icon-size_5 icon-newspaper-solid' />
                                <span>{newsType} ({newsByType[newsType]?.length || 0})</span>
                            </Link>
                        ))}
                        <Link className='tr-type-link' to='/calendar'>
                            <span className='icon-size_5 icon-calendar-days-solid' />
                            <span>{texts.upcomingEvents} ({normalizeArray(eventsRows).length})</span>
                        </Link>
                    </div>
                </article>
            </div>
        </section>
    );
};

export default TaxResourcesContent;
