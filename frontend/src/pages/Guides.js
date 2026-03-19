import React, { useContext, useEffect, useMemo, useState } from 'react';
import { GlobalContext } from '../components/Context/Context';
import { useStrapiCollection, useStrapiSingle } from '../components/Strapi/strapiCollection';
import GuideSearch from '../components/GuideSearch/GuideSearch';

const Guides = () => {
    const [BtsSEO, setBtsSEO] = useState({});
    const [guidesSEO, setGuidesSEO] = useState({});
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
        () => ({ Page_Id: 'Guides' }),
        []
    );

    const {
        data: strapiGuidesSEO,
        loading: strapiGuidesSEOLoading,
        error: strapiGuidesSEOError
    } = useStrapiCollection(
        'seo-pages',
        '=*',
        'id',
        'asc',
        1,
        seoFilters
    );

    useEffect(() => {
        if (strapiGuidesSEO) {
            setGuidesSEO(strapiGuidesSEO[0]);
        }
        if (strapiGuidesSEOError) {
            console.error("Error loading SEO for Guides:", strapiGuidesSEOError);
        }
    }, [strapiGuidesSEO, strapiGuidesSEOLoading, strapiGuidesSEOError]);

    return (
        <>
            <title>{guidesSEO?.metaTitle || 'Belize Tax Service - Guides page'}</title>
            <meta name="description" content={guidesSEO?.metaDescription || 'Default description'} />
            <meta name="keywords" content={guidesSEO?.metaKeywords || 'Default keywords'} />

            <meta property="og:title" content={guidesSEO?.metaTitle || 'Belize Tax Service'} />
            <meta property="og:description" content={guidesSEO?.metaDescription || 'Default description'} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={BtsSEO?.Website_Name} />
            <meta property="og:image" content={globalServerStrapi + guidesSEO?.ogImage?.url || '/default-og-image.jpg'} />
            <meta property="og:image:width" content={guidesSEO?.ogImageWidth} />
            <meta property="og:image:height" content={guidesSEO?.ogImageHeight} />
            <meta property="og:image:alt" content={guidesSEO?.ogImageAlt || 'Belize Tax Service'} />
            <meta property="og:image:type" content={guidesSEO?.ogImageType} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={guidesSEO?.metaTitle || 'Belize Tax Service'} />
            <meta name="twitter:description" content={guidesSEO?.metaDescription || 'Default description'} />
            <meta name="twitter:image" content={globalServerStrapi + guidesSEO?.ogImage?.url || '/default-og-image.jpg'} />

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
                        "description": guidesSEO?.metaDescription || "Organization description",
                        "sameAs": BtsSEO?.Social_Networks?.map(red => red.URL).filter(url => url) || []
                    })
                }}
            />

            <div className='container boxed-container home-area'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <GuideSearch />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Guides;
