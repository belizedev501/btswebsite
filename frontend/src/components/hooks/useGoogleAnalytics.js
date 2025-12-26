import { useEffect } from 'react';
import { getCookieConsent } from './useCookieConsent';

const TRACKING_ID = 'G-oogleAnalyticsTrackingID'; // Replace with your actual Tracking ID

export const useGoogleAnalytics = () => {
    useEffect(() => {
        const consent = getCookieConsent();
        if (!consent || !consent.analytics) return;
        // Function to load Google Analytics
        const loadGoogleAnalytics = () => {
            // Check if it's already loaded
            if (window.gtag) {
                return;
            }

            // Create the gtag script
            const script = document.createElement('script');
            script.src = `https://www.googletagmanager.com/gtag/js?id=${TRACKING_ID}`;
            script.async = true;
            document.head.appendChild(script);

            // Initialize dataLayer and gtag
            window.dataLayer = window.dataLayer || [];
            function gtag() {
                window.dataLayer.push(arguments);
            }

            // Make gtag available globally
            window.gtag = gtag;

            gtag('js', new Date());
            gtag('config', TRACKING_ID, {
                send_page_view: false // We disable automatic sending
            });
        };

        loadGoogleAnalytics();
    }, []);

    // Function to send page events
    const trackPageView = (pageTitle, pagePath) => {
        if (window.gtag) {
            window.gtag('config', TRACKING_ID, {
                page_title: pageTitle,
                page_location: `${window.location.origin}${pagePath || window.location.pathname}`
            });
        }
    };

    // Function to send custom events
    const trackEvent = (action, category, label, value) => {
        if (window.gtag) {
            window.gtag('event', action, {
                event_category: category,
                event_label: label,
                value: value
            });
        }
    };

    return { trackPageView, trackEvent };
};

export default useGoogleAnalytics;