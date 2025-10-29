import { useState, useEffect, useContext } from 'react';
import { GlobalContext } from '../Context/Context';

export const useStrapiCollection = (
  collectionName,
  populateVal = '=*',
  sortField = 'id',
  sortOrder = 'asc',
  limit = null,
  filters = null,
  custom = ''
) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { globalTokenStrapi, globalServerStrapi, locale } = useContext(GlobalContext);

  const buildApiUrl = (base, path) => `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

  const buildFiltersParam = (filtersObj) => {
    if (!filtersObj) return '';
    return Object.entries(filtersObj)
      .map(([key, value]) => `&filters[${key}][$eq]=${encodeURIComponent(value)}`)
      .join('');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!globalServerStrapi) {
          throw new Error('globalServerStrapi no está definido');
        }

        const baseUrl = buildApiUrl(globalServerStrapi, `api/${collectionName}?populate${populateVal}`);
        const sortParam = `&sort=${sortField}:${sortOrder}`;
        const limitParam = limit ? `&pagination[limit]=${limit}` : '';
        const filtersParam = buildFiltersParam(filters);

        // 🔥 Añadimos el locale global a la consulta
        const localeParam = `&locale=${locale}`;

        const url = `${baseUrl}${sortParam}${limitParam}${filtersParam}${localeParam}${custom}`;

        // Construir headers solo si hay token
        const headers = {};
        if (globalTokenStrapi) headers['Authorization'] = `Bearer ${globalTokenStrapi}`;

        console.debug('[useStrapiCollection] fetching', url, { headers });
        const response = await fetch(url, { headers });

        if (!response.ok) throw new Error(`Error ${response.status}`);

  const result = await response.json();
  console.debug('[useStrapiCollection] result', collectionName, response.status, result);
  setData(result.data || []);
      } catch (err) {
        setError(err.message);
        console.error(`Error fetching ${collectionName}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    collectionName,
    populateVal,
    sortField,
    sortOrder,
    limit,
    filters,
    custom,
    globalTokenStrapi,
    globalServerStrapi,
    locale // 👈 se recarga al cambiar idioma
  ]);

  return { data, loading, error };
};

export const useStrapiSingle = (collectionName, populateVal = '=*', custom = '') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { globalTokenStrapi, globalServerStrapi, locale } = useContext(GlobalContext);

  const buildApiUrl = (base, path) => `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (!globalServerStrapi) {
          throw new Error('globalServerStrapi no está definido');
        }

        const baseUrl = buildApiUrl(globalServerStrapi, `api/${collectionName}?populate${populateVal}`);
        // 🔥 Añadimos el locale global
        const url = `${baseUrl}&locale=${locale}${custom}`;

        const headers = {};
        if (globalTokenStrapi) headers['Authorization'] = `Bearer ${globalTokenStrapi}`;

        console.debug('[useStrapiSingle] fetching', url, { headers });

        const response = await fetch(url, { headers });

        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

        const result = await response.json();
        console.debug('[useStrapiSingle] result', collectionName, response.status, result);

        if (result && result.data) {
          setData({ id: result.data.id, ...result.data });
        } else {
          setData(null);
        }
      } catch (err) {
        setError(err.message);
        console.error(`Error fetching ${collectionName}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, populateVal, custom, globalTokenStrapi, globalServerStrapi, locale]);

  return { data, loading, error };
};
