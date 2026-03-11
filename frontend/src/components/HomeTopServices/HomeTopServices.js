import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import './HomeTopServices.component.css';
import { useStrapiSingle } from '../Strapi/strapiCollection';
import { GlobalContext } from '../Context/Context';

const normalizeRelationArray = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (Array.isArray(value?.data)) {
        return value.data.map((item) => item?.attributes || item).filter(Boolean);
    }
    return [];
};

const getResourceCategories = (resource) => {
    const manyRelation = normalizeRelationArray(resource?.tax_resource_categories);
    if (manyRelation.length > 0) return manyRelation;

    const legacyManyRelation = normalizeRelationArray(resource?.Tax_Resource_Categories);
    if (legacyManyRelation.length > 0) return legacyManyRelation;

    const singleRelation = resource?.Tax_Resource_Category;
    if (singleRelation?.attributes) return [singleRelation.attributes];
    return singleRelation ? [singleRelation] : [];
};

const getGuideCategories = (guide) => {
    const manyRelation = normalizeRelationArray(guide?.tax_resource_categories);
    if (manyRelation.length > 0) return manyRelation;

    const legacyManyRelation = normalizeRelationArray(guide?.Tax_Resource_Categories);
    if (legacyManyRelation.length > 0) return legacyManyRelation;

    return [];
};

const getTutorialCategories = (tutorial) => {
    const manyRelation = normalizeRelationArray(tutorial?.Tutorial_Categories);
    if (manyRelation.length > 0) return manyRelation;

    const lowerManyRelation = normalizeRelationArray(tutorial?.tutorial_categories);
    if (lowerManyRelation.length > 0) return lowerManyRelation;

    return [];
};

const mergeUniqueById = (items) => {
    const seen = new Set();
    return items.filter((item) => {
        const key = item?.id || item?.documentId || JSON.stringify(item);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

const HomeTopServices = () => {
    const [topServices, setTopServices] = useState(null);
    const [loading, setLoading] = useState(true);
    const { globalServerStrapi } = useContext(GlobalContext);

    const {
        data: strapiTopServices,
        loading: strapiTopServicesLoading,
        error: strapiTopServicesError
    } = useStrapiSingle(
        'home-top-services',
        '[tax_resources][populate]=*&populate[guides][populate]=*&populate[tutorials][populate]=*&populate[banks][populate]=*'
    );

    useEffect(() => {
        if (strapiTopServices) setTopServices(strapiTopServices);
        setLoading(strapiTopServicesLoading);
        if (strapiTopServicesError) {
            console.error('Error fetching Home Top Services:', strapiTopServicesError);
        }
    }, [strapiTopServices, strapiTopServicesLoading, strapiTopServicesError]);

    return (
        (!loading && topServices?.Home_TS_Tax_Resources_Title) ? (
            <div className='container home-top-services-container'>
                <h5 className='home-ts-tax-first-title'>
                    {topServices.Home_TS_Tax_Resources_Title}
                </h5>

                {Array.isArray(topServices.tax_resources) && topServices.tax_resources.map((resource) => {
                    const categories = getResourceCategories(resource);
                    const categoryLabel = categories
                        .map((category) => category?.Tax_Resource_Category_Name)
                        .filter(Boolean)
                        .join(', ');

                    return (
                        <div className='row' key={resource.id}>
                            <div className='col-1 home-ts-icon-container'>
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
                                <a href={`/tax_resources/${resource.Tax_Resource_ID}`}>
                                    <h6>{categoryLabel ? `${categoryLabel} / ` : ''}{resource.Tax_Resource_Title}</h6>
                                </a>
                            </div>
                        </div>
                    );
                })}

                <div className='row' key='more-tax-resources'>
                    <div className='col-1'></div>
                    <div className='col home-ts-text-container'>
                        <a href='/tax_resources'><h6>More here...</h6></a>
                    </div>
                </div>

                <h5 className='home-ts-tax-titles'>
                    {topServices.Home_TS_Guides_Tutorials}
                </h5>

                {(() => {
                    const guidesList = mergeUniqueById([
                        ...normalizeRelationArray(topServices?.guides),
                        ...normalizeRelationArray(topServices?.guide),
                        ...normalizeRelationArray(topServices?.Guide),
                        ...normalizeRelationArray(topServices?.Guides)
                    ]);

                    const tutorialsList = mergeUniqueById([
                        ...normalizeRelationArray(topServices?.tutorials),
                        ...normalizeRelationArray(topServices?.tutorial),
                        ...normalizeRelationArray(topServices?.Tutorial),
                        ...normalizeRelationArray(topServices?.Tutorials)
                    ]);

                    return [
                        ...guidesList.map((rawGuide) => {
                            const guide = rawGuide?.attributes || rawGuide;
                            const categories = getGuideCategories(guide);
                            const categoryLabel = categories
                                .map((category) => category?.Tax_Resource_Category_Name)
                                .filter(Boolean)
                                .join(', ');

                            return {
                                id: `guide-${guide?.id || guide?.documentId || guide?.Guide_Title}`,
                                title: guide?.Guide_Title,
                                prefix: categoryLabel || 'Guide',
                                link: guide?.Guide_URL ? `/guide/${guide.Guide_URL}` : null
                            };
                        }),
                        ...tutorialsList.map((rawTutorial) => {
                            const tutorial = rawTutorial?.attributes || rawTutorial;
                            const categories = getTutorialCategories(tutorial);
                            const categoryLabel = categories
                                .map((category) => category?.Tax_Resource_Category_Name)
                                .filter(Boolean)
                                .join(', ');

                            return {
                                id: `tutorial-${tutorial?.id || tutorial?.documentId || tutorial?.Tutorial_Title}`,
                                title: tutorial?.Tutorial_Title,
                                prefix: categoryLabel || 'Tutorial',
                                link: tutorial?.Tutorial_Title ? `/tutorials?title=${encodeURIComponent(tutorial.Tutorial_Title)}` : '/tutorials'
                            };
                        })
                    ].filter((item) => item?.title).map((item) => (
                        <div className='row' key={item.id}>
                            <div className='col-1 home-ts-icon-container'>
                                <span className='icon-size_4 icon-book-solid' />
                            </div>
                            <div className='col home-ts-text-container'>
                                {item.link ? (
                                    <Link to={item.link}>
                                        <h6>{item.prefix} / {item.title}</h6>
                                    </Link>
                                ) : (
                                    <h6>{item.prefix} / {item.title}</h6>
                                )}
                            </div>
                        </div>
                    ));
                })()}

                <div className='row' key='more-GAT'>
                    <div className='col-1'></div>
                    <div className='col home-ts-text-container'>
                        <a href='/iris_belize_tutorials'><h6>More here...</h6></a>
                    </div>
                </div>

                <h5 className='home-ts-tax-titles'>
                    {topServices.Home_TS_Banks_Title}
                </h5>

                {Array.isArray(topServices.banks) && topServices.banks.map((bank) => (
                    <div className='row' key={bank.id}>
                        <div className='col home-ts-text-container text-center'>
                            {bank?.Bank_Image?.url ? (
                                <a href={bank.Bank_URL} target='_blank' rel='noopener noreferrer'>
                                    <img
                                        src={globalServerStrapi + bank.Bank_Image.url}
                                        alt={bank.Bank_Name}
                                        className='home-ts-bank-image'
                                    />
                                </a>
                            ) : (
                                <a href={bank.Bank_URL} target='_blank' rel='noopener noreferrer'>
                                    <h6>{bank.Bank_Name}</h6>
                                </a>
                            )}
                        </div>
                    </div>
                ))}

                <h5 className='home-ts-tax-titles'>
                    {topServices.Home_TS_Support_Title}
                </h5>
                <div className='row' key='more-GAT-01'>
                    <div className='col-1 home-ts-icon-container'>
                        <span className='icon-size_4 icon-envelope-solid' />
                    </div>
                    <div className='col home-ts-text-container'>
                        <a href='/support_center'><h6>{topServices.Home_TS_Support_Email_Contact_Text}</h6></a>
                    </div>
                </div>

                <h6>{topServices.Home_TS_Support_Chatbox_Text}</h6>
            </div>
        ) : (
            <p>Loading Home Top Services...</p>
        )
    );
};

export default HomeTopServices;
