import React, { useEffect, useState } from 'react';
import { GlobalContext } from '../components/Context/Context';
import { useStrapiSingle, useStrapiCollection } from '../components/Strapi/strapiCollection';
import { useContext } from 'react';
import HomeAboutUs from '../components/HomeAboutUs/HomeAboutUs';
import { useMemo } from 'react';

const AboutUs = () => {
    const [BtsSEO, setBtsSEO] = useState({});
    const [newsSEO, setNewsSEO] = useState({});
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
        () => ({ Page_Id: 'News' }),
        []
    );

    const {
        data: strapiNewsSEO,
        loading: strapiNewsSEOLoading,
        error: strapiNewsSEOError
    } = useStrapiCollection(
        'seo-pages',
        '=*',
        'id',
        'asc',
        1,
        seoFilters
    );

    useEffect(() => {
        if (strapiNewsSEO) {
            setNewsSEO(strapiNewsSEO[0]);
        }
        if (strapiNewsSEOError) {
            console.error("Error loading SEO for News:", strapiNewsSEOError);
        }
    }, [strapiNewsSEO, strapiNewsSEOLoading, strapiNewsSEOError]);

    // Send pageview when loading page and SEO data
    // useEffect(() => {
    //     if (newsSEO?.metaTitle) {
    //         trackPageView(newsSEO.metaTitle, '/');
    //     }
    // }, [newsSEO?.metaTitle, trackPageView]);



    return (
        <>
            {/* React Document Metadata */}
            <title>{newsSEO?.metaTitle || 'Belize Tax Service - News Search page'}</title>
            <meta name="description" content={newsSEO?.metaDescription || 'Default description'} />
            <meta name="keywords" content={newsSEO?.metaKeywords || 'Default keywords'} />

            {/* Open Graph */}
            <meta property="og:title" content={newsSEO?.metaTitle || 'Belize Tax Service'} />
            <meta property="og:description" content={newsSEO?.metaDescription || 'Default description'} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={BtsSEO?.Website_Name} />
            <meta property="og:image" content={globalServerStrapi + newsSEO?.ogImage?.url || '/default-og-image.jpg'} />
            <meta property="og:image:width" content={newsSEO?.ogImageWidth} />
            <meta property="og:image:height" content={newsSEO?.ogImageHeight} />
            <meta property="og:image:alt" content={newsSEO?.ogImageAlt || 'Belize Tax Service'} />
            <meta property="og:image:type" content={newsSEO?.ogImageType} />

            {/* Twitter Cards */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={newsSEO?.metaTitle || 'Belize Tax Service'} />
            <meta name="twitter:description" content={newsSEO?.metaDescription || 'Default description'} />
            <meta name="twitter:image" content={globalServerStrapi + newsSEO?.ogImage?.url || '/default-og-image.jpg'} />

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
                        "description": newsSEO?.metaDescription || "Organization description",
                        "sameAs": BtsSEO?.Social_Networks?.map(red => red.URL).filter(url => url) || []
                    })
                }}
            />

            <div className='container boxed-container home-area'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <HomeAboutUs />
                    </div>
                </div>
            </div>
        </>
    );
};

export default AboutUs;

