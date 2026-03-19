import React, { useContext, useEffect, useMemo, useState } from 'react';
import { GlobalContext } from '../components/Context/Context';
import { useStrapiCollection, useStrapiSingle } from '../components/Strapi/strapiCollection';
import TutorialSearch from '../components/TutorialsSearch/TutorialSearch';

const Tutorials = () => {
    const [BtsSEO, setBtsSEO] = useState({});
    const [tutorialsSEO, setTutorialsSEO] = useState({});
    const { globalServerStrapi } = useContext(GlobalContext);

    const {
        data: strapiBtsSEO,
        loading: strapiBtsSEOLoading,
        error: strapiBtsSEOError
    } = useStrapiSingle('seo-bts');

    useEffect(() => {
        if (strapiBtsSEO) {
            setBtsSEO(strapiBtsSEO);
        }
        if (strapiBtsSEOError) {
            console.error("Error loading SEO Bts:", strapiBtsSEOError);
        }
    }, [strapiBtsSEO, strapiBtsSEOLoading, strapiBtsSEOError]);

    const seoFilters = useMemo(
        () => ({ Page_Id: 'Tutorials' }),
        []
    );

    const {
        data: strapiTutorialsSEO,
        loading: strapiTutorialsSEOLoading,
        error: strapiTutorialsSEOError
    } = useStrapiCollection(
        'seo-pages',
        '=*',
        'id',
        'asc',
        1,
        seoFilters
    );

    useEffect(() => {
        if (strapiTutorialsSEO) {
            setTutorialsSEO(strapiTutorialsSEO[0]);
        }
        if (strapiTutorialsSEOError) {
            console.error("Error loading SEO for Tutorials:", strapiTutorialsSEOError);
        }
    }, [strapiTutorialsSEO, strapiTutorialsSEOLoading, strapiTutorialsSEOError]);

    return (
        <>
            <title>{tutorialsSEO?.metaTitle || 'Belize Tax Service - Tutorials page'}</title>
            <meta name="description" content={tutorialsSEO?.metaDescription || 'Default description'} />
            <meta name="keywords" content={tutorialsSEO?.metaKeywords || 'Default keywords'} />

            <meta property="og:title" content={tutorialsSEO?.metaTitle || 'Belize Tax Service'} />
            <meta property="og:description" content={tutorialsSEO?.metaDescription || 'Default description'} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={BtsSEO?.Website_Name} />
            <meta property="og:image" content={globalServerStrapi + tutorialsSEO?.ogImage?.url || '/default-og-image.jpg'} />
            <meta property="og:image:width" content={tutorialsSEO?.ogImageWidth} />
            <meta property="og:image:height" content={tutorialsSEO?.ogImageHeight} />
            <meta property="og:image:alt" content={tutorialsSEO?.ogImageAlt || 'Belize Tax Service'} />
            <meta property="og:image:type" content={tutorialsSEO?.ogImageType} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={tutorialsSEO?.metaTitle || 'Belize Tax Service'} />
            <meta name="twitter:description" content={tutorialsSEO?.metaDescription || 'Default description'} />
            <meta name="twitter:image" content={globalServerStrapi + tutorialsSEO?.ogImage?.url || '/default-og-image.jpg'} />

            <link rel="canonical" href={BtsSEO?.Organization_URL} />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": BtsSEO?.Organization_Name || "Belize Tax Service",
                        "url": BtsSEO?.Organization_URL,
                        "logo": globalServerStrapi + BtsSEO?.Organization_Logo?.url || "/logo.png",
                        "description": tutorialsSEO?.metaDescription || "Organization description",
                        "sameAs": BtsSEO?.Social_Networks?.map(red => red.URL).filter(url => url) || []
                    })
                }}
            />

            <div className='container boxed-container home-area'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <TutorialSearch />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Tutorials;
