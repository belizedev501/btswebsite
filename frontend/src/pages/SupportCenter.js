import React, { useEffect, useState } from 'react';
import { GlobalContext } from '../components/Context/Context';
import { useStrapiSingle, useStrapiCollection } from '../components/Strapi/strapiCollection';
import { useContext } from 'react';
import { useMemo } from 'react';
import SupportCenterContent from '../components/SupportCenterContent/SupportCenterContent';

const SupportCenter = () => {
    const [BtsSEO, setBtsSEO] = useState({});
    const [supportCenterSEO, setSupportCenterSEO] = useState({});
    const { globalServerStrapi } = useContext(GlobalContext);

    // Google Analytics
    // const { trackPageView, trackEvent } = useGoogleAnalytics();

    // Get SEO Data for BTS
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


    // Get SEO Data for News

    const seoFilters = useMemo(
        () => ({ Page_Id: 'SupportCenter' }),
        []
    );

    const {
        data: strapiSupportCenterSEO,
        loading: strapiSupportCenterSEOLoading,
        error: strapiSupportCenterSEOError
    } = useStrapiCollection(
        'seo-pages',
        '=*',
        'id',
        'asc',
        1,
        seoFilters
    );

    useEffect(() => {
        if (strapiSupportCenterSEO) {
            setSupportCenterSEO(strapiSupportCenterSEO[0]);
        }
        if (strapiSupportCenterSEOError) {
            console.error("Error loading SEO for Support Center:", strapiSupportCenterSEOError);
        }
    }, [strapiSupportCenterSEO, strapiSupportCenterSEOLoading, strapiSupportCenterSEOError]);

    // Send pageview when loading page and SEO data
    // useEffect(() => {
    //     if (newsSEO?.metaTitle) {
    //         trackPageView(newsSEO.metaTitle, '/');
    //     }
    // }, [newsSEO?.metaTitle, trackPageView]);



    return (
        <>
            {/* React Document Metadata */}
            <title>{supportCenterSEO?.metaTitle || 'BTS - Support Center'}</title>
            <meta name="description" content={supportCenterSEO?.metaDescription || 'Default description'} />
            <meta name="keywords" content={supportCenterSEO?.metaKeywords || 'Default keywords'} />

            {/* Open Graph */}
            <meta property="og:title" content={supportCenterSEO?.metaTitle || 'Belize Tax Service'} />
            <meta property="og:description" content={supportCenterSEO?.metaDescription || 'Default description'} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={BtsSEO?.Website_Name} />
            <meta property="og:image" content={globalServerStrapi + supportCenterSEO?.ogImage?.url || '/default-og-image.jpg'} />
            <meta property="og:image:width" content={supportCenterSEO?.ogImageWidth} />
            <meta property="og:image:height" content={supportCenterSEO?.ogImageHeight} />
            <meta property="og:image:alt" content={supportCenterSEO?.ogImageAlt || 'Belize Tax Service'} />
            <meta property="og:image:type" content={supportCenterSEO?.ogImageType} />

            {/* Twitter Cards */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={supportCenterSEO?.metaTitle || 'Belize Tax Service'} />
            <meta name="twitter:description" content={supportCenterSEO?.metaDescription || 'Default description'} />
            <meta name="twitter:image" content={globalServerStrapi + supportCenterSEO?.ogImage?.url || '/default-og-image.jpg'} />

            {/* Canonical URL */}
            <link rel="canonical" href={BtsSEO?.Organization_URL} />

            {/* Schema.org JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": BtsSEO?.Organization_Name || "Belize Tax Service",
                        "url": BtsSEO?.Organization_URL,
                        "logo": globalServerStrapi + BtsSEO?.Organization_Logo?.url || "/logo.png",
                        "description": supportCenterSEO?.metaDescription || "Organization description",
                        "sameAs": BtsSEO?.Social_Networks?.map(red => red.URL).filter(url => url) || []
                    })
                }}
            />

            <div className='container boxed-container home-area'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <SupportCenterContent />
                    </div>
                </div>
            </div>
        </>
    );
};

export default SupportCenter;

