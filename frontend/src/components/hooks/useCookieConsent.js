// Hook to read cookie consent
export function getCookieConsent() {
    try {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) return null;
        return JSON.parse(consent);
    } catch {
        return null;
    }
}
