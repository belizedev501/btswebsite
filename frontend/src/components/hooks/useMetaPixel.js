// hooks/useMetaPixel.js
import { useEffect } from 'react';
import { getCookieConsent } from './useCookieConsent';

export const useMetaPixel = () => {
    // Pixel ID Setup - REPLACE WITH YOUR ACTUAL PIXEL ID
    const PIXEL_ID = 'YOUR_PIXEL_ID_HERE'; // Example: '123456789012345'

    useEffect(() => {
        const consent = getCookieConsent();
        if (!consent || !consent.pixel) return;
        // Check if Facebook Pixel is already loaded
        if (window.fbq) return;

        // Create the Facebook Pixel script
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        
        // Initial fbq function
        const fbq = function() {
            if (fbq.callMethod) {
                fbq.callMethod.apply(fbq, arguments);
            } else {
                fbq.queue.push(arguments);
            }
        };
        
        // Set up the queue if it doesn't exist
        if (!window._fbq) window._fbq = fbq;
        
        // Initialize fbq
        window.fbq = fbq;
        fbq.push = fbq;
        fbq.loaded = true;
        fbq.version = '2.0';
        fbq.queue = [];
        
        // Add the script to the document
        document.head.appendChild(script);
        
        // Initialize the pixel with your ID
        fbq('init', PIXEL_ID);
        
        // Optional: add noscript fallback
        const noscript = document.createElement('noscript');
        const img = document.createElement('img');
        img.height = 1;
        img.width = 1;
        img.style.display = 'none';
        img.src = `https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`;
        noscript.appendChild(img);
        document.body.appendChild(noscript);
        
        console.log('Meta Pixel initialized with ID:', PIXEL_ID);
        
        // Cleanup function
        return () => {
            // Remove script if the component is unmounted
            const existingScript = document.querySelector('script[src*="fbevents.js"]');
            if (existingScript) {
                existingScript.remove();
            }
            
            // Remove noscript
            const existingNoscript = document.querySelector('noscript img[src*="facebook.com/tr"]');
            if (existingNoscript && existingNoscript.parentNode) {
                existingNoscript.parentNode.remove();
            }
        };
    }, []);

    // Function to track page events
    const trackPageView = (pageName = '', customData = {}) => {
        if (window.fbq) {
            window.fbq('track', 'PageView', {
                page_title: pageName,
                ...customData
            });
            console.log('Meta Pixel - PageView tracked:', pageName);
        } else {
            console.warn('Meta Pixel is not available for PageView');
        }
    };

    // Function to track custom events
    const trackEvent = (eventName, parameters = {}) => {
        if (window.fbq) {
            window.fbq('track', eventName, parameters);
            console.log('Meta Pixel - Event tracked:', eventName, parameters);
        } else {
            console.warn('Meta Pixel is not available for event:', eventName);
        }
    };

    // Función para trackear eventos estándar de Facebook
    const trackStandardEvent = (eventName, parameters = {}) => {
        const standardEvents = [
            'ViewContent', 'Search', 'AddToCart', 'AddToWishlist', 
            'InitiateCheckout', 'AddPaymentInfo', 'Purchase', 'Lead',
            'CompleteRegistration', 'Contact', 'CustomizeProduct',
            'Donate', 'FindLocation', 'Schedule', 'StartTrial',
            'SubmitApplication', 'Subscribe'
        ];

        if (standardEvents.includes(eventName)) {
            trackEvent(eventName, parameters);
        } else {
            console.warn('Evento no estándar de Facebook:', eventName);
            trackEvent(eventName, parameters);
        }
    };

    // Función para trackear conversiones
    const trackConversion = (value = 0, currency = 'USD', contentName = '') => {
        trackStandardEvent('Purchase', {
            value: value,
            currency: currency,
            content_name: contentName
        });
    };

    // Función para trackear leads
    const trackLead = (contentName = '', value = 0) => {
        trackStandardEvent('Lead', {
            content_name: contentName,
            value: value,
            currency: 'USD'
        });
    };

    // Function to track content view
    const trackViewContent = (contentName = '', contentType = '', value = 0) => {
        trackStandardEvent('ViewContent', {
            content_name: contentName,
            content_type: contentType,
            value: value,
            currency: 'USD'
        });
    };

    // Function to track checkout initiation
    const trackInitiateCheckout = (value = 0, currency = 'USD', numItems = 1) => {
        trackStandardEvent('InitiateCheckout', {
            value: value,
            currency: currency,
            num_items: numItems
        });
    };

    // Function to track completed forms
    const trackCompleteRegistration = (method = 'website') => {
        trackStandardEvent('CompleteRegistration', {
            registration_method: method
        });
    };

    return {
        trackPageView,
        trackEvent,
        trackStandardEvent,
        trackConversion,
        trackLead,
        trackViewContent,
        trackInitiateCheckout,
        trackCompleteRegistration
    };
};