import React, { useEffect, useState } from 'react';
import { GlobalContext } from '../components/Context/Context';
import { useStrapiSingle, useStrapiCollection } from '../components/Strapi/strapiCollection';
import { useContext } from 'react';
import HomeHero from '../components/HomeHero/HomeHero';
import HomeNews from '../components/HomeNews/HomeNews';
import HomeTopServices from '../components/HomeTopServices/HomeTopServices';
import '../components/Home.component.css';
import TaxCalculator from '../components/TaxCalculator/TaxCalculator';
import TaxCalendar from '../components/TaxCalendar/TaxCalendar';
import { useMemo } from 'react';

const Home = () => {
    const [BtsSEO, setBtsSEO] = useState({});
    const [homeSEO, setHomeSEO] = useState({});
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

    // Get SEO Data for BTS Home

    const seoFilters = useMemo(
        () => ({ Page_Id: 'Home' }),
        []
    );

    const {
        data: strapiHomeSEO,
        loading: strapiHomeSEOLoading,
        error: strapiHomeSEOError
    } = useStrapiCollection(
        'seo-pages',
        '=*',
        'id',
        'asc',
        1,
        seoFilters
    );

    useEffect(() => {
        if (strapiHomeSEO) {
            setHomeSEO(strapiHomeSEO[0]);
        }
        if (strapiHomeSEOError) {
            console.error("Error loading SEO for Home:", strapiHomeSEOError);
        }
    }, [strapiHomeSEO, strapiHomeSEOLoading, strapiHomeSEOError]);

    // Send pageview when loading page and SEO data
    // useEffect(() => {
    //     if (homeSEO?.metaTitle) {
    //         trackPageView(homeSEO.metaTitle, '/');
    //     }
    // }, [homeSEO?.metaTitle, trackPageView]);



    return (
        <>
            {/* React Document Metadata */}
            <title>{homeSEO?.metaTitle || 'Belize Tax Service - Home page'}</title>
            <meta name="description" content={homeSEO?.metaDescription || 'Default description'} />
            <meta name="keywords" content={homeSEO?.metaKeywords || 'Default keywords'} />

            {/* Open Graph */}
            <meta property="og:title" content={homeSEO?.metaTitle || 'Belize Tax Service'} />
            <meta property="og:description" content={homeSEO?.metaDescription || 'Default description'} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={BtsSEO?.Website_Name} />
            <meta property="og:image" content={globalServerStrapi + homeSEO?.ogImage?.url || '/default-og-image.jpg'} />
            <meta property="og:image:width" content={homeSEO?.ogImageWidth} />
            <meta property="og:image:height" content={homeSEO?.ogImageHeight} />
            <meta property="og:image:alt" content={homeSEO?.ogImageAlt || 'Belize Tax Service'} />
            <meta property="og:image:type" content={homeSEO?.ogImageType} />

            {/* Twitter Cards */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={homeSEO?.metaTitle || 'Belize Tax Service'} />
            <meta name="twitter:description" content={homeSEO?.metaDescription || 'Default description'} />
            <meta name="twitter:image" content={globalServerStrapi + homeSEO?.ogImage?.url || '/default-og-image.jpg'} />

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
                        "description": homeSEO?.metaDescription || "Organization description",
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
                    <div className='col-lg-6 home-news-bordered' >
                        <HomeNews />
                    </div>
                    <div className='col-lg-3'>
                        <HomeTopServices />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;

