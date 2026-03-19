import React, { useContext, useEffect, useMemo, useState } from 'react';
import { GlobalContext } from '../components/Context/Context';
import { useStrapiCollection, useStrapiSingle } from '../components/Strapi/strapiCollection';
import IrisBelizeTutorialsContent from '../components/IrisBelizeTutorialsContent/IrisBelizeTutorialsContent';

const IrisBelizeTutorials = () => {
    const [BtsSEO, setBtsSEO] = useState({});
    const [irisBelizeTutorialsSEO, setIrisBelizeTutorialsSEO] = useState({});
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
        () => ({ Page_Id: 'IrisBelizeTutorials' }),
        []
    );

    const {
        data: strapiIrisBelizeTutorialsSEO,
        loading: strapiIrisBelizeTutorialsSEOLoading,
        error: strapiIrisBelizeTutorialsSEOError
    } = useStrapiCollection(
        'seo-pages',
        '=*',
        'id',
        'asc',
        1,
        seoFilters
    );

    useEffect(() => {
        if (strapiIrisBelizeTutorialsSEO) {
            setIrisBelizeTutorialsSEO(strapiIrisBelizeTutorialsSEO[0]);
        }
        if (strapiIrisBelizeTutorialsSEOError) {
            console.error("Error loading SEO for IRIS Belize Tutorials:", strapiIrisBelizeTutorialsSEOError);
        }
    }, [strapiIrisBelizeTutorialsSEO, strapiIrisBelizeTutorialsSEOLoading, strapiIrisBelizeTutorialsSEOError]);

    return (
        <>
            <title>{irisBelizeTutorialsSEO?.metaTitle || 'Belize Tax Service - IRIS Belize Tutorials page'}</title>
            <meta name="description" content={irisBelizeTutorialsSEO?.metaDescription || 'Default description'} />
            <meta name="keywords" content={irisBelizeTutorialsSEO?.metaKeywords || 'Default keywords'} />

            <meta property="og:title" content={irisBelizeTutorialsSEO?.metaTitle || 'Belize Tax Service'} />
            <meta property="og:description" content={irisBelizeTutorialsSEO?.metaDescription || 'Default description'} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={BtsSEO?.Website_Name} />
            <meta property="og:image" content={globalServerStrapi + irisBelizeTutorialsSEO?.ogImage?.url || '/default-og-image.jpg'} />
            <meta property="og:image:width" content={irisBelizeTutorialsSEO?.ogImageWidth} />
            <meta property="og:image:height" content={irisBelizeTutorialsSEO?.ogImageHeight} />
            <meta property="og:image:alt" content={irisBelizeTutorialsSEO?.ogImageAlt || 'Belize Tax Service'} />
            <meta property="og:image:type" content={irisBelizeTutorialsSEO?.ogImageType} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={irisBelizeTutorialsSEO?.metaTitle || 'Belize Tax Service'} />
            <meta name="twitter:description" content={irisBelizeTutorialsSEO?.metaDescription || 'Default description'} />
            <meta name="twitter:image" content={globalServerStrapi + irisBelizeTutorialsSEO?.ogImage?.url || '/default-og-image.jpg'} />

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
                        "description": irisBelizeTutorialsSEO?.metaDescription || "Organization description",
                        "sameAs": BtsSEO?.Social_Networks?.map(red => red.URL).filter(url => url) || []
                    })
                }}
            />

            <div className='container boxed-container home-area'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <IrisBelizeTutorialsContent />
                    </div>
                </div>
            </div>
        </>
    );
};

export default IrisBelizeTutorials;
