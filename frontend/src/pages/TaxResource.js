import React, { useContext, useEffect, useMemo, useState } from 'react';
import { GlobalContext } from '../components/Context/Context';
import { useStrapiCollection, useStrapiSingle } from '../components/Strapi/strapiCollection';
import TaxResourceDetail from '../components/TaxResourceDetail/TaxResourceDetail';

const TaxResource = () => {
    const [BtsSEO, setBtsSEO] = useState({});
    const [taxResourceSEO, setTaxResourceSEO] = useState({});
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
        () => ({ Page_Id: 'TaxResource' }),
        []
    );

    const {
        data: strapiTaxResourceSEO,
        loading: strapiTaxResourceSEOLoading,
        error: strapiTaxResourceSEOError
    } = useStrapiCollection(
        'seo-pages',
        '=*',
        'id',
        'asc',
        1,
        seoFilters
    );

    useEffect(() => {
        if (strapiTaxResourceSEO) {
            setTaxResourceSEO(strapiTaxResourceSEO[0]);
        }
        if (strapiTaxResourceSEOError) {
            console.error("Error loading SEO for Tax Resource:", strapiTaxResourceSEOError);
        }
    }, [strapiTaxResourceSEO, strapiTaxResourceSEOLoading, strapiTaxResourceSEOError]);

    return (
        <>
            <title>{taxResourceSEO?.metaTitle || 'Belize Tax Service - Tax Resource page'}</title>
            <meta name="description" content={taxResourceSEO?.metaDescription || 'Default description'} />
            <meta name="keywords" content={taxResourceSEO?.metaKeywords || 'Default keywords'} />

            <meta property="og:title" content={taxResourceSEO?.metaTitle || 'Belize Tax Service'} />
            <meta property="og:description" content={taxResourceSEO?.metaDescription || 'Default description'} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={BtsSEO?.Website_Name} />
            <meta property="og:image" content={globalServerStrapi + taxResourceSEO?.ogImage?.url || '/default-og-image.jpg'} />
            <meta property="og:image:width" content={taxResourceSEO?.ogImageWidth} />
            <meta property="og:image:height" content={taxResourceSEO?.ogImageHeight} />
            <meta property="og:image:alt" content={taxResourceSEO?.ogImageAlt || 'Belize Tax Service'} />
            <meta property="og:image:type" content={taxResourceSEO?.ogImageType} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={taxResourceSEO?.metaTitle || 'Belize Tax Service'} />
            <meta name="twitter:description" content={taxResourceSEO?.metaDescription || 'Default description'} />
            <meta name="twitter:image" content={globalServerStrapi + taxResourceSEO?.ogImage?.url || '/default-og-image.jpg'} />

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
                        "description": taxResourceSEO?.metaDescription || "Organization description",
                        "sameAs": BtsSEO?.Social_Networks?.map(red => red.URL).filter(url => url) || []
                    })
                }}
            />

            <div className='container boxed-container home-area'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <TaxResourceDetail />
                    </div>
                </div>
            </div>
        </>
    );
};

export default TaxResource;
