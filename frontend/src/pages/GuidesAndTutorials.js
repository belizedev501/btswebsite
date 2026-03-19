import React, { useContext, useEffect, useMemo, useState } from 'react';
import { GlobalContext } from '../components/Context/Context';
import { useStrapiCollection, useStrapiSingle } from '../components/Strapi/strapiCollection';
import GuidesAndTutorialsContent from '../components/GuidesAndTutorialsContent/GuidesAndTutorialsContent';

const GuidesAndTutorials = () => {
    const [BtsSEO, setBtsSEO] = useState({});
    const [guidesAndTutorialsSEO, setGuidesAndTutorialsSEO] = useState({});
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
        () => ({ Page_Id: 'GuidesAndTutorials' }),
        []
    );

    const {
        data: strapiGuidesAndTutorialsSEO,
        loading: strapiGuidesAndTutorialsSEOLoading,
        error: strapiGuidesAndTutorialsSEOError
    } = useStrapiCollection(
        'seo-pages',
        '=*',
        'id',
        'asc',
        1,
        seoFilters
    );

    useEffect(() => {
        if (strapiGuidesAndTutorialsSEO) {
            setGuidesAndTutorialsSEO(strapiGuidesAndTutorialsSEO[0]);
        }
        if (strapiGuidesAndTutorialsSEOError) {
            console.error("Error loading SEO for Guides and Tutorials:", strapiGuidesAndTutorialsSEOError);
        }
    }, [strapiGuidesAndTutorialsSEO, strapiGuidesAndTutorialsSEOLoading, strapiGuidesAndTutorialsSEOError]);

    return (
        <>
            <title>{guidesAndTutorialsSEO?.metaTitle || 'Belize Tax Service - Guides and Tutorials page'}</title>
            <meta name="description" content={guidesAndTutorialsSEO?.metaDescription || 'Default description'} />
            <meta name="keywords" content={guidesAndTutorialsSEO?.metaKeywords || 'Default keywords'} />

            <meta property="og:title" content={guidesAndTutorialsSEO?.metaTitle || 'Belize Tax Service'} />
            <meta property="og:description" content={guidesAndTutorialsSEO?.metaDescription || 'Default description'} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={BtsSEO?.Website_Name} />
            <meta property="og:image" content={globalServerStrapi + guidesAndTutorialsSEO?.ogImage?.url || '/default-og-image.jpg'} />
            <meta property="og:image:width" content={guidesAndTutorialsSEO?.ogImageWidth} />
            <meta property="og:image:height" content={guidesAndTutorialsSEO?.ogImageHeight} />
            <meta property="og:image:alt" content={guidesAndTutorialsSEO?.ogImageAlt || 'Belize Tax Service'} />
            <meta property="og:image:type" content={guidesAndTutorialsSEO?.ogImageType} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={guidesAndTutorialsSEO?.metaTitle || 'Belize Tax Service'} />
            <meta name="twitter:description" content={guidesAndTutorialsSEO?.metaDescription || 'Default description'} />
            <meta name="twitter:image" content={globalServerStrapi + guidesAndTutorialsSEO?.ogImage?.url || '/default-og-image.jpg'} />

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
                        "description": guidesAndTutorialsSEO?.metaDescription || "Organization description",
                        "sameAs": BtsSEO?.Social_Networks?.map(red => red.URL).filter(url => url) || []
                    })
                }}
            />

            <div className='container boxed-container home-area'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <GuidesAndTutorialsContent />
                    </div>
                </div>
            </div>
        </>
    );
};

export default GuidesAndTutorials;
