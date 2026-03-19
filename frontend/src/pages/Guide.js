import React, { useContext, useEffect, useMemo, useState } from 'react';
import { GlobalContext } from '../components/Context/Context';
import { useStrapiCollection, useStrapiSingle } from '../components/Strapi/strapiCollection';
import GuideDetails from '../components/GuideDetails/GuideDetails';

const Guide = () => {
    const [BtsSEO, setBtsSEO] = useState({});
    const [guideSEO, setGuideSEO] = useState({});
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
        () => ({ Page_Id: 'Guide' }),
        []
    );

    const {
        data: strapiGuideSEO,
        loading: strapiGuideSEOLoading,
        error: strapiGuideSEOError
    } = useStrapiCollection(
        'seo-pages',
        '=*',
        'id',
        'asc',
        1,
        seoFilters
    );

    useEffect(() => {
        if (strapiGuideSEO) {
            setGuideSEO(strapiGuideSEO[0]);
        }
        if (strapiGuideSEOError) {
            console.error("Error loading SEO for Guide:", strapiGuideSEOError);
        }
    }, [strapiGuideSEO, strapiGuideSEOLoading, strapiGuideSEOError]);

    return (
        <>
            <title>{guideSEO?.metaTitle || 'Belize Tax Service - Guide page'}</title>
            <meta name="description" content={guideSEO?.metaDescription || 'Default description'} />
            <meta name="keywords" content={guideSEO?.metaKeywords || 'Default keywords'} />

            <meta property="og:title" content={guideSEO?.metaTitle || 'Belize Tax Service'} />
            <meta property="og:description" content={guideSEO?.metaDescription || 'Default description'} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={BtsSEO?.Website_Name} />
            <meta property="og:image" content={globalServerStrapi + guideSEO?.ogImage?.url || '/default-og-image.jpg'} />
            <meta property="og:image:width" content={guideSEO?.ogImageWidth} />
            <meta property="og:image:height" content={guideSEO?.ogImageHeight} />
            <meta property="og:image:alt" content={guideSEO?.ogImageAlt || 'Belize Tax Service'} />
            <meta property="og:image:type" content={guideSEO?.ogImageType} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={guideSEO?.metaTitle || 'Belize Tax Service'} />
            <meta name="twitter:description" content={guideSEO?.metaDescription || 'Default description'} />
            <meta name="twitter:image" content={globalServerStrapi + guideSEO?.ogImage?.url || '/default-og-image.jpg'} />

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
                        "description": guideSEO?.metaDescription || "Organization description",
                        "sameAs": BtsSEO?.Social_Networks?.map(red => red.URL).filter(url => url) || []
                    })
                }}
            />

            <div className='container boxed-container home-area'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <GuideDetails />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Guide;
