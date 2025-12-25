import React, { useEffect, useState, useContext } from 'react';
import './HomeNews.component.css';
import { useStrapiSingle, useStrapiCollection } from '../Strapi/strapiCollection';
import { GlobalContext } from '../Context/Context'; // ⬅️ importar contexto
import { BlocksRenderer } from '@strapi/blocks-react-renderer';

const HomeNews = () => {
    const [homeNews, setHomeNews] = useState(null);
    const [btsNews, setBtsNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const { locale, globalServerStrapi } = useContext(GlobalContext); // Obtener el idioma del contexto

    // Consultas a Strapi con idioma
    const {
        data: strapiHomeNews,
        loading: strapiHomeNewsLoading,
        error: strapiHomeNewsError
    } = useStrapiSingle(`home-news`, '=*');

    // Efectos para asignar data
    useEffect(() => {
        if (strapiHomeNews) setHomeNews(strapiHomeNews);
        setLoading(strapiHomeNewsLoading);
        if (strapiHomeNewsError) {
            console.error("Error fetching Home News: ", strapiHomeNewsError);
        }
    }, [strapiHomeNews, strapiHomeNewsLoading, strapiHomeNewsError]);

    // Consultas a Strapi con idioma
    const {
        data: strapiBtsNews,
        loading: strapiBtsNewsLoading,
        error: strapiBtsNewsError
    } = useStrapiCollection(
        `newss`,
        '=*',
        'News_Order', // primer campo de orden (se ignora pero mantenemos la API)
        'ASC',
        5,
        null,
        '&sort[0]=News_Order:asc&sort[1]=News_DateTime:desc'
    );

    // Efectos para asignar data
    useEffect(() => {
        if (strapiBtsNews) setBtsNews(strapiBtsNews);
        setLoading(strapiBtsNewsLoading);
        if (strapiBtsNewsError) {
            console.error("Error fetching News: ", strapiBtsNewsError);
        }
    }, [strapiBtsNews, strapiBtsNewsLoading, strapiBtsNewsError]);

    // Formatear fecha para mostrar
    const formatNewsDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        // Formato MM/DD para inglés, DD/MM para español
        if (locale === 'en') {
            return `${month}/${day}/${year}`;
        } else {
            return `${day}/${month}/${year}`;
        }
    };

    // Renderizado del Summary
    const renderNewsSummary = (newsSummary) => {
        return (
            (newsSummary.News_Summary) ? (
                <div>
                    <span>
                        <p><span className='home-news-location-time'>{newsSummary.News_Location}, {newsSummary.News_Country}, {formatNewsDate(newsSummary.News_DateTime)}</span></p>
                        <BlocksRenderer content={newsSummary.News_Summary} />
                    </span>
                </div >
            ) : (
                <p></p>
            )
        );
    }

    return (
        (!loading && homeNews?.Home_News_Title) ?
            (
                <div className='home-news-container'>
                    <h2 className='home-news-title'>{homeNews.Home_News_Title}</h2>
                    <p className='home-news-subtitle'>{homeNews.Home_News_SubTitle}</p>
                    {(btsNews && btsNews.length > 0) ? (
                        (btsNews.map((newsItem) => (
                            <div key={newsItem.documentId} className='home-news-item'>
                                <div className='row'>
                                    <div className='col-1'>
                                        {(newsItem.News_Type === 'Alert') ? (
                                            <span className="icon-size_1 home-news-circle-exclamation-icon icon-circle-exclamation-solid" aria-label={newsItem.News_Type} />
                                        ) : (
                                            (newsItem.News_Type === 'Legal Publication') ? (
                                                <span className="icon-size_1 home-news-book-icon icon-book-solid" aria-label={newsItem.News_Type} />
                                            ) : (
                                                <span className="icon-size_1 home-news-newspaper-icon icon-newspaper-solid" aria-label={newsItem.News_Type} />
                                            )

                                        )}
                                    </div>
                                    <div className='col-11'>
                                        <h5 className='home-news-headline'>{newsItem.News_Headline}</h5>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col-1'></div>
                                    <div className='col-11'>
                                        {(newsItem.News_Image?.url) ? (
                                            (newsItem.News_Image_Position === 'Left') ? (
                                                <div className='row'>
                                                    <div className='col-5'>
                                                        <img className='home-news-image' src={globalServerStrapi + newsItem.News_Image.url} alt={newsItem.News_Image_Description} />
                                                    </div>
                                                    <div className='col-7'>
                                                        {renderNewsSummary(newsItem)}
                                                    </div>
                                                </div>
                                            ) : (
                                                (newsItem.News_Image_Position === 'Right') ? (
                                                    <div className='row'>
                                                        <div className='col-7'>
                                                            {renderNewsSummary(newsItem)}
                                                        </div>
                                                        <div className='col-5'>
                                                            <img className='home-news-image' src={globalServerStrapi + newsItem.News_Image.url} alt={newsItem.News_Image_Description} />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    (newsItem.News_Image_Position === 'Top') ? (
                                                        <div className='row'>
                                                            <div className='col-12'>
                                                                <img className='home-news-image' src={globalServerStrapi + newsItem.News_Image.url} alt={newsItem.News_Image_Description} />
                                                                {renderNewsSummary(newsItem)}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className='row'>
                                                            <div className='col-12'>
                                                                {renderNewsSummary(newsItem)}
                                                                <img className='home-news-image' src={globalServerStrapi + newsItem.News_Image.url} alt={newsItem.News_Image_Description} />
                                                            </div>
                                                        </div>
                                                    )
                                                )
                                            )
                                        ) : (

                                            renderNewsSummary(newsItem)
                                        )}
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col-1'></div>
                                    <div className='col-11'>
                                        <div className='row'>
                                            <div className='col-3 home-news-link-section'>
                                                <p>
                                                    <a href={'/newsdetails/' + newsItem.News_URL} target="_blank" rel="noopener noreferrer">
                                                        <span className="icon-size_5 home-news-link-icon icon-link-solid" />
                                                        {locale === 'es' ? ' Leer más' : ' Read more'}
                                                    </a>
                                                </p>
                                            </div>
                                            <div className='col-9'>

                                                {(newsItem.News_Docs && newsItem.News_Docs.length > 0) ?
                                                    (
                                                        newsItem.News_Docs.map((doc) => (
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
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )))
                    ) : (
                        <p>No news available.</p>
                    )}
                    <div className='home-news-final-message-area'>
                        <h6>{homeNews.Home_News_Final_Message}</h6>
                        <h6><a href={homeNews.Home_News_Final_Message_Link_URL}>{homeNews.Home_News_Final_Message_Link_Text}</a></h6>
                    </div>
                </div>
            ) :
            (
                <p>Loading Home News</p>
            )
    );
};
export default HomeNews;