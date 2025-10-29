import React, { useState, useEffect } from 'react';
import './CookieConsentBanner.css';

const COOKIE_KEY = 'cookieConsent';

const defaultPrefs = {
    analytics: true,
    pixel: true,
    recaptcha: true // reCAPTCHA is essential by default
};

const CookieConsentBanner = () => {
    const [visible, setVisible] = useState(false);
    const [prefs, setPrefs] = useState(defaultPrefs);
    const [showPrefs, setShowPrefs] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(COOKIE_KEY);
        if (!consent) {
            setVisible(true);
        }
    }, []);

    const handleAcceptAll = () => {
        const allPrefs = { analytics: true, pixel: true, recaptcha: true };
        localStorage.setItem(COOKIE_KEY, JSON.stringify(allPrefs));
        setVisible(false);
        window.location.reload();
    };

    const handleReject = () => {
        const onlyNecessary = { analytics: false, pixel: false, recaptcha: true };
        localStorage.setItem(COOKIE_KEY, JSON.stringify(onlyNecessary));
        setVisible(false);
    };

    const handleSavePrefs = () => {
        localStorage.setItem(COOKIE_KEY, JSON.stringify(prefs));
        setVisible(false);
        window.location.reload();
    };

    const handleChange = (e) => {
        const { name, checked } = e.target;
        setPrefs((prev) => ({ ...prev, [name]: checked }));
    };

    return visible ? (
        <div className="cookie-banner">
            <div className="cookie-banner__content">
                <p>
                    We use cookies to enhance your experience, analyze traffic, and personalize content. You can accept all cookies, only the necessary ones, or configure your preferences. More information in our <a href="/legales" target="_blank" rel="noopener noreferrer">Cookie Policy</a>.
                </p>
                {showPrefs ? (
                    <form className="cookie-prefs-form" onSubmit={e => { e.preventDefault(); handleSavePrefs(); }}>
                        <div className="form-check form-switch">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id="switchRecaptcha"
                                name="recaptcha"
                                checked={prefs.recaptcha}
                                disabled
                            />
                            <label className="form-check-label" htmlFor="switchRecaptcha">
                                Essential (always active)
                                <span className="cookie-desc"></span>
                            </label>
                        </div>
                        <div className="form-check form-switch">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id="switchAnalytics"
                                name="analytics"
                                checked={prefs.analytics}
                                onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="switchAnalytics">
                                Analytics cookies
                                <span className="cookie-desc"></span>
                            </label>
                        </div>
                        <div className="form-check form-switch">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id="switchPixel"
                                name="pixel"
                                checked={prefs.pixel}
                                onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="switchPixel">
                                Advertising cookies
                                <span className="cookie-desc"></span>
                            </label>
                        </div>
                        <div className="cookie-banner__actions">
                            <button className="cookie-btn" type="submit">Save preferences</button>
                            <button className="cookie-btn accept" onClick={handleAcceptAll}>Allow all</button>
                        </div>
                    </form>
                ) : (
                    <div className="cookie-banner__actions">
                        <button className="cookie-btn accept" onClick={handleAcceptAll}>Allow all</button>
                        <button className="cookie-btn reject" onClick={handleReject}>Reject</button>
                        <button className="cookie-btn" onClick={() => setShowPrefs(true)}>Preferences</button>
                    </div>
                )}
            </div>
        </div>
    ) : null;
};

export default CookieConsentBanner;
