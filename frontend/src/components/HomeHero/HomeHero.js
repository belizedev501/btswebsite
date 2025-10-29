import React, { useEffect, useState, useContext } from 'react';
import './HomeHero.component.css';
import { useStrapiSingle } from '../Strapi/strapiCollection';
import { GlobalContext } from '../Context/Context'; // ⬅️ importar contexto

const HomeHero = () => {
    const [homeHero, setHomeHero] = useState(null);
    const [loading, setLoading] = useState(true);
    //const { locale, setLocale } = useContext(GlobalContext); // ⬅️ obtener idioma    
    const { globalServerStrapi } = useContext(GlobalContext);

    // Consultas a Strapi con idioma
    const {
        data: strapiHomeHero,
        loading: strapiHomeHeroLoading,
        error: strapiHomeHeroError
    } = useStrapiSingle(`home-hero`, '=*');

    // Efectos para asignar data
    useEffect(() => {
        if (strapiHomeHero) setHomeHero(strapiHomeHero);
        setLoading(strapiHomeHeroLoading);
        if (strapiHomeHeroError) {
            console.error("Error fetching Home Hero:", strapiHomeHeroError);
        }
    }, [strapiHomeHero, strapiHomeHeroLoading, strapiHomeHeroError]);

    return (
        (!loading && homeHero.IRIS_Logo?.url)?  (
            <div>
                <img className='logo_iris' src={globalServerStrapi + homeHero.IRIS_Logo.url} alt="IRIS Belize" />
                <p>{homeHero.IRIS_Text} <a href={homeHero.IRIS_Link_URL} target="_blank" rel="noreferrer">{homeHero.IRIS_Link_Text}</a></p>
            </div>
        ) : (
            <p>Loading Home Hero</p>
        )
    );
};

export default HomeHero;
