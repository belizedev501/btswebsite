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
            </Routes>
            <Footer />
        </Router>
    );
};

export default AppRoutes;
