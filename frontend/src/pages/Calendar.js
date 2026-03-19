import React, { useContext, useEffect, useMemo, useState } from 'react';
import { GlobalContext } from '../components/Context/Context';
import { useStrapiCollection, useStrapiSingle } from '../components/Strapi/strapiCollection';
import TaxCalendar from '../components/TaxCalendar/TaxCalendar';

const Calendar = () => {
    const [BtsSEO, setBtsSEO] = useState({});
    const [calendarSEO, setCalendarSEO] = useState({});
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
        () => ({ Page_Id: 'Calendar' }),
        []
    );

    const {
        data: strapiCalendarSEO,
        loading: strapiCalendarSEOLoading,
        error: strapiCalendarSEOError
    } = useStrapiCollection(
        'seo-pages',
        '=*',
        'id',
        'asc',
        1,
        seoFilters
    );

    useEffect(() => {
        if (strapiCalendarSEO) {
            setCalendarSEO(strapiCalendarSEO[0]);
        }
        if (strapiCalendarSEOError) {
            console.error("Error loading SEO for Calendar:", strapiCalendarSEOError);
        }
    }, [strapiCalendarSEO, strapiCalendarSEOLoading, strapiCalendarSEOError]);

    return (
        <>
            <title>{calendarSEO?.metaTitle || 'Belize Tax Service - Calendar page'}</title>
            <meta name="description" content={calendarSEO?.metaDescription || 'Default description'} />
            <meta name="keywords" content={calendarSEO?.metaKeywords || 'Default keywords'} />

            <meta property="og:title" content={calendarSEO?.metaTitle || 'Belize Tax Service'} />
            <meta property="og:description" content={calendarSEO?.metaDescription || 'Default description'} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={BtsSEO?.Website_Name} />
            <meta property="og:image" content={globalServerStrapi + calendarSEO?.ogImage?.url || '/default-og-image.jpg'} />
            <meta property="og:image:width" content={calendarSEO?.ogImageWidth} />
            <meta property="og:image:height" content={calendarSEO?.ogImageHeight} />
            <meta property="og:image:alt" content={calendarSEO?.ogImageAlt || 'Belize Tax Service'} />
            <meta property="og:image:type" content={calendarSEO?.ogImageType} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={calendarSEO?.metaTitle || 'Belize Tax Service'} />
            <meta name="twitter:description" content={calendarSEO?.metaDescription || 'Default description'} />
            <meta name="twitter:image" content={globalServerStrapi + calendarSEO?.ogImage?.url || '/default-og-image.jpg'} />

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
                        "description": calendarSEO?.metaDescription || "Organization description",
                        "sameAs": BtsSEO?.Social_Networks?.map(red => red.URL).filter(url => url) || []
                    })
                }}
            />

            <div className='container boxed-container home-area'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <TaxCalendar />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Calendar;
