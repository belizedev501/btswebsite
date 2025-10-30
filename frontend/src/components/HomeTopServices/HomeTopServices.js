import React, { useEffect, useState, useContext} from 'react';
import './HomeTopServices.component.css';
import { useStrapiSingle } from '../Strapi/strapiCollection';
import { GlobalContext } from '../Context/Context'; // ⬅️ importar contexto

const HomeTopServices = () => {
    const [topServices, setTopServices] = useState(null);
    const [loading, setLoading] = useState(true);
    const { globalServerStrapi } = useContext(GlobalContext);

    // ✅ Poblar relaciones anidadas explícitamente
    const {
        data: strapiTopServices,
        loading: strapiTopServicesLoading,
        error: strapiTopServicesError
    } = useStrapiSingle(
        `home-top-services`,
        `[tax_resources]=true&populate[guides_and_tutorials]=true&populate[banks][populate]=Bank_Image`
    );

    useEffect(() => {
        if (strapiTopServices) setTopServices(strapiTopServices);
        setLoading(strapiTopServicesLoading);
        if (strapiTopServicesError) {
            console.error("Error fetching Home Top Services:", strapiTopServicesError);
        }
    }, [strapiTopServices, strapiTopServicesLoading, strapiTopServicesError]);

    return (
        (!loading && topServices?.Home_TS_Tax_Resources_Title) ? (
            <div className='home-top-services-container'>
                {/* ===================== TAX RESOURCES ===================== */}
                <h5 className='home-ts-tax-titles'>
                    {topServices.Home_TS_Tax_Resources_Title}
                </h5>

                {Array.isArray(topServices.tax_resources) && topServices.tax_resources.map(resource => (
                    <div className='row' key={resource.id}>
                        <div className="col-1 home-ts-icon-container">
                            {(resource.Tax_Resource_Type === 'Forms & Downloads') ? (
                                <span className='icon-size_4 icon-clipboard-list-solid' />
                            ) : (resource.Tax_Resource_Type === 'Publication') ? (
                                <span className='icon-size_4 icon-newspaper-solid' />
                            ) : (resource.Tax_Resource_Type === 'Legal') ? (
                                <span className='icon-size_4 icon-scale-balanced-solid' />
                            ) : (resource.Tax_Resource_Type === 'Guidelines') ? (
                                <span className='icon-size_4 icon-list-check-solid' />
                            ) : (
                                <span className='icon-size_4 icon-book-solid' />
                            )}
                        </div>
                        <div className='col home-ts-text-container'>
                            <a href={'/resources/' + resource.Tax_Resource_ID}>
                                <h6>{resource.Tax_Resource_Theme} / {resource.Tax_Resource_Title}</h6>
                            </a>
                        </div>
                    </div>
                ))}

                <div className='row' key='more-tax-resources'>
                    <div className="col-1"></div>
                    <div className="col home-ts-text-container">
                        <a href='/resources'><h6>More here...</h6></a>
                    </div>
                </div>

                {/* ===================== GUIDES & TUTORIALS ===================== */}
                <h5 className='home-ts-tax-titles'>
                    {topServices.Home_TS_Guides_Tutorials}
                </h5>

                {Array.isArray(topServices.guides_and_tutorials) && topServices.guides_and_tutorials.map(gat => (
                    <div className='row' key={gat.id}>
                        <div className="col-1 home-ts-icon-container">
                            {(gat.GAT_Type === 'Forms & Downloads') ? (
                                <span className='icon-size_4 icon-clipboard-list-solid' />
                            ) : (gat.GAT_Type === 'Publication') ? (
                                <span className='icon-size_4 icon-newspaper-solid' />
                            ) : (gat.GAT_Type === 'Legal') ? (
                                <span className='icon-size_4 icon-scale-balanced-solid' />
                            ) : (gat.GAT_Type === 'Guidelines') ? (
                                <span className='icon-size_4 icon-list-check-solid' />
                            ) : (
                                <span className='icon-size_4 icon-book-solid' />
                            )}
                        </div>
                        <div className='col home-ts-text-container'>
                            <a href={'/gat/' + gat.GAT_ID}>
                                <h6>{gat.GAT_Theme} / {gat.GAT_Title}</h6>
                            </a>
                        </div>
                    </div>
                ))}

                <div className='row' key='more-GAT'>
                    <div className="col-1"></div>
                    <div className="col home-ts-text-container">
                        <a href='/gat'><h6>More here...</h6></a>
                    </div>
                </div>

                {/* ===================== BANKS ===================== */}
                <h5 className='home-ts-tax-titles'>
                    {topServices.Home_TS_Banks_Title}
                </h5>

                {Array.isArray(topServices.banks) && topServices.banks.map(bank => (
                    <div className='row' key={bank.id}>
                        <div className='col home-ts-text-container text-center'>
                            {bank?.Bank_Image?.url ? (
                                <a href={bank.Bank_URL} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={globalServerStrapi + bank.Bank_Image.url}
                                        alt={bank.Bank_Name}
                                        className='home-ts-bank-image'
                                    />
                                </a>
                            ) : (
                                <a href={bank.Bank_URL} target="_blank" rel="noopener noreferrer">
                                    <h6>{bank.Bank_Name}</h6>
                                </a>
                            )}
                        </div>
                    </div>
                ))}

                {/* ===================== SUPPORT ===================== */}
                <h5 className='home-ts-tax-titles'>
                    {topServices.Home_TS_Support_Title}
                </h5>
                <div className='row' key='more-GAT'>
                    <div className="col-1 home-ts-icon-container">
                        <span className='icon-size_4 icon-envelope-solid' />
                    </div>
                    <div className="col home-ts-text-container">
                        <a href='/gat'><h6>{topServices.Home_TS_Support_Email_Contact_Text}</h6></a>
                    </div>
                </div>

                <h6>Or Chat with Us Now...</h6>
            </div>
        ) : (
            <p>Loading Home Top Services...</p>
        )
    );
};

export default HomeTopServices;
