import React, { useContext, useEffect, useMemo, useState } from 'react';
import { GlobalContext } from '../components/Context/Context';
import { useStrapiCollection, useStrapiSingle } from '../components/Strapi/strapiCollection';
import TaxResourcesCategoryContent from '../components/TaxResourcesCategoryContent/TaxResourcesCategoryContent';

const TaxResourcesCategory = () => {
    const [BtsSEO, setBtsSEO] = useState({});
    const [taxResourcesCategorySEO, setTaxResourcesCategorySEO] = useState({});
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
        () => ({ Page_Id: 'TaxResourcesCategory' }),
        []
    );

    const {
        data: strapiTaxResourcesCategorySEO,
        loading: strapiTaxResourcesCategorySEOLoading,
        error: strapiTaxResourcesCategorySEOError
    } = useStrapiCollection(
        'seo-pages',
        '=*',
        'id',
        'asc',
        1,
        seoFilters
    );

    useEffect(() => {
        if (strapiTaxResourcesCategorySEO) {
            setTaxResourcesCategorySEO(strapiTaxResourcesCategorySEO[0]);
        }
        if (strapiTaxResourcesCategorySEOError) {
            console.error("Error loading SEO for Tax Resources Category:", strapiTaxResourcesCategorySEOError);
        }
    }, [strapiTaxResourcesCategorySEO, strapiTaxResourcesCategorySEOLoading, strapiTaxResourcesCategorySEOError]);

    return (
        <>
            <title>{taxResourcesCategorySEO?.metaTitle || 'Belize Tax Service - Tax Resources Category page'}</title>
            <meta name="description" content={taxResourcesCategorySEO?.metaDescription || 'Default description'} />
            <meta name="keywords" content={taxResourcesCategorySEO?.metaKeywords || 'Default keywords'} />

            <meta property="og:title" content={taxResourcesCategorySEO?.metaTitle || 'Belize Tax Service'} />
            <meta property="og:description" content={taxResourcesCategorySEO?.metaDescription || 'Default description'} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={BtsSEO?.Website_Name} />
            <meta property="og:image" content={globalServerStrapi + taxResourcesCategorySEO?.ogImage?.url || '/default-og-image.jpg'} />
            <meta property="og:image:width" content={taxResourcesCategorySEO?.ogImageWidth} />
            <meta property="og:image:height" content={taxResourcesCategorySEO?.ogImageHeight} />
            <meta property="og:image:alt" content={taxResourcesCategorySEO?.ogImageAlt || 'Belize Tax Service'} />
            <meta property="og:image:type" content={taxResourcesCategorySEO?.ogImageType} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={taxResourcesCategorySEO?.metaTitle || 'Belize Tax Service'} />
            <meta name="twitter:description" content={taxResourcesCategorySEO?.metaDescription || 'Default description'} />
            <meta name="twitter:image" content={globalServerStrapi + taxResourcesCategorySEO?.ogImage?.url || '/default-og-image.jpg'} />

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
                        "description": taxResourcesCategorySEO?.metaDescription || "Organization description",
                        "sameAs": BtsSEO?.Social_Networks?.map(red => red.URL).filter(url => url) || []
                    })
                }}
            />

            <div className='container boxed-container home-area'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <TaxResourcesCategoryContent />
                    </div>
                </div>
            </div>
        </>
    );
};

export default TaxResourcesCategory;
