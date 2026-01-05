import React, { useEffect, useState, useContext } from 'react';
import './Footer.component.css';
import { useStrapiSingle } from '../Strapi/strapiCollection';
import { GlobalContext } from '../Context/Context'; // ⬅️ importar contexto

const Footer = () => {
    const [footer, setFooter] = useState(null);
    const [loading, setLoading] = useState(true);
    const { globalServerStrapi } = useContext(GlobalContext);
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

    return (
        <div className="container boxed-container container-fluid footer-container">
            {(!loading && footer?.Footer_Column_01_Title) ? (
                <div>
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
                    <div className='footer-separator'>
                    </div>
                    <div className='copyright-container'>
                        <h6>{footer.Footer_Copyright_Text}</h6>
                    </div>
                </div>

            ) : (
                <div>Loading...</div>
            )}
        </div>
    )
};

export default Footer;