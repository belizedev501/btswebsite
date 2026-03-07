import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "../pages/Home";
import AboutUs from "../pages/AboutUs";
import SupportCenter from "../pages/SupportCenter";
import IrisBelize from "../pages/IrisBelize";
import News from "../pages/News";
import NewsDetails from "../pages/NewsDetails";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import FAQs from "../pages/FAQs";
import Calendar from "../pages/Calendar";
import TaxResources from "../pages/TaxResources";
import TaxResourcesCategory from "../pages/TaxResourcesCategory";
import TaxResource from "../pages/TaxResource";
import IrisBelizeTutorials from "../pages/IrisBelizeTutorials";
import Tutorials from "../pages/Tutorials";
import Guides from "../pages/Guides";
import Guide from "../pages/Guide";
import GuidesAndTutorials from "../pages/GuidesAndTutorials";
import { useGoogleAnalytics } from '../components/hooks/useGoogleAnalytics';

const AnalyticsListener = () => {
    const { trackPageView } = useGoogleAnalytics();
    const location = useLocation();

    useEffect(() => {
        const path = `${location.pathname}${location.search}`;
        const title = document.title || path;
        trackPageView(title, path);
    }, [location.pathname, location.search, trackPageView]);

    return null;
};

const AppRoutes = () => {
    return (
        <Router>
            <AnalyticsListener />
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about_us" element={<AboutUs />} />
                <Route path="/support_center" element={<SupportCenter />} />
                <Route path="/iris_belize" element={<IrisBelize />} />
                <Route path="/news" element={<News />} />
                <Route path="/news_details/:slug" element={<NewsDetails />} />
                <Route path="/faq" element={<FAQs />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/tax_resources" element={<TaxResources />} />
                <Route path="/tax_resources/category/:categoryId" element={<TaxResourcesCategory />} />
                <Route path="/tax_resources/:resourceId" element={<TaxResource />} />
                <Route path="/iris_belize_tutorials" element={<IrisBelizeTutorials />} />
                <Route path="/tutorials" element={<Tutorials />} />
                <Route path="/guides" element={<Guides />} />
                <Route path="/guide/:slug" element={<Guide />} />
                <Route path="/guides_and_tutorials" element={<GuidesAndTutorials />} />
            </Routes>
            <Footer />
        </Router>
    );
};

export default AppRoutes;
