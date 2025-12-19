import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GlobalContext } from '../Contexts/Context';
import './NewsDetail.component.css';

const BlogDetalle = () => {
    const { slug } = useParams();
    const { globalServerStrapi, globalTokenStrapi } = useContext(GlobalContext);
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            setError(null);
            try {
                const url = `${globalServerStrapi}/api/posts?populate[Imagen_Banner_1120px_x_280px][populate]=*&populate[Categorias][populate]=*&populate[Tarjetas][populate]=*&sort=Orden_Destacada:ASC&pagination[limit]=1&filters[Slug][$eq]=${encodeURIComponent(slug)}`;
                const res = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${globalTokenStrapi}`
                    }
                });
                if (!res.ok) throw new Error('Error al consultar el API');
                const data = await res.json();
                setPost(data.data && data.data.length > 0 ? (data.data[0].attributes || data.data[0]) : null);
            } catch (err) {
                setError('Error al cargar el post.');
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [slug, globalServerStrapi, globalTokenStrapi]);

    // Obtener la categoría del post
    let categoria = 'Sin Categoria';
    const categorias = post && (post.Categorias || post.categorias?.data);
    if (Array.isArray(categorias) && categorias.length > 0) {
        const cat = categorias[0].Categoria || categorias[0].attributes?.Nombre || categorias[0].Nombre;
        if (cat && typeof cat === 'string' && cat.trim() !== '') {
            categoria = cat;
        }
    }

    if (loading) return (
        <section className="blogPostDetail-section">
            <div className="blogPostDetail-header">
                <div className="skeleton-categoria skeleton-box"></div>
                <div className="skeleton-titulo skeleton-box"></div>
                <div className="skeleton-banner skeleton-box"></div>
            </div>
            <div className="blogPostDetail-tarjeta-section">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton-tarjeta-container">
                        <div className="skeleton-tarjeta-titulo skeleton-box"></div>
                        <div className="skeleton-tarjeta-contenido skeleton-box"></div>
                    </div>
                ))}
            </div>
        </section>
    );
    if (error) return <div>{error}</div>;
    if (!post) return <div>No se encontró el post.</div>;

    return (
        <section>
            <section className="blogPostDetail-section">
                <div className="blogPostDetail-header">
                    <span className="blogPostDetail-categoria">{categoria}</span>
                    <h3 className="blogPostDetail-titulo">{post.Titulo}</h3>
                    {post.Imagen_Banner && (
                        <img
                            src={globalServerStrapi + (post.Imagen_Banner_1120px_x_280px.url || post.Imagen_Banner_1120px_x_280px.data?.attributes?.url)}
                            alt={post.Titulo}
                            className="blogPostDetail-banner"
                        />
                    )}
                </div>
            </section>
            <section className="blogPostDetail-tarjeta-section">
                {/* Opciones para compartir el post */}
                <div className="blogPostDetail-share" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
                    <span style={{ marginBottom: 8, fontWeight: 500, fontSize: 16, color: '#02B1C4' }}>Compartir en:</span>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                        <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Compartir en LinkedIn"
                            className="blogPostDetail-share-btn"
                            style={{ color: '#02B1C4', fontSize: 20 }}
                        >
                            <FaLinkedinIn />
                        </a>
                        <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Compartir en Facebook"
                            className="blogPostDetail-share-btn"
                            style={{ color: '#02B1C4', fontSize: 20 }}
                        >
                            <FaFacebookF />
                        </a>
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(post.Titulo + ' ' + window.location.href)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Compartir en WhatsApp"
                            className="blogPostDetail-share-btn"
                            style={{ color: '#02B1C4', fontSize: 20 }}
                        >
                            <FaWhatsapp />
                        </a>
                        <button
                            onClick={() => { navigator.clipboard.writeText(window.location.href) }}
                            title="Copiar enlace"
                            className="blogPostDetail-share-btn"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#02B1C4' }}
                        >
                            <FaLink />
                        </button>
                    </div>
                </div>
                <p>{post.Introduccion}</p>
                {post.Tarjetas && post.Tarjetas.length > 0 ? (
                    post.Tarjetas.map((tarjeta, idx) => {
                        const t = tarjeta.attributes || tarjeta;
                        const ubicacion = t.Ubicacion_Imagen || '';
                        const imagenUrl = t.Imagen && (t.Imagen.url || t.Imagen.data?.attributes?.url);
                        const imagen = imagenUrl ? (
                            <img
                                src={globalServerStrapi + imagenUrl}
                                alt={t.Titulo || 'Imagen de tarjeta'}
                                className={
                                    ubicacion === 'Banner'
                                        ? 'blog-tarjeta-img-banner'
                                        : ubicacion === 'Izquierda'
                                            ? 'blog-tarjeta-img-l'
                                            : ubicacion === 'Derecha'
                                                ? 'blog-tarjeta-img-r'
                                                : 'blog-tarjeta-img'
                                }
                            />
                        ) : null;
                        const contenido = t.Contenido && Array.isArray(t.Contenido) && (
                            <div>
                                {t.Contenido.map((block, i) => {
                                    if (block.type === 'paragraph') {
                                        return <p key={i}>{block.children.map((child, j) => child.text)}</p>;
                                    }
                                    if (block.type === 'heading') {
                                        return <h4 key={i}>{block.children.map((child, j) => child.text)}</h4>;
                                    }
                                    return null;
                                })}
                            </div>
                        );
                        return (
                            <div key={t.id || idx} className={
                                ubicacion === 'Banner'
                                    ? 'blog-tarjeta-container-banner'
                                    : ubicacion === 'Izquierda' || ubicacion === 'Derecha'
                                        ? 'blog-tarjeta-container blog-tarjeta-container-flex'
                                        : 'blog-tarjeta-container'
                            }>
                                {t.Titulo && <h3>{t.Titulo}</h3>}
                                {/* Imagen Arriba */}
                                {(ubicacion === 'Arriba' && imagen)}
                                {/* Imagen Izquierda o Derecha */}
                                {(ubicacion === 'Izquierda' || ubicacion === 'Derecha') ? (
                                    <div
                                        className={
                                            'blog-tarjeta-flex-responsive' + (ubicacion === 'Derecha' ? ' mobile-derecha' : '')
                                        }
                                        style={{ display: 'flex', flexDirection: ubicacion === 'Izquierda' ? 'row' : 'row-reverse', alignItems: 'flex-start', gap: 24 }}
                                    >
                                        {imagen}
                                        <div style={{ flex: 1 }}>{contenido}</div>
                                    </div>
                                ) : null}
                                {/* Imagen Banner */}
                                {(ubicacion === 'Banner' && imagen)}
                                {/* Imagen Abajo */}
                                {(ubicacion !== 'Izquierda' && ubicacion !== 'Derecha' && ubicacion !== 'Arriba' && ubicacion !== 'Banner') && contenido}
                                {(ubicacion === 'Abajo' && imagen)}
                                {/* Si es Arriba, ya se mostró la imagen antes del contenido */}
                                {(ubicacion === 'Arriba') && contenido}
                                {/* Si no hay ubicación, solo muestra contenido y luego imagen */}
                                {(!ubicacion || ubicacion === '') && contenido}
                                {(!ubicacion || ubicacion === '') && imagen}
                            </div>
                        );
                    })
                ) : (
                    <p></p>
                )}
            </section>


            <BlogMasVisto />
        </section>
    );
};

export default BlogDetalle;
