import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "../pages/Home";
import News from "../pages/News";
import NewsDetails from "../pages/NewsDetails";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { useGoogleAnalytics } from '../components/hooks/useGoogleAnalytics';

// Escucha global para enviar page_view en cada cambio de ruta
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
                <Route path="/News" element={<News />} />
                <Route path="/NewsDetails/:slug" element={<NewsDetails />} />
            </Routes>
            <Footer />
        </Router>
    );
};

export default AppRoutes;
