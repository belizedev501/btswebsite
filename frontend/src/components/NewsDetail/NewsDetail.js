import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BlocksRenderer } from '@strapi/blocks-react-renderer';
import { FaFacebookF, FaLinkedinIn, FaWhatsapp, FaLink } from 'react-icons/fa';
import { GlobalContext } from '../Context/Context';
import './NewsDetail.component.css';

const NewsDetail = () => {
    const { slug } = useParams();
    const { locale, globalServerStrapi, globalTokenStrapi } = useContext(GlobalContext);
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            setError(null);
            try {
                const cleanedSlug = (slug || '').replace(/^n=/, '');
                const url =
                    `${globalServerStrapi}/api/newss?` +
                    `filters[News_URL][$eq]=${encodeURIComponent(cleanedSlug)}` +
                    `&pagination[limit]=1` +
                    `&populate[News_Image][populate]=*` +
                    `&populate[News_Docs][populate]=*` +
                    `&populate[News_Content][populate][News_Content_Image][populate]=*`;

                const res = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${globalTokenStrapi}`
                    }
                });
                if (!res.ok) throw new Error('Error from Strapi API');
                const data = await res.json();
                const item = data?.data?.[0];
                setNews(item ? item.attributes || item : null);
            } catch (err) {
                setError('Error loading the news.');
            } finally {
                setLoading(false);
            }
        };

        if (globalServerStrapi && globalTokenStrapi) {
            fetchNews();
        }
    }, [slug, globalServerStrapi, globalTokenStrapi]);

    const renderBlocks = (content) => {
        if (!content) return null;
        return <BlocksRenderer content={content} />;
    };

    const renderContentItem = (contentItem, idx) => {
        const item = contentItem.attributes || contentItem;
        const position = (item.News_Content_Image_Position || '').toLowerCase();
        const imageUrl = item.News_Content_Image?.data?.attributes?.url || item.News_Content_Image?.url;
        const imageAlt =
            item.News_Content_Image?.data?.attributes?.alternativeText ||
            item.News_Content_Image_Description ||
            'Imagen de contenido';
        const image = imageUrl ? (
            <img
                src={globalServerStrapi + imageUrl}
                alt={imageAlt}
                className={
                    position === 'banner'
                        ? 'newsDetail-img-banner'
                        : position === 'left' || position === 'izquierda'
                            ? 'newsDetail-img-l'
                            : position === 'right' || position === 'derecha'
                                ? 'newsDetail-img-r'
                                : 'newsDetail-img'
                }
            />
        ) : null;

        const isLeft = position === 'left' || position === 'izquierda';
        const isRight = position === 'right' || position === 'derecha';
        const isTop = position === 'top' || position === 'arriba';
        const isBottom = position === 'bottom' || position === 'abajo';
        const isBanner = position === 'banner';

        return (
            <div
                key={item.id || idx}
                className={
                    isBanner
                        ? 'newsDetail-container-banner'
                        : isLeft || isRight
                            ? 'newsDetail-container newsDetail-container-flex'
                            : 'newsDetail-container'
                }
            >
                {isTop && image}

                {(isLeft || isRight) ? (
                    <div
                        className={`newsDetail-flex-responsive${isRight ? ' mobile-derecha' : ''}`}
                        style={{
                            display: 'flex',
                            flexDirection: isLeft ? 'row' : 'row-reverse',
                            alignItems: 'flex-start',
                            gap: 24
                        }}
                    >
                        {image}
                        <div style={{ flex: 1 }}>{renderBlocks(item.News_Content_Text)}</div>
                    </div>
                ) : null}

                {isBanner && image}

                {!isLeft && !isRight && !isTop && !isBanner && renderBlocks(item.News_Content_Text)}
                {isBottom && image}
                {isTop && renderBlocks(item.News_Content_Text)}
                {!position && image}
            </div>
        );
    };

    if (loading) {
        return (
            <section className="newsDetail-section">
                <div className="newsDetail-header">
                    <div className="skeleton-categoria skeleton-box"></div>
                    <div className="skeleton-titulo skeleton-box"></div>
                    <div className="skeleton-banner skeleton-box"></div>
                </div>
                <div className="newsDetail-tarjeta-section">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton-tarjeta-container">
                            <div className="skeleton-tarjeta-titulo skeleton-box"></div>
                            <div className="skeleton-tarjeta-contenido skeleton-box"></div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (error) return <div>{error}</div>;
    if (!news) return <div>The news was not found.</div>;

    const categoria = news.News_Type || 'Sin Categoria';
    const bannerUrl = news.News_Image?.data?.attributes?.url || news.News_Image?.url;
    const bannerAlt = news.News_Image?.data?.attributes?.alternativeText || news.News_Image_Description || news.News_Headline;

    return (
        <section className="container newsDetail-section">
            <div className="container newsDetail-container">
                <div className="newsDetail-header">
                    <h5>{'[' + categoria + ']'}</h5>
                    <h4 className='newsDetail-headline'>{news.News_Headline}</h4>
                    <span className='newsDetail-summary'>{renderBlocks(news.News_Summary)}</span>

                    <div className="newsDetail-meta">
                        {news.News_Author && <span className="newsDetail-meta-item">{news.News_Author + ' - '}</span>}
                        {news.News_DateTime && (
                            <span className="newsDetail-meta-item">
                                {(new Date(news.News_DateTime).toLocaleDateString()) + ', '}
                            </span>
                        )}
                        {(news.News_Location || news.News_Country) && (
                            <span className="newsDetail-meta-item">
                                {[news.News_Location, news.News_Country].filter(Boolean).join(', ')}
                            </span>
                        )}
                    </div>
                    {bannerUrl && (
                        <img
                            src={globalServerStrapi + bannerUrl}
                            alt={bannerAlt}
                            className="newsDetail-banner"
                        />
                    )}
                </div>

                <div className="newsDetail-content-paragraphs">
                    {(news.News_Content && news.News_Content.length > 0) ? (
                        news.News_Content.map((contentItem, idx) => renderContentItem(contentItem, idx))
                    ) : (
                        <p></p>
                    )}
                </div>

                <div className="newsDetail-content-files">
                    {(news.News_Docs && news.News_Docs.length > 0) ?
                        (
                            news.News_Docs.map((doc) => (
                                <div key={doc.id} className='home-news-link-section'>
                                    <p>
                                        {/* Ver documento */}
                                        <a
                                            href={globalServerStrapi + doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <span className="icon-size_5 home-news-file-icon icon-file-solid" />
                                            {locale === 'es' ? ' Ver ' : ' View '}
                                        </a>

                                        {/* Descargar documento */}
                                        {' '}
                                        <a
                                            href="/"
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                try {
                                                    const response = await fetch(globalServerStrapi + doc.url);
                                                    const blob = await response.blob();
                                                    const url = window.URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = doc.name || 'download';
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    a.remove();
                                                    window.URL.revokeObjectURL(url);
                                                } catch (error) {
                                                    console.error('Error downloading file:', error);
                                                }
                                            }}
                                        >
                                            <span className="icon-size_5 home-news-download-icon icon-download-solid" />
                                            {locale === 'es' ? ' Descargar ' : ' Download '}
                                        </a>

                                        {' ' + doc.name}
                                    </p>
                                </div>
                            )
                            )
                        ) : (null)
                    }
                </div>
                <div className="newsDetail-share" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
                    <span style={{ marginBottom: 8, fontWeight: 500, fontSize: 16, color: '#02B1C4' }}>Compartir en:</span>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                        <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Compartir en LinkedIn"
                            className="newsDetail-share-btn"
                            style={{ color: '#02B1C4', fontSize: 20 }}
                        >
                            <FaLinkedinIn />
                        </a>
                        <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Compartir en Facebook"
                            className="newsDetail-share-btn"
                            style={{ color: '#02B1C4', fontSize: 20 }}
                        >
                            <FaFacebookF />
                        </a>
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(news.News_Headline + ' ' + window.location.href)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Compartir en WhatsApp"
                            className="newsDetail-share-btn"
                            style={{ color: '#02B1C4', fontSize: 20 }}
                        >
                            <FaWhatsapp />
                        </a>
                        <button
                            onClick={() => { navigator.clipboard.writeText(window.location.href); }}
                            title="Copiar enlace"
                            className="newsDetail-share-btn"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#02B1C4' }}
                        >
                            <FaLink />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewsDetail;
