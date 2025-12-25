import React, { useEffect, useState } from 'react';
import { GlobalContext } from '../components/Context/Context';
import { useStrapiSingle, useStrapiCollection } from '../components/Strapi/strapiCollection';
import { useContext } from 'react';
import NewsDetail from '../components/NewsDetail/NewsDetail';
import HomeHero from '../components/HomeHero/HomeHero';
import TaxCalculator from '../components/TaxCalculator/TaxCalculator';
import TaxCalendar from '../components/TaxCalendar/TaxCalendar';
import { useMemo } from 'react';

const NewsDetails = () => {
    const [BtsSEO, setBtsSEO] = useState({});
    const [newsDetailsSEO, setNewsDetailsSEO] = useState({});
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
        () => ({ Page_Id: 'NewsDetails' }),
        []
    );

    const {
        data: strapiNewsDetailsSEO,
        loading: strapiNewsDetailsSEOLoading,
        error: strapiNewsDetailsSEOError
    } = useStrapiCollection(
        'seo-pages',
        '=*',
        'id',
        'asc',
        1,
        seoFilters
    );

    useEffect(() => {
        if (strapiNewsDetailsSEO) {
            setNewsDetailsSEO(strapiNewsDetailsSEO[0]);
        }
        if (strapiNewsDetailsSEOError) {
            console.error("Error loading SEO for News:", strapiNewsDetailsSEOError);
        }
    }, [strapiNewsDetailsSEO, strapiNewsDetailsSEOLoading, strapiNewsDetailsSEOError]);

    return (
        <>
            {/* React Document Metadata */}
            <title>{newsDetailsSEO?.metaTitle || 'Belize Tax Service - News Search page'}</title>
            <meta name="description" content={newsDetailsSEO?.metaDescription || 'Default description'} />
            <meta name="keywords" content={newsDetailsSEO?.metaKeywords || 'Default keywords'} />

            {/* Open Graph */}
            <meta property="og:title" content={newsDetailsSEO?.metaTitle || 'Belize Tax Service'} />
            <meta property="og:description" content={newsDetailsSEO?.metaDescription || 'Default description'} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={BtsSEO?.Nombre_Website} />
            <meta property="og:image" content={globalServerStrapi + newsDetailsSEO?.ogImage?.url || '/default-og-image.jpg'} />
            <meta property="og:image:width" content={newsDetailsSEO?.ogImageWidth} />
            <meta property="og:image:height" content={newsDetailsSEO?.ogImageHeight} />
            <meta property="og:image:alt" content={newsDetailsSEO?.ogImageAlt || 'Belize Tax Service'} />
            <meta property="og:image:type" content={newsDetailsSEO?.ogImageType} />

            {/* Twitter Cards */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={newsDetailsSEO?.metaTitle || 'Belize Tax Service'} />
            <meta name="twitter:description" content={newsDetailsSEO?.metaDescription || 'Default description'} />
            <meta name="twitter:image" content={globalServerStrapi + newsDetailsSEO?.ogImage?.url || '/default-og-image.jpg'} />

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
                        "logo": globalServerStrapi + BtsSEO?.logo?.url || "/logo.png",
                        "description": BtsSEO?.metaDescription || "Organization description",
                        "sameAs": BtsSEO?.Social_Networks?.map(red => red.URL).filter(url => url) || []
                    })
                }}
            />

            <div className='container boxed-container home-area'>
                <div className='row'>
                    <div className='col-lg-3'>
                        <HomeHero />
                        <TaxCalculator />
                        <TaxCalendar />
                    </div>
                    <div className='col-lg-9 home-news-left-bordered' >
                        <NewsDetail />
                    </div>
                </div>
            </div>
        </>
    );
};

export default NewsDetails;

