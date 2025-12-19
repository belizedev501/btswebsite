import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GlobalContext } from '../Context/Context';
import './NewsSearch.component.css';
import { useStrapiSingle } from '../Strapi/strapiCollection';


const NewsSearch = () => {
    const { globalServerStrapi, globalTokenStrapi } = useContext(GlobalContext);
    const [search, setSearch] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 6;
    const [newsSearch, setNewsSeacrh] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [newsTypes, setNewsTypes] = useState([]);

    // Obtener los tipos de noticias únicos
    useEffect(() => {
        const fetchNewsTypes = async () => {
            try {
                const url = `${globalServerStrapi}/api/newss?populate=*`;
                const res = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${globalTokenStrapi}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    //console.log('Fetched news data:', data); // Debug

                    // Extraer tipos únicos
                    const types = [...new Set(
                        data.data
                            .map(item => item.News_Type)
                            .filter(type => typeof type === 'string' && type.trim() !== '')
                    )];


                    //console.log('Unique types:', types); // Debug
                    setNewsTypes(types.sort());
                }
            } catch (err) {
                console.error('Error fetching news types:', err);
            }
        };

        if (globalServerStrapi && globalTokenStrapi) {
            fetchNewsTypes();
        }
    }, [globalServerStrapi, globalTokenStrapi]);

    const handleTypeChange = (type) => {
        setSelectedTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const handleSearch = async (e, page = 1) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);
        setResults([]);
        try {
            const start = (page - 1) * pageSize;
            let url = `${globalServerStrapi}/api/newss?populate=*&sort=News_DateTime:DESC&pagination[limit]=${pageSize}&pagination[start]=${start}`;

            // Construir filtros
            const filters = [];

            // Agregar filtro de búsqueda si hay texto
            if (search.trim()) {
                filters.push(`filters[News_Headline][$containsi]=${encodeURIComponent(search)}`);
            }

            // Agregar filtros de tipo si hay tipos seleccionados
            if (selectedTypes.length > 0) {
                selectedTypes.forEach((type, index) => {
                    filters.push(`filters[$or][${index}][News_Type][$eq]=${encodeURIComponent(type)}`);
                });
            }

            // Agregar filtros a la URL
            if (filters.length > 0) {
                url += '&' + filters.join('&');
            }

            //console.log('Search URL:', url); // Debug

            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${globalTokenStrapi}`
                }
            });
            if (!res.ok) throw new Error('Error querying the API');
            const data = await res.json();
            setResults(data.data || []);
            const total = data.meta?.pagination?.total || 0;
            setTotalPages(Math.ceil(total / pageSize));
            setCurrentPage(page);
        } catch (err) {
            setError('Error loading news.');
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (globalServerStrapi && globalTokenStrapi) {
            handleSearch(null, 1);
        }
        // eslint-disable-next-line
    }, [selectedTypes, globalServerStrapi, globalTokenStrapi]);

    const richTextToString = (richText) => {
        if (!richText) return '';
        if (Array.isArray(richText)) {
            return richText
                .map(block =>
                    block.children?.map(child => child.text).join('')
                )
                .join('\n');
        }
        if (typeof richText === 'string') return richText;
        return '';
    };

    const {
        data: strapiNewsSearch,
        loading: strapiNewsSearchLoading,
        error: strapiNewsSearchError
    } = useStrapiSingle(`news-search`, '=*');

    useEffect(() => {
        if (strapiNewsSearch) setNewsSeacrh(strapiNewsSearch);
        if (strapiNewsSearchError) {
            console.error("Error fetching News Search: ", strapiNewsSearchError);
        }
    }, [strapiNewsSearch, strapiNewsSearchError]);

    return (
        <section className='newsSearch-section'>
            <div className='newsSearch-title-container'>
                <h2>{newsSearch.News_Search_Title}</h2>
            </div>
            <form onSubmit={e => handleSearch(e, 1)} className="newsSearch-container">
                <input
                    type="text"
                    className="newsSearch-input"
                    placeholder={newsSearch.News_Search_Placeholder}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button type="submit" className="newsSearch-button">
                    <span className='icon-size_1 icon-magnifying-glass-solid-full'></span>
                </button>
            </form>

            {/* Filtros de tipo */}
            {newsTypes.length > 0 && (
                <div className="newsSearch-filters-container">
                    {newsTypes.map(type => (
                        <label key={type} className="newsSearch-filter-checkbox">
                            <input
                                type="checkbox"
                                checked={selectedTypes.includes(type)}
                                onChange={() => handleTypeChange(type)}
                                className="newsSearch-checkbox-input"
                            />
                            <span className="newsSearch-checkbox-custom"></span>
                            <span className="newsSearch-checkbox-label">{type}</span>
                        </label>
                    ))}
                </div>
            )}

            <div className="row newsSearch-result">
                {loading ? (
                    <ul className='newsSearch-list'>
                        {Array.from({ length: pageSize }).map((_, i) => (
                            <li key={i} className="newsSearch-card-skeleton">
                                <div className="newsSearch-card-img-container">
                                    <div className="newsSearch-skeleton newsSearch-skeleton-img" />
                                    <span className="newsSearch-card-category newsSearch-skeleton newsSearch-skeleton-chip"></span>
                                </div>
                                <div className="newsSearch-card-content">
                                    <div className="newsSearch-skeleton newsSearch-skeleton-title" />
                                    <div className="newsSearch-skeleton newsSearch-skeleton-text" />
                                    <div className="newsSearch-skeleton newsSearch-skeleton-btn" />
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <>
                        {error && <div className="newsSearch-error-message">{error}</div>}
                        {results.length === 0 && !error && <div className="newsSearch-no-results">No news was found.</div>}
                        <ul className='newsSearch-list' >
                            {results.map(news => {
                                const attrs = news.attributes || news;
                                const news_image_url = attrs.News_Image?.data?.attributes?.url || attrs.News_Image?.url;
                                const news_Type = attrs.News_Type || '';
                                const news_Headline = attrs.News_Headline || '';
                                const news_Summary = richTextToString(attrs.News_Summary);
                                const news_URL_slug = attrs.News_URL || '';
                                const news_DateTime = attrs.News_DateTime || '';
                                const summaryLimit = 150;
                                const summaryShort = news_Summary.length > summaryLimit ? news_Summary.slice(0, summaryLimit) + '...' : news_Summary;
                                return (
                                    <li key={news.id} className="newsSearch-card">
                                        <div className="newsSearch-card-img-container">
                                            {news_image_url ? (
                                                <img
                                                    src={globalServerStrapi + news_image_url}
                                                    alt={news_Headline}
                                                    className="newsSearch-card-img"
                                                />) : (
                                                news_Type === 'Alert' ? (
                                                    <img
                                                        src='/assets/img/alert_img.png'
                                                        alt={news_Headline}
                                                        className="newsSearch-card-img"
                                                    />
                                                ) : (
                                                    news_Type === 'Legal Publication' ? (
                                                        <img
                                                            src='/assets/img/legal_publication_img.png'
                                                            alt={news_Headline}
                                                            className="newsSearch-card-img"
                                                        />
                                                    ) : (
                                                        <img
                                                            src='/assets/img/news_img.png'
                                                            alt={news_Headline}
                                                            className="newsSearch-card-img"
                                                        />
                                                    )
                                                )
                                            )}
                                        </div>
                                        <div className="newsSearch-card-content">
                                            <h6 className='newsSearch-card-category'>[{news_Type}]</h6>
                                            <Link to={`/news/n=${news_URL_slug}`} className="newsSearch-card-title-link">
                                                <h5 className="newsSearch-card-title">{news_Headline}</h5>
                                            </Link>
                                            <p className="newsSearch-card-intro">{summaryShort}</p>
                                            <p className="newsSearch-card-date">{new Date(news_DateTime).toLocaleDateString()}</p>
                                            <Link to={`/news/n=${news_URL_slug}`} className="newsSearch-card-details-link">
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
                <div className="newsSearch-pagination-container">
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
        </section >
    );
};

export default NewsSearch;