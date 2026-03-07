import React, { useMemo } from 'react';
import { useStrapiCollection, useStrapiSingle } from '../Strapi/strapiCollection';
import IrisBelizeTutorialsContentComponent from './IrisBelizeTutorialsContent.component';
import { normalizeRichText } from '../utils/richText';

const TARGET_TAG = 'iris belize';
const TARGET_FAQ_SECTIONS = new Set(['iris belize', 'iris belice']);

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

const getTagValue = (tag) => {
    const source = normalizeItem(tag) || {};
    return (
        source.Tag_Name
        || source.tag_name
        || source.Tag
        || source.Title
        || source.Name
        || source.name
        || ''
    );
};

const normalizeTag = (value) => {
    if (typeof value !== 'string') return '';
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
};

const normalizeName = (value) => {
    if (typeof value !== 'string') return '';
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
};

const tutorialHasIrisBelizeTag = (tutorial) => {
    const tags = toArray(tutorial?.Tutorial_Tags);
    return tags.some((tag) => normalizeTag(getTagValue(tag)) === TARGET_TAG);
};

const IrisBelizeTutorialsContent = () => {
    const {
        data: pageData,
        loading: pageLoading,
        error: pageError
    } = useStrapiSingle('iris-belize-tutorials-page', '=*');

    const {
        data: tutorialsRows,
        loading: tutorialsLoading,
        error: tutorialsError
    } = useStrapiCollection(
        'tutorials',
        '=*',
        'Tutorial_Order',
        'asc',
        200
    );

    const {
        data: faqSectionsRows,
        loading: faqSectionsLoading,
        error: faqSectionsError
    } = useStrapiCollection(
        'faq-sections',
        '[fields][0]=FAQ_Section_Name&populate[faq_themes][fields][0]=FAQ_Theme_Name&populate[faq_themes][populate][faqs][fields][0]=FAQ_Question&populate[faq_themes][populate][faqs][fields][1]=FAQ_Answer',
        'id',
        'asc',
        100
    );

    const tutorials = useMemo(() => {
        return (tutorialsRows || [])
            .map(normalizeItem)
            .filter(Boolean)
            .filter(tutorialHasIrisBelizeTag)
            .map((tutorial) => {
                const categories = toArray(tutorial.Tutorial_Categories)
                    .map(normalizeItem)
                    .filter(Boolean)
                    .map((category) => (
                        category?.Tax_Resource_Category_Name
                        || category?.name
                        || category?.Title
                        || ''
                    ))
                    .filter(Boolean);

                return {
                    id: tutorial.id || tutorial.documentId || tutorial.Tutorial_Title,
                    title: tutorial.Tutorial_Title || '',
                    summary: normalizeRichText(tutorial.Tutorial_Summary),
                    videoUrl: tutorial.Tutorial_Video_URL || '',
                    categories
                };
            });
    }, [tutorialsRows]);

    const faqSection = useMemo(() => {
        const sections = (faqSectionsRows || [])
            .map(normalizeItem)
            .filter(Boolean);

        const targetSection = sections.find((section) => (
            TARGET_FAQ_SECTIONS.has(normalizeName(section?.FAQ_Section_Name))
        ));

        if (!targetSection) return null;

        const themes = toArray(targetSection?.faq_themes)
            .map(normalizeItem)
            .filter(Boolean)
            .map((theme) => {
                const faqs = toArray(theme?.faqs)
                    .map(normalizeItem)
                    .filter(Boolean)
                    .map((faq) => ({
                        id: faq.id || faq.documentId || faq.FAQ_Question,
                        question: faq.FAQ_Question || '',
                        answer: normalizeRichText(faq.FAQ_Answer)
                    }))
                    .filter((faq) => faq.question || faq.answer);

                return {
                    id: theme.id || theme.documentId || theme.FAQ_Theme_Name,
                    name: theme.FAQ_Theme_Name || '',
                    faqs
                };
            })
            .filter((theme) => theme.faqs.length > 0);

        return {
            name: targetSection?.FAQ_Section_Name || 'FAQs',
            text: normalizeRichText(targetSection?.FAQ_Section_Text),
            themes
        };
    }, [faqSectionsRows]);

    const pageAttributes = normalizeItem(pageData) || {};
    const title = pageAttributes.IRIS_Belize_Tutorials_Page_Title || 'IRIS Belize Tutorials';
    const topText = normalizeRichText(pageAttributes.IRIS_Belize_Tutorials_Page_TopText);
    const bottomText = normalizeRichText(pageAttributes.IRIS_Belize_Tutorials_Page_Bottom_Text);

    return (
        <IrisBelizeTutorialsContentComponent
            title={title}
            topText={topText}
            bottomText={bottomText}
            tutorials={tutorials}
            faqSection={faqSection}
            loading={pageLoading || tutorialsLoading || faqSectionsLoading}
            error={pageError || tutorialsError || faqSectionsError}
        />
    );
};

export default IrisBelizeTutorialsContent;
