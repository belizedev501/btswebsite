import React, { useEffect, useMemo, useState } from 'react';
import { GlobalContext } from '../components/Context/Context';
import { useStrapiCollection, useStrapiSingle } from '../components/Strapi/strapiCollection';
import { useContext } from 'react';
import FAQsContent from '../components/FAQsContent/FAQsContent';

const FAQs = () => {
    const [BtsSEO, setBtsSEO] = useState({});
    const [faqsSEO, setFaqsSEO] = useState({});
    const { globalServerStrapi } = useContext(GlobalContext);

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

    const seoFilters = useMemo(
        () => ({ Page_Id: 'FAQs' }),
        []
    );

    const {
        data: strapiFaqsSEO,
        loading: strapiFaqsSEOLoading,
        error: strapiFaqsSEOError
    } = useStrapiCollection(
        'seo-pages',
        '=*',
        'id',
        'asc',
        1,
        seoFilters
    );

    useEffect(() => {
        if (strapiFaqsSEO) {
            setFaqsSEO(strapiFaqsSEO[0]);
        }
        if (strapiFaqsSEOError) {
            console.error("Error loading SEO for FAQs:", strapiFaqsSEOError);
        }
    }, [strapiFaqsSEO, strapiFaqsSEOLoading, strapiFaqsSEOError]);

    return (
        <>
            {/* React Document Metadata */}
            <title>{faqsSEO?.metaTitle || 'BTS - FAQs'}</title>
            <meta name="description" content={faqsSEO?.metaDescription || 'Default description'} />
            <meta name="keywords" content={faqsSEO?.metaKeywords || 'Default keywords'} />

            {/* Open Graph */}
            <meta property="og:title" content={faqsSEO?.metaTitle || 'Belize Tax Service'} />
            <meta property="og:description" content={faqsSEO?.metaDescription || 'Default description'} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={BtsSEO?.Website_Name} />
            <meta property="og:image" content={globalServerStrapi + faqsSEO?.ogImage?.url || '/default-og-image.jpg'} />
            <meta property="og:image:width" content={faqsSEO?.ogImageWidth} />
            <meta property="og:image:height" content={faqsSEO?.ogImageHeight} />
            <meta property="og:image:alt" content={faqsSEO?.ogImageAlt || 'Belize Tax Service'} />
            <meta property="og:image:type" content={faqsSEO?.ogImageType} />

            {/* Twitter Cards */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={faqsSEO?.metaTitle || 'Belize Tax Service'} />
            <meta name="twitter:description" content={faqsSEO?.metaDescription || 'Default description'} />
            <meta name="twitter:image" content={globalServerStrapi + faqsSEO?.ogImage?.url || '/default-og-image.jpg'} />

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
                        "description": faqsSEO?.metaDescription || "Organization description",
                        "sameAs": BtsSEO?.Social_Networks?.map(red => red.URL).filter(url => url) || []
                    })
                }}
            />

            <div className='container boxed-container home-area'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <FAQsContent />
                    </div>
                </div>
            </div>
        </>
    );
};

export default FAQs;
