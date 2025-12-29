import { useCallback, useEffect, useRef } from 'react';
import { getCookieConsent } from './useCookieConsent';

const TRACKING_ID = 'G-oogleAnalyticsTrackingID';

export const useGoogleAnalytics = () => {
    // Marca si gtag ya se inicializó y guarda eventos pendientes mientras carga
    const isReadyRef = useRef(false);
    const pendingEventsRef = useRef([]);

    const flushQueue = useCallback(() => {
        if (!window.gtag || pendingEventsRef.current.length === 0) return;
        pendingEventsRef.current.forEach(args => window.gtag(...args));
        pendingEventsRef.current = [];
    }, []);

    const pushEvent = useCallback((...args) => {
        if (window.gtag && isReadyRef.current) {
            window.gtag(...args);
        } else {
            pendingEventsRef.current.push(args);
        }
    }, []);

    useEffect(() => {
        const consent = getCookieConsent(); // Solo cargamos GA si aceptó analíticas
        if (!consent || !consent.analytics) return;

        if (window.gtag) {
            isReadyRef.current = true;
            flushQueue();
            return;
        }

        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${TRACKING_ID}`;
        script.async = true;
        script.onload = () => {
            isReadyRef.current = true;
            flushQueue();
        };

        window.dataLayer = window.dataLayer || [];
        function gtag() {
            window.dataLayer.push(arguments);
        }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', TRACKING_ID, { send_page_view: false });

        document.head.appendChild(script);
    }, [flushQueue]);

    const trackPageView = useCallback((pageTitle, pagePath) => {
        const path = pagePath || `${window.location.pathname}${window.location.search}`; // Incluye query string
        const location = `${window.location.origin}${path}`;
        const title = pageTitle || document.title || location;

        pushEvent('event', 'page_view', {
            page_title: title,
            page_location: location,
            page_path: path
        });
    }, [pushEvent]);

    const trackEvent = useCallback((action, category, label, value) => {
        if (!action) return;
        pushEvent('event', action, {
            ...(category ? { event_category: category } : {}),
            ...(label ? { event_label: label } : {}),
            ...(value !== undefined ? { value } : {})
        });
    }, [pushEvent]);

    return { trackPageView, trackEvent };
};

export default useGoogleAnalytics;
