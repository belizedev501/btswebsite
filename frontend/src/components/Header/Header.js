import React, { useEffect, useState, useContext } from 'react';
import './Header.component.css';
import { useStrapiSingle } from '../Strapi/strapiCollection';
import { GlobalContext } from '../Context/Context';

const Header = () => {
    const [newsCarousel, setNewsCarousel] = useState(null);
    const [menuOption, setMenuOption] = useState(null);
    const [loading, setLoading] = useState(true);

    const { locale, setLocale } = useContext(GlobalContext);

    const changeLanguage = (newLocale) => {
        if (newLocale !== locale) {
            setLocale(newLocale);
        }
    };

    const {
        data: strapiNewsCarousel,
        loading: strapiNewsCarouselLoading,
        error: strapiNewsCarouselError
    } = useStrapiSingle(`header?locale=${locale}`, '[news_carousel][fields][0]=News_DateTime&populate[news_carousel][fields][1]=News_Headline_Carousel&populate[news_carousel][sort][0]=News_DateTime:asc');

    const {
        data: strapiMenuOption,
        loading: strapiMenuOptionLoading,
        error: strapiMenuOptionError
    } = useStrapiSingle(`header?locale=${locale}`, '[menu_options][sort][0]=Option_Order:asc&populate[menu_options][populate][menu_options][sort][0]=Option_Order:asc&populate[menu_options][populate][menu_options][populate][menu_options][sort][0]=Option_Order:asc');

    useEffect(() => {
        if (strapiNewsCarousel) setNewsCarousel(strapiNewsCarousel);
        if (strapiMenuOption) setMenuOption(strapiMenuOption);
        setLoading(strapiNewsCarouselLoading || strapiMenuOptionLoading);
        if (strapiNewsCarouselError) console.error('Error fetching News Carousel:', strapiNewsCarouselError);
        if (strapiMenuOptionError) console.error('Error fetching Menu Options:', strapiMenuOptionError);
    }, [strapiNewsCarousel, strapiMenuOption, strapiNewsCarouselLoading, strapiMenuOptionLoading, strapiNewsCarouselError, strapiMenuOptionError]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}.${month}.${day} ${hours}:${minutes}`;
    };

    return (
        <header className="container boxed-container container-fluid header-container">

            {/* ====== HEADER TOP (se oculta en móvil) ====== */}
            <div className="header-top d-none d-lg-block"> {/* Añadido d-none d-lg-block */}
                <div className="row align-items-center">
                    <div className="col-md-2 text-center">
                        <a href="/" className='header-carousel-big-link'>IRIS Belize</a>
                    </div>
                    <div className="col-md-8 text-center">
                        <div className='header-carousel'>
                            {loading && <span className='header-carousel-text'>Loading News...</span>}
                            {!loading && newsCarousel?.news_carousel && (
                                <div className="header-carousel-wrapper">
                                    <div className="header-carousel-content">
                                        {newsCarousel.news_carousel.map((item) => (
                                            <span key={item.id} className='header-carousel-text'>
                                                {formatDate(item.News_DateTime)} - {item.News_Headline_Carousel} &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                                            </span>
                                        ))}
                                        {newsCarousel.news_carousel.map((item) => (
                                            <span key={`${item.id}-duplicate`} className='header-carousel-text'>
                                                {formatDate(item.News_DateTime)} - {item.News_Headline_Carousel} &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-2 text-center">
                        <a href="/" className='header-carousel-big-link'>TAX Calculator</a>
                    </div>
                </div>
            </div>

            {/* ====== HEADER MIDDLE (Logos y Título) ====== */}
            <div className="header-middle">
                <div className="text-center header-logo-left">
                    <img src="/assets/bts_logo.png" alt="Belize Tax Service Logo" className="header-logo" />
                </div>
                <div className="text-center title-center">
                    <h1 className="header-title">Belize Tax<br className="mobile-only-break" /> Service</h1>
                    <span className='header-moto-pc'>
                        {!loading && newsCarousel?.news_carousel && (
                            <h6 className="header-subtitle">
                                {newsCarousel.Header_Moto}
                            </h6>
                        )}
                    </span>
                </div>
                <div className="text-center header-logo-right">
                    <img src="/assets/coat_of_arms.png" alt="Coat of Arms" className="header-logo" />
                </div>
                <div className='row header-moto-mobile'>
                    {!loading && newsCarousel?.news_carousel && (
                        <h6 className="header-subtitle">
                            {newsCarousel.Header_Moto}
                        </h6>
                    )}
                </div>
            </div>

            {/* ====== MENU / NAVBAR (Contiene la lógica responsive) ====== */}
            <div className='header-menu'>
                <nav className="navbar navbar-expand-lg bg-body-tertiary header-navbar">
                    <div className="container-fluid">

                        {/* -- Elementos visibles solo en móvil -- */}
                        <a href="/" className='navbar-brand header-mobile-brand d-lg-none'>
                            <span className="brand-iris">IRIS</span>
                            <span className="brand-belize">BELIZE</span>
                        </a>
                        <a href="/" className='nav-link header-mobile-tax-link d-lg-none'>TAX Calculator</a> {/* Añadido d-lg-none */}

                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>

                        <div className="collapse navbar-collapse" id="navbarNavDropdown">
                            {loading && <span>Loading Menu...</span>}
                            {!loading && menuOption?.menu_options && (
                                <ul className="navbar-nav mx-auto">
                                    {menuOption.menu_options.map((item) => (
                                        (item.menu_options && item.menu_options.length > 0) ? (
                                            <li key={item.documentId} className="nav-item dropdown">
                                                <a className="nav-link dropdown-toggle" href={item.Option_URL} role="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                                                    {item.Option_Name}
                                                </a>
                                                <ul className="dropdown-menu">
                                                    {item.menu_options.map((itemSubMenu) => (
                                                        (itemSubMenu.menu_options && itemSubMenu.menu_options.length > 0) ? (
                                                            <li key={itemSubMenu.documentId} className="dropend">
                                                                <a className="dropdown-item dropdown-toggle" href={itemSubMenu.Option_URL} data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                                                                    {itemSubMenu.Option_Name}
                                                                </a>
                                                                <ul className="dropdown-menu">
                                                                    {itemSubMenu.menu_options.map((itemSubSubMenu) => (
                                                                        <li key={itemSubSubMenu.documentId}>
                                                                            <a className="dropdown-item" href={itemSubSubMenu.Option_URL}>{itemSubSubMenu.Option_Name}</a>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </li>
                                                        ) : (
                                                            <li key={itemSubMenu.documentId} className="nav-item">
                                                                <a className="dropdown-item" aria-current="page" href={itemSubMenu.Option_URL}>{itemSubMenu.Option_Name}</a>
                                                            </li>
                                                        )
                                                    ))}
                                                </ul>
                                            </li>
                                        ) : (
                                            <li key={item.documentId} className="nav-item">
                                                <a className="nav-link" aria-current="page" href={item.Option_URL}>{item.Option_Name}</a>
                                            </li>)
                                    ))}
                                    <li className="nav-item d-lg-none w-100"> {/* Añadido d-lg-none */}
                                        <div className="header-lang-mobile-wrapper">
                                            <button className={`nav-link header-english ${locale === 'en' ? 'active-lang' : ''}`} onClick={() => changeLanguage('en')}>English</button>
                                            <span> | </span>
                                            <button className={`nav-link header-espanol ${locale === 'es' ? 'active-lang' : ''}`} onClick={() => changeLanguage('es')}>Español</button>
                                        </div>
                                    </li>
                                </ul>
                            )}
                            {/* -- Idiomas visibles solo en desktop -- */}
                            <ul className="navbar-nav d-none d-lg-flex"> {/* Añadido d-none d-lg-flex */}
                                <li key="key_english_btn" className="nav-item header-lang">
                                    <button className={`nav-link header-english ${locale === 'en' ? 'active-lang' : ''}`} aria-current="page" onClick={() => changeLanguage('en')}>English</button>
                                </li>
                                <button className="nav-link"> | </button>
                                <li key="key_espanol_btn" className="nav-item header-lang">
                                    <button className={`nav-link header-espanol ${locale === 'es' ? 'active-lang' : ''}`} aria-current="page" onClick={() => changeLanguage('es')}>Español</button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;