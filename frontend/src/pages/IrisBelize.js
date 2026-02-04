import React, { useEffect, useMemo, useState, useContext } from 'react';
import { GlobalContext } from '../components/Context/Context';
import { useStrapiSingle, useStrapiCollection } from '../components/Strapi/strapiCollection';
import IrisBelizeCotent from '../components/IrisBelizeContent/IrisBelizeCotent';

const IrisBelize = () => {
    const [BtsSEO, setBtsSEO] = useState({});
    const [irisBelizeSEO, setIrisBelizeSEO] = useState({});
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
        () => ({ Page_Id: 'IrisBelize' }),
        []
    );

    const {
        data: strapiIrisBelizeSEO,
        loading: strapiIrisBelizeSEOLoading,
        error: strapiIrisBelizeSEOError
    } = useStrapiCollection(
        'seo-pages',
        '=*',
        'id',
        'asc',
        1,
        seoFilters
    );

    useEffect(() => {
        if (strapiIrisBelizeSEO) {
            setIrisBelizeSEO(strapiIrisBelizeSEO[0]);
        }
        if (strapiIrisBelizeSEOError) {
            console.error("Error loading SEO for IrisBelize:", strapiIrisBelizeSEOError);
        }
    }, [strapiIrisBelizeSEO, strapiIrisBelizeSEOLoading, strapiIrisBelizeSEOError]);

    return (
        <>
            <title>{irisBelizeSEO?.metaTitle || 'BTS - IRIS Belize'}</title>
            <meta name="description" content={irisBelizeSEO?.metaDescription || 'Default description'} />
            <meta name="keywords" content={irisBelizeSEO?.metaKeywords || 'Default keywords'} />

            <meta property="og:title" content={irisBelizeSEO?.metaTitle || 'Belize Tax Service'} />
            <meta property="og:description" content={irisBelizeSEO?.metaDescription || 'Default description'} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={BtsSEO?.Website_Name} />
            <meta property="og:image" content={globalServerStrapi + irisBelizeSEO?.ogImage?.url || '/default-og-image.jpg'} />
            <meta property="og:image:width" content={irisBelizeSEO?.ogImageWidth} />
            <meta property="og:image:height" content={irisBelizeSEO?.ogImageHeight} />
            <meta property="og:image:alt" content={irisBelizeSEO?.ogImageAlt || 'Belize Tax Service'} />
            <meta property="og:image:type" content={irisBelizeSEO?.ogImageType} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={irisBelizeSEO?.metaTitle || 'Belize Tax Service'} />
            <meta name="twitter:description" content={irisBelizeSEO?.metaDescription || 'Default description'} />
            <meta name="twitter:image" content={globalServerStrapi + irisBelizeSEO?.ogImage?.url || '/default-og-image.jpg'} />

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
                        "description": irisBelizeSEO?.metaDescription || "Organization description",
                        "sameAs": BtsSEO?.Social_Networks?.map(red => red.URL).filter(url => url) || []
                    })
                }}
            />

            <div className='container boxed-container home-area'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <IrisBelizeCotent />
                    </div>
                </div>
            </div>
        </>
    );
};

export default IrisBelize;
