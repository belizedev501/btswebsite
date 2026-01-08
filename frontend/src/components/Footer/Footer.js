import React, { useEffect, useState, useContext } from 'react';
import './Footer.component.css';
import { useStrapiSingle } from '../Strapi/strapiCollection';
import { GlobalContext } from '../Context/Context';

const Footer = () => {
    const [footer, setFooter] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Traemos setLocale y locale del contexto para la funcionalidad de idioma en móvil
    const { globalServerStrapi, locale, setLocale } = useContext(GlobalContext);

    // Función para cambiar idioma (Misma lógica que Header.js)
    const changeLanguage = (newLocale) => {
        if (newLocale !== locale) {
            setLocale(newLocale);
        }
    };

    const {
        data: strapiFooter,
        loading: strapiFooterLoading,
        error: strapiFooterError
    } = useStrapiSingle('footer', '[Footer_Column_01_Option]=true&populate[Footer_Column_02_Option]=true&populate[Footer_Column_03_Option]=true&populate[Icono_Red_Social][populate][Red_Social_Icono]=true&populate[Footer_Logos]=true');

    useEffect(() => {
        if (strapiFooter) setFooter(strapiFooter);
        setLoading(strapiFooterLoading);
        if (strapiFooterError) {
            console.error("Error loading Footer:", strapiFooterError);
        }
    }, [strapiFooter, strapiFooterLoading, strapiFooterError]);

    // Helper para renderizar links en móvil sin repetir código
    const renderMobileLinks = (options) => (
        Array.isArray(options) && options.map(option => (
            <a key={option.id} className='mobile-footer-option' href={option.Option_URL}>
                {option.Option_Text}
            </a>
        ))
    );

    return (
        <div className="container boxed-container container-fluid footer-container">
            {(!loading && footer?.Footer_Column_01_Title) ? (
                <div>
                    
                    {/* ==============================================================
                        VISTA DESKTOP (ORIGINAL INTACTA)
                        Se muestra solo en pantallas grandes (lg en adelante)
                       ============================================================== */}
                    <div className="d-none d-lg-block">
                        <div className='row'>
                            <div className='col-2 footer-column'>
                                <h4>{footer.Footer_Column_01_Title}</h4>
                                {Array.isArray(footer.Footer_Column_01_Option) && footer.Footer_Column_01_Option.map(option => (
                                    <a key={option.id} className='footer-option' href={option.Option_URL}><h6>{option.Option_Text}</h6></a>
                                ))}
                            </div>
                            <div className='col-2 footer-column'>
                                <h4>{footer.Footer_Column_02_Title}</h4>
                                {Array.isArray(footer.Footer_Column_02_Option) && footer.Footer_Column_02_Option.map(option => (
                                    <a key={option.id} className='footer-option' href={option.Option_URL}><h6>{option.Option_Text}</h6></a>
                                ))}
                            </div>
                            <div className='col-2 footer-column'>
                                <h4>{footer.Footer_Column_03_Title}</h4>
                                {Array.isArray(footer.Footer_Column_03_Option) && footer.Footer_Column_03_Option.map(option => (
                                    <a key={option.id} className='footer-option' href={option.Option_URL}><h6>{option.Option_Text}</h6></a>
                                ))}
                            </div>
                            <div className='col-4 footer-column'>
                                <div>
                                    {Array.isArray(footer.Icono_Red_Social) && footer.Icono_Red_Social.map(icono => (
                                        <a key={icono.id} href={icono.Red_Social_URL}><img className='footer-icon' src={globalServerStrapi + icono.Red_Social_Icono.url} alt={icono.Red_Social_Name}></img></a>
                                    ))}
                                </div>

                                <div>
                                    {Array.isArray(footer.Footer_Logos) && footer.Footer_Logos.map(logo => (
                                        <img key={logo.id} className='footer-logo' src={globalServerStrapi + logo.url} alt="BTS"></img>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className='footer-separator'></div>
                        <div className='copyright-container'>
                            <h6>{footer.Footer_Copyright_Text}</h6>
                        </div>
                    </div>

                    {/* ==============================================================
                        VISTA MÓVIL (NUEVA - FIGMA)
                        Se muestra solo en pantallas pequeñas (menores a lg)
                       ============================================================== */}
                    <div className="d-lg-none mobile-footer-wrapper">
                        
                        {/* 1. LOGO Y TÍTULO */}
                        <div className="mobile-top-section">
                            <img src="/assets/bts_logo.png" alt="Belize Tax Service" className="mobile-top-logo" />
                            <h2 className="mobile-site-title">Belize Tax Service</h2>
                        </div>

                        {/* 2. ACORDEONES (Sin líneas separadoras) */}
                        {['01', '02', '03'].map((colNum) => (
                            <div key={colNum} className="mobile-accordion-item">
                                <div 
                                    className="mobile-accordion-header collapsed" 
                                    data-bs-toggle="collapse" 
                                    data-bs-target={`#collapseMobile${colNum}`}
                                >
                                    <span className="mobile-accordion-title">{footer[`Footer_Column_${colNum}_Title`]}</span>
                                    <span className="icon-angle-down-solid-full mobile-arrow-icon"></span>
                                </div>
                                <div className="collapse" id={`collapseMobile${colNum}`}>
                                    <div className="mobile-links-container">
                                        {renderMobileLinks(footer[`Footer_Column_${colNum}_Option`])}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* 3. SELECTOR DE IDIOMA (Centrado) */}
                        <div className="mobile-lang-section">
                            <span className="mobile-lang-label">Language Selection: </span>
                            <button className={`mobile-lang-btn ${locale === 'en' ? 'active' : ''}`} onClick={() => changeLanguage('en')}>English</button>
                            <span className="mobile-lang-divider">|</span>
                            <button className={`mobile-lang-btn ${locale === 'es' ? 'active' : ''}`} onClick={() => changeLanguage('es')}>Español</button>
                        </div>

                        {/* 4. ICONOS EN UNA SOLA LÍNEA (Nowrap) */}
                        <div className="mobile-icons-row">
                            {/* Redes Sociales */}
                            {Array.isArray(footer.Icono_Red_Social) && footer.Icono_Red_Social.map(icono => (
                                <a key={icono.id} href={icono.Red_Social_URL} className="mobile-icon-link">
                                    <img src={globalServerStrapi + icono.Red_Social_Icono.url} alt={icono.Red_Social_Name} className="mobile-social-icon" />
                                </a>
                            ))}
                            {/* Logos */}
                            {Array.isArray(footer.Footer_Logos) && footer.Footer_Logos.map(logo => (
                                <div key={logo.id} className="mobile-logo-wrapper">
                                    <img src={globalServerStrapi + logo.url} alt="Logo" className="mobile-cert-logo" />
                                </div>
                            ))}
                        </div>

                        {/* 5. COPYRIGHT */}
                        <div className="mobile-copyright">
                            <h6>{footer.Footer_Copyright_Text}</h6>
                        </div>

                    </div>

                </div>

            ) : (
                <div>Loading...</div>
            )}
        </div>
    )
};

export default Footer;