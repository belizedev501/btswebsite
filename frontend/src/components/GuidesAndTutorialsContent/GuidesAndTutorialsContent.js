import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { GlobalContext } from '../Context/Context';
import { useStrapiCollection, useStrapiSingle } from '../Strapi/strapiCollection';
import { normalizeRichText, renderRichText } from '../utils/richText';
import './GuidesAndTutorialsContent.component.css';

const normalizeItem = (item) => {
    if (!item) return null;
    if (item.attributes) return { id: item.id, ...item.attributes };
    return item;
};

const toArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (Array.isArray(value.data)) return value.data;
    if (value.data) return [value.data];
    return [];
};

const getCategoryName = (category) => {
    const item = normalizeItem(category) || {};
    return item.Tax_Resource_Category_Name || item.name || '';
};

const getGuideCategoryCounts = (guidesRows = []) => {
    const counter = new Map();

    guidesRows.map(normalizeItem).filter(Boolean).forEach((guide) => {
        const uniqueGuideCategories = new Set(
            toArray(guide.tax_resource_categories || guide.Tax_Resource_Categories)
                .map(getCategoryName)
                .filter(Boolean)
        );

        uniqueGuideCategories.forEach((categoryName) => {
            counter.set(categoryName, (counter.get(categoryName) || 0) + 1);
        });
    });

    return [...counter.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name));
};

const getTutorialCategoryCounts = (tutorialsRows = []) => {
    const counter = new Map();

    tutorialsRows.map(normalizeItem).filter(Boolean).forEach((tutorial) => {
        const uniqueTutorialCategories = new Set(
            toArray(tutorial.Tutorial_Categories || tutorial.tutorial_categories)
                .map(getCategoryName)
                .filter(Boolean)
        );

        uniqueTutorialCategories.forEach((categoryName) => {
            counter.set(categoryName, (counter.get(categoryName) || 0) + 1);
        });
    });

    return [...counter.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name));
};

const getTranslations = (locale) => {
    const isSpanish = locale === 'es';

    return {
        loading: isSpanish ? 'Cargando guias y tutoriales...' : 'Loading guides and tutorials...',
        error: isSpanish ? 'Error cargando guias y tutoriales.' : 'Error loading guides and tutorials.',
        defaultTitle: isSpanish ? 'Guias y Tutoriales' : 'Guides and Tutorials',
        guideCategoriesTitle: isSpanish ? 'Categorias de Guias' : 'Guides Categories',
        tutorialCategoriesTitle: isSpanish ? 'Categorias de Tutoriales' : 'Tutorial Categories',
        guideCountLabel: isSpanish ? 'guias' : 'guides',
        tutorialCountLabel: isSpanish ? 'tutoriales' : 'tutorials',
        emptyGuideCategories: isSpanish ? 'No hay categorias de guias disponibles.' : 'No guide categories available.',
        emptyTutorialCategories: isSpanish ? 'No hay categorias de tutoriales disponibles.' : 'No tutorial categories available.'
    };
};

const GuidesAndTutorialsContent = () => {
    const { locale } = useContext(GlobalContext);
    const {
        data: pageData,
        loading: pageLoading,
        error: pageError
    } = useStrapiSingle('guides-and-tutorials-page', '=*');

    const {
        data: guidesRows,
        loading: guidesLoading,
        error: guidesError
    } = useStrapiCollection('guides', '=*', 'id', 'asc', 300);

    const {
        data: tutorialsRows,
        loading: tutorialsLoading,
        error: tutorialsError
    } = useStrapiCollection('tutorials', '=*', 'Tutorial_Order', 'asc', 300);

    const guideCategories = useMemo(() => getGuideCategoryCounts(guidesRows), [guidesRows]);
    const tutorialCategories = useMemo(() => getTutorialCategoryCounts(tutorialsRows), [tutorialsRows]);
    const texts = getTranslations(locale);

    const loading = pageLoading || guidesLoading || tutorialsLoading;
    const error = pageError || guidesError || tutorialsError;

    if (loading) return <p className='guides-tutorials-feedback'>{texts.loading}</p>;
    if (error) return <p className='guides-tutorials-feedback guides-tutorials-feedback--error'>{texts.error}</p>;

    const page = normalizeItem(pageData) || {};
    const title = page.Guides_And_Tutorials_Title || texts.defaultTitle;
    const text = normalizeRichText(page.Guides_And_Tutorials_Text);

    return (
        <section className='guides-tutorials'>
            <header className='guides-tutorials__header'>
                <h2 className='guides-tutorials__title'>{title}</h2>
                {renderRichText(text, { className: 'guides-tutorials__text' })}
            </header>

            <div className='guides-tutorials__columns'>
                <section className='guides-tutorials__column'>
                    <h3 className='guides-tutorials__column-title'>{texts.guideCategoriesTitle}</h3>
                    <div className='guides-tutorials__cards'>
                        {guideCategories.map((category) => (
                            <article className='guides-tutorials__card' key={`guide-${category.name}`}>
                                <Link
                                    className='guides-tutorials__card-link'
                                    to={`/guides?category=${encodeURIComponent(category.name)}`}
                                >
                                    {category.name}
                                </Link>
                                <p className='guides-tutorials__card-count'>{category.count} {texts.guideCountLabel}</p>
                            </article>
                        ))}
                        {guideCategories.length === 0 && (
                            <p className='guides-tutorials__empty'>{texts.emptyGuideCategories}</p>
                        )}
                    </div>
                </section>

                <section className='guides-tutorials__column'>
                    <h3 className='guides-tutorials__column-title'>{texts.tutorialCategoriesTitle}</h3>
                    <div className='guides-tutorials__cards'>
                        {tutorialCategories.map((category) => (
                            <article className='guides-tutorials__card' key={`tutorial-${category.name}`}>
                                <Link
                                    className='guides-tutorials__card-link'
                                    to={`/tutorials?category=${encodeURIComponent(category.name)}`}
                                >
                                    {category.name}
                                </Link>
                                <p className='guides-tutorials__card-count'>{category.count} {texts.tutorialCountLabel}</p>
                            </article>
                        ))}
                        {tutorialCategories.length === 0 && (
                            <p className='guides-tutorials__empty'>{texts.emptyTutorialCategories}</p>
                        )}
                    </div>
                </section>
            </div>
        </section>
    );
};

export default GuidesAndTutorialsContent;
