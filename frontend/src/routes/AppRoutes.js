// filepath: c:\Users\luisn\OneDrive\Documentos\GitHub\MAQUIMAS.WebSite\SitioWebReact\maquimas-web\src\routes\AppRoutes.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import News from "../pages/News";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
// Los estilos se importarán automáticamente en cada componente

const AppRoutes = () => {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/News" element={<News />} />
            </Routes>
            <Footer />
        </Router>
    );
};

export default AppRoutes;
