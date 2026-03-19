import React, { useContext, useEffect, useMemo, useState } from 'react';
import { GlobalContext } from '../components/Context/Context';
import { useStrapiCollection, useStrapiSingle } from '../components/Strapi/strapiCollection';
import TaxResourcesContent from '../components/TaxResourcesContent/TaxResourcesContent';

const TaxResources = () => {
    const [BtsSEO, setBtsSEO] = useState({});
    const [taxResourcesSEO, setTaxResourcesSEO] = useState({});
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
        () => ({ Page_Id: 'TaxResources' }),
        []
    );

    const {
        data: strapiTaxResourcesSEO,
        loading: strapiTaxResourcesSEOLoading,
        error: strapiTaxResourcesSEOError
    } = useStrapiCollection(
        'seo-pages',
        '=*',
        'id',
        'asc',
        1,
        seoFilters
    );

    useEffect(() => {
        if (strapiTaxResourcesSEO) {
            setTaxResourcesSEO(strapiTaxResourcesSEO[0]);
        }
        if (strapiTaxResourcesSEOError) {
            console.error("Error loading SEO for Tax Resources:", strapiTaxResourcesSEOError);
        }
    }, [strapiTaxResourcesSEO, strapiTaxResourcesSEOLoading, strapiTaxResourcesSEOError]);

    return (
        <>
            <title>{taxResourcesSEO?.metaTitle || 'Belize Tax Service - Tax Resources page'}</title>
            <meta name="description" content={taxResourcesSEO?.metaDescription || 'Default description'} />
            <meta name="keywords" content={taxResourcesSEO?.metaKeywords || 'Default keywords'} />

            <meta property="og:title" content={taxResourcesSEO?.metaTitle || 'Belize Tax Service'} />
            <meta property="og:description" content={taxResourcesSEO?.metaDescription || 'Default description'} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={BtsSEO?.Website_Name} />
            <meta property="og:image" content={globalServerStrapi + taxResourcesSEO?.ogImage?.url || '/default-og-image.jpg'} />
            <meta property="og:image:width" content={taxResourcesSEO?.ogImageWidth} />
            <meta property="og:image:height" content={taxResourcesSEO?.ogImageHeight} />
            <meta property="og:image:alt" content={taxResourcesSEO?.ogImageAlt || 'Belize Tax Service'} />
            <meta property="og:image:type" content={taxResourcesSEO?.ogImageType} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={taxResourcesSEO?.metaTitle || 'Belize Tax Service'} />
            <meta name="twitter:description" content={taxResourcesSEO?.metaDescription || 'Default description'} />
            <meta name="twitter:image" content={globalServerStrapi + taxResourcesSEO?.ogImage?.url || '/default-og-image.jpg'} />

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
                        "description": taxResourcesSEO?.metaDescription || "Organization description",
                        "sameAs": BtsSEO?.Social_Networks?.map(red => red.URL).filter(url => url) || []
                    })
                }}
            />

            <div className='container boxed-container home-area'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <TaxResourcesContent />
                    </div>
                </div>
            </div>
        </>
    );
};

export default TaxResources;
