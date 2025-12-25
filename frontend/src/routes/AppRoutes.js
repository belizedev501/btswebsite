import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import News from "../pages/News";
import NewsDetails from "../pages/NewsDetails";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

const AppRoutes = () => {
    return (
        <Router>
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
