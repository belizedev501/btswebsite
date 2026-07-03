import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import './FAQsContent.component.css';
import { GlobalContext } from '../Context/Context';
import { useStrapiCollection, useStrapiSingle } from '../Strapi/strapiCollection';
import { normalizeRichText, renderRichText } from '../utils/richText';

const normalizeItem = (item) => {
    if (!item) return null;
    if (item.attributes) {
        return { id: item.id, ...item.attributes };
    }
    return item;
};

const toArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (Array.isArray(value.data)) return value.data;
    if (value.data) return [value.data];
    return [];
};

const normalizeSectionName = (value) => String(value || '').trim().toLowerCase();

const FAQsContent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { globalServerStrapi, globalTokenStrapi, locale } = useContext(GlobalContext);
    const [searchParams] = useSearchParams();
    const sectionNameFilterRaw = searchParams.get('FAQ_Section_Name') || '';
    const sectionNameFilter = normalizeSectionName(sectionNameFilterRaw);
    const [isLocalizingSectionFilter, setIsLocalizingSectionFilter] = useState(false);

    const { data: faqPageData, loading: faqPageLoading } = useStrapiSingle(
        'faq-page',
        '=*'
    );

    const {
        data: faqSectionsData,
        loading: faqSectionsLoading
    } = useStrapiCollection(
        'faq-sections',
        '[fields][0]=FAQ_Section_Name&populate[faq_themes][fields][0]=FAQ_Theme_Name&populate[faq_themes][populate][faqs][fields][0]=FAQ_Question&populate[faq_themes][populate][faqs][fields][1]=FAQ_Answer',
        'id',
        'asc'
    );

    const sections = useMemo(() => {
        return (faqSectionsData || [])
            .map(normalizeItem)
            .filter(Boolean);
    }, [faqSectionsData]);

    const visibleSections = useMemo(() => {
        if (!sectionNameFilter) return sections;
        return sections.filter(
            (section) => normalizeSectionName(section.FAQ_Section_Name) === sectionNameFilter
        );
    }, [sections, sectionNameFilter]);

    useEffect(() => {
        if (!sectionNameFilterRaw || !locale || !globalServerStrapi) return;
        if (visibleSections.length > 0) {
            setIsLocalizingSectionFilter(false);
            return;
        }

        const baseUrl = globalServerStrapi.replace(/\/+$/, '');
        const headers = {};
        if (globalTokenStrapi) headers.Authorization = `Bearer ${globalTokenStrapi}`;

        const supportedLocales = ['en', 'es'];
        const orderedLookupLocales = [locale, ...supportedLocales.filter((item) => item !== locale)];
        let cancelled = false;

        const fetchFirstLocalizedSection = async () => {
            for (const lookupLocale of orderedLookupLocales) {
                const byNameUrl = `${baseUrl}/api/faq-sections?fields[0]=FAQ_Section_Name&filters[FAQ_Section_Name][$eq]=${encodeURIComponent(sectionNameFilterRaw)}&pagination[limit]=1&locale=${lookupLocale}`;
                const byNameResponse = await fetch(byNameUrl, { headers });
                if (!byNameResponse.ok) continue;

                const byNameResult = await byNameResponse.json();
                const foundItem = Array.isArray(byNameResult?.data) ? byNameResult.data[0] : null;
                const normalizedFoundItem = normalizeItem(foundItem);
                if (normalizedFoundItem) return normalizedFoundItem;
            }

            return null;
        };

        const fetchLocalizedSectionName = async (documentId, fallbackName) => {
            const localizedUrl = `${baseUrl}/api/faq-sections?fields[0]=FAQ_Section_Name&filters[documentId][$eq]=${encodeURIComponent(documentId)}&pagination[limit]=1&locale=${locale}`;
            const localizedResponse = await fetch(localizedUrl, { headers });
            if (!localizedResponse.ok) return fallbackName;

            const localizedResult = await localizedResponse.json();
            const localizedItem = Array.isArray(localizedResult?.data) ? localizedResult.data[0] : null;
            const normalizedLocalizedItem = normalizeItem(localizedItem);
            return normalizedLocalizedItem?.FAQ_Section_Name || fallbackName;
        };

        const redirectToLocalizedSectionFilter = async () => {
            setIsLocalizingSectionFilter(true);

            try {
                const matchedSection = await fetchFirstLocalizedSection();
                if (cancelled || !matchedSection?.documentId) return;

                const localizedSectionName = await fetchLocalizedSectionName(
                    matchedSection.documentId,
                    matchedSection.FAQ_Section_Name || sectionNameFilterRaw
                );

                if (
                    cancelled ||
                    normalizeSectionName(localizedSectionName) === normalizeSectionName(sectionNameFilterRaw)
                ) {
                    return;
                }

                const nextParams = new URLSearchParams(searchParams);
                nextParams.set('FAQ_Section_Name', localizedSectionName);
                navigate(`${location.pathname}?${nextParams.toString()}`, { replace: true });
            } catch (fetchError) {
                console.error('Error localizing FAQ section filter:', fetchError);
            } finally {
                if (!cancelled) setIsLocalizingSectionFilter(false);
            }
        };

        redirectToLocalizedSectionFilter();

        return () => {
            cancelled = true;
        };
    }, [
        globalServerStrapi,
        globalTokenStrapi,
        locale,
        location.pathname,
        navigate,
        searchParams,
        sectionNameFilterRaw,
        visibleSections.length
    ]);

    const [selectedThemeBySection, setSelectedThemeBySection] = useState({});
    const [openFaqByTheme, setOpenFaqByTheme] = useState({});

    useEffect(() => {
        if (!visibleSections.length) return;
        setSelectedThemeBySection((prev) => {
            const next = { ...prev };
            visibleSections.forEach((section) => {
                const themesRaw = toArray(section.faq_themes);
                const themes = themesRaw.map(normalizeItem).filter(Boolean);
                if (!next[section.id] && themes[0]) {
                    next[section.id] = themes[0].id;
                }
            });
            return next;
        });
    }, [visibleSections]);

    const handleThemeSelect = useCallback((sectionId, themeId) => {
        setSelectedThemeBySection((prev) => ({
            ...prev,
            [sectionId]: themeId
        }));
        setOpenFaqByTheme((prev) => ({
            ...prev,
            [themeId]: null
        }));
    }, []);

    const toggleFaq = useCallback((themeId, faqId) => {
        setOpenFaqByTheme((prev) => ({
            ...prev,
            [themeId]: prev[themeId] === faqId ? null : faqId
        }));
    }, []);

    if (faqPageLoading || faqSectionsLoading || isLocalizingSectionFilter) {
        return <div className="faqs-loading">Loading...</div>;
    }

    if (!faqPageData && !sections.length) return null;

    const pageAttributes = normalizeItem(faqPageData) || {};
    const pageTitle = pageAttributes.FAQ_Page_Title || 'Frequently Asked Questions (FAQs)';
    const pageTextRaw = pageAttributes.FAQ_Page_Text || '';
    const pageText = normalizeRichText(pageTextRaw);

    return (
        <section className="faqs-container">
            <div className="faqs-header">
                <h2 className="faqs-title">{pageTitle}</h2>
                {renderRichText(pageText, { className: 'faqs-page-text' })}
            </div>

            {visibleSections.length === 0 && (
                <p className="faqs-empty">No FAQs available.</p>
            )}

            {visibleSections.map((section) => {
                const sectionName = section.FAQ_Section_Name || '';
                const sectionTextRaw = section.FAQ_Section_Text || '';
                const sectionText = normalizeRichText(sectionTextRaw);

                const themes = toArray(section.faq_themes)
                    .map(normalizeItem)
                    .filter(Boolean);

                const selectedThemeId = selectedThemeBySection[section.id]
                    || (themes[0] && themes[0].id);

                const selectedTheme = themes.find((theme) => theme.id === selectedThemeId) || themes[0];
                const faqs = selectedTheme
                    ? toArray(selectedTheme.faqs).map(normalizeItem).filter(Boolean)
                    : [];

                return (
                    <div key={section.id} className="faqs-section">
                        {sectionName && (
                            <h3 className="faqs-section-name">{sectionName}</h3>
                        )}

                        {renderRichText(sectionText, { className: 'faqs-section-info' })}

                        <div className="faqs-section-body">
                            <div className="faqs-theme-list">
                                {themes.map((theme) => {
                                    const themeName = theme.FAQ_Theme_Name || '';
                                    const isActive = theme.id === selectedThemeId;
                                    return (
                                        <button
                                            key={theme.id}
                                            type="button"
                                            className={`faqs-theme-item ${isActive ? 'active' : ''}`}
                                            onClick={() => handleThemeSelect(section.id, theme.id)}
                                        >
                                            {themeName}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="faqs-accordion">
                                {faqs.length === 0 && (
                                    <p className="faqs-empty">No FAQs available.</p>
                                )}
                                {faqs.map((faq) => {
                                    const faqQuestion = faq.FAQ_Question || '';
                                    const answerRaw = faq.FAQ_Answer || '';
                                    const answer = normalizeRichText(answerRaw);
                                    const isOpen = openFaqByTheme[selectedThemeId] === faq.id;

                                    return (
                                        <div
                                            key={faq.id}
                                            className={`faqs-accordion-item ${isOpen ? 'open' : ''}`}
                                        >
                                            <button
                                                type="button"
                                                className="faqs-accordion-header"
                                                onClick={() => toggleFaq(selectedThemeId, faq.id)}
                                            >
                                                <span className="faqs-accordion-question">{faqQuestion}</span>
                                                <span className="faqs-accordion-icon">{isOpen ? '-' : '+'}</span>
                                            </button>
                                            {isOpen && (
                                                <div className="faqs-accordion-body">
                                                    {renderRichText(answer)}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            })}
        </section>
    );
};

export default FAQsContent;
