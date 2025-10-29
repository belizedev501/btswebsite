import React from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({
    title,
    description,
    keywords,
    image,
    url,
    schema,
    type = 'website',
    locale = 'es_CO',
    author = 'Nuestra Plataforma',
    siteName = 'Nuestra Plataforma'
}) => {
    //const BASE_URL = "https://www.maquimas.co/";
    //const BASE_URL = "https://maquimas.pe/strapi/";
    const BASE_URL = "http://10.147.18.240:1337/admin";
    const pageTitle = title ? `${title} | ${siteName}` : siteName;
    const pageUrl = url ? `${BASE_URL}${url}` : BASE_URL;
    const pageImage = image ? (image.startsWith('http') ? image : `${BASE_URL}${image.startsWith('/') ? image.substring(1) : image}`) : `${BASE_URL}default-image.jpg`;
    const metaDescription = description || "Plataforma líder en servicios digitales";

    return (
        <Helmet>
            {/* Basic Tags */}
            <title>{pageTitle}</title>
            <meta name="description" content={metaDescription} />
            {keywords && <meta name="keywords" content={keywords} />}
            <meta name="author" content={author} />
            <link rel="canonical" href={pageUrl} />

            {/* Language */}
            <html lang="en" />

            {/* Open Graph Tags */}
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={pageImage} />
            <meta property="og:url" content={pageUrl} />
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:locale" content={locale} />

            {/* Twitter Card Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={pageImage} />
            <meta name="twitter:site" content="@twitterName" />

            {/* For mobile devices */}
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            {/* Favicons - You can customize this according to your needs */}
            <link rel="icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

            {/* Structured Data for SEO */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;