// filepath: c:\Users\luisn\OneDrive\Documentos\GitHub\MAQUIMAS.WebSite\SitioWebReact\maquimas-web\src\routes\AppRoutes.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Header from "../components/Header/Header";
// Los estilos se importarán automáticamente en cada componente

const AppRoutes = () => {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
            </Routes>
            {/* <Footer /> */}
        </Router>
    );
};

export default AppRoutes;
