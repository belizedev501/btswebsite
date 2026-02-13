import React, { useEffect, useState, useContext } from 'react';
import './TaxCalendar.component.css';
import { useStrapiSingle, useStrapiCollection } from '../Strapi/strapiCollection';
import { GlobalContext } from '../Context/Context';

const TaxCalendar = () => {
    const [taxCalendar, setTaxCalendar] = useState(null);
    const [taxCalendarEvents, setTaxCalendarEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [calendarDays, setCalendarDays] = useState([]);
    const [displayEvents, setDisplayEvents] = useState([]);
    const [dateRange, setDateRange] = useState({ start: null, end: null });
    const { locale } = useContext(GlobalContext); // Obtener el idioma del contexto
    
    // Consultas a Strapi para el calendario
    const {
        data: strapiTaxCalendar,
        loading: strapiTaxCalendarLoading,
        error: strapiTaxCalendarError
    } = useStrapiSingle(`calendar`, '=*');

    // Calcular rango de fechas para filtrar eventos
    useEffect(() => {
        if (!selectedDate) return;

        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();

        // Primer día del mes
        const firstDay = new Date(year, month, 1);
        // Último día del mes
        const lastDay = new Date(year, month + 1, 0);

        // Día de la semana del primer día (0 = domingo)
        const firstDayOfWeek = firstDay.getDay();

        // Calcular inicio: retroceder al domingo de la semana del primer día
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDayOfWeek);

        // Si no llegamos a tener al menos 7 días antes del mes, retroceder una semana más
        if (firstDayOfWeek < 7) {
            startDate.setDate(startDate.getDate() - 7);
        }

        // Calcular cuántas semanas necesitamos mostrar
        const totalDaysInMonth = lastDay.getDate();
        const weeksNeeded = Math.ceil((firstDayOfWeek + totalDaysInMonth) / 7) + 1; // +1 para semana extra después

        // Calcular fecha final
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + (weeksNeeded * 7) - 1);
        endDate.setHours(23, 59, 59, 999);

        setDateRange({ start: startDate, end: endDate });
    }, [selectedDate]);

    // Construir filtro para Strapi
    const buildDateFilter = () => {
        if (!dateRange.start || !dateRange.end) return '';

        const startISO = dateRange.start.toISOString();
        const endISO = dateRange.end.toISOString();

        // Formato correcto para Strapi v4
        return `filters[Event_Deadline_DateTime][$gte]=${startISO}&filters[Event_Deadline_DateTime][$lte]=${endISO}`;
    };

    // Consulta a Strapi para eventos con filtro de fecha
    const filterString = buildDateFilter();
    const {
        data: strapiTaxCalendarEvents,
        loading: strapiTaxCalendarEventsLoading,
        error: strapiTaxCalendarEventsError
    } = useStrapiCollection(
        `events-and-deadlines`,
        '=*',
        'Event_Deadline_DateTime',
        'ASC',
        null,
        null,
        `&${filterString}`
    );

    // Efectos para asignar data del calendario
    useEffect(() => {
        if (strapiTaxCalendar) setTaxCalendar(strapiTaxCalendar);
        setLoading(strapiTaxCalendarLoading);
        if (strapiTaxCalendarError) {
            console.error("Error fetching Tax Calendar:", strapiTaxCalendarError);
        }
    }, [strapiTaxCalendar, strapiTaxCalendarLoading, strapiTaxCalendarError]);

    // Efectos para asignar eventos
    useEffect(() => {
        if (strapiTaxCalendarEvents) {
            setTaxCalendarEvents(strapiTaxCalendarEvents);
        }
        setLoading(strapiTaxCalendarEventsLoading);
        if (strapiTaxCalendarEventsError) {
            console.error("Error fetching Tax Calendar Events:", strapiTaxCalendarEventsError);
        }
    }, [strapiTaxCalendarEvents, strapiTaxCalendarEventsError, strapiTaxCalendarEventsLoading]);

    // Nombres de meses - memoizar para evitar recreación
    const [monthNames, setMonthNames] = useState([]);

    useEffect(() => {
        if (taxCalendar) {
            const months = [
                taxCalendar.Calendar_Month_01,
                taxCalendar.Calendar_Month_02,
                taxCalendar.Calendar_Month_03,
                taxCalendar.Calendar_Month_04,
                taxCalendar.Calendar_Month_05,
                taxCalendar.Calendar_Month_06,
                taxCalendar.Calendar_Month_07,
                taxCalendar.Calendar_Month_08,
                taxCalendar.Calendar_Month_09,
                taxCalendar.Calendar_Month_10,
                taxCalendar.Calendar_Month_11,
                taxCalendar.Calendar_Month_12
            ];
            /*console.log('Loading month names from Strapi:', months);*/
            setMonthNames(months);
        }
    }, [taxCalendar]);

    // Generar días del calendario
    useEffect(() => {
        if (!taxCalendar) return;

        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();

        // Primer día del mes
        const firstDay = new Date(year, month, 1);
        // Último día del mes
        const lastDay = new Date(year, month + 1, 0);

        // Día de la semana del primer día (0 = domingo)
        const firstDayOfWeek = firstDay.getDay();

        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calcular fecha de inicio del calendario (mismo cálculo que dateRange)
        let currentDate = new Date(firstDay);
        currentDate.setDate(currentDate.getDate() - firstDayOfWeek);

        // Si no hay al menos 7 días antes, retroceder una semana más
        if (firstDayOfWeek < 7) {
            currentDate.setDate(currentDate.getDate() - 7);
        }

        // Calcular cuántas semanas necesitamos
        const totalDays = lastDay.getDate();
        const weeksNeeded = Math.ceil((firstDayOfWeek + totalDays) / 7) + 1; // +1 para semana extra después

        // Generar días para todas las semanas
        for (let i = 0; i < weeksNeeded * 7; i++) {
            const date = new Date(currentDate);
            const day = date.getDate();
            const isCurrentMonth = date.getMonth() === month;
            const isToday = date.toDateString() === today.toDateString();
            const isPast = date < today && !isToday;

            days.push({ day, date, isCurrentMonth, isPast, isToday });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        setCalendarDays(days);
    }, [selectedDate, taxCalendar]);

    // Filtrar y ordenar eventos para mostrar solo los del rango visible
    useEffect(() => {
        if (!taxCalendarEvents || taxCalendarEvents.length === 0 || !dateRange.start || !dateRange.end) {
            setDisplayEvents([]);
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const rangeStart = new Date(dateRange.start);
        rangeStart.setHours(0, 0, 0, 0);
        const rangeEnd = new Date(dateRange.end);
        rangeEnd.setHours(23, 59, 59, 999);

        // Filtrar solo eventos dentro del rango del calendario
        const eventsInRange = taxCalendarEvents.filter(event => {
            const eventDate = new Date(event.Event_Deadline_DateTime);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= rangeStart && eventDate <= rangeEnd;
        });

        // Separar en próximos y expirados
        const coming = [];
        const expired = [];

        eventsInRange.forEach(event => {
            const eventDate = new Date(event.Event_Deadline_DateTime);
            eventDate.setHours(0, 0, 0, 0);

            if (eventDate >= today) {
                coming.push({ ...event, isComing: true });
            } else {
                expired.push({ ...event, isComing: false });
            }
        });

        // Combinar: primero los próximos (ascendente), luego los expirados (descendente)
        setDisplayEvents([...coming, ...expired.reverse()]);
    }, [taxCalendarEvents, dateRange]);

    // Verificar si hay evento en una fecha
    const hasEvent = (date) => {
        if (!taxCalendarEvents) return false;
        return taxCalendarEvents.some(event => {
            const eventDate = new Date(event.Event_Deadline_DateTime);
            return eventDate.toDateString() === date.toDateString();
        });
    };

    // Navegar entre meses
    const goToPreviousMonth = () => {
        setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
    };

    // Formatear fecha para mostrar
    const formatEventDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        /*const year = date.getFullYear();*/
        // Formato MM/DD para inglés, DD/MM para español
        if (locale === 'en') {
            return `${month}/${day}`;
        } else {
            return `${day}/${month}`;
        }
    };

    // Renderizar día del calendario
    const renderDay = (dayInfo) => {
        const { day, date, isCurrentMonth, isPast, isToday } = dayInfo;
        const hasEventOnDay = hasEvent(date);

        let className = '';
        let boxClassName = '';

        if (!isCurrentMonth) {
            className = 'tax-calendar-day-other-month';
        } else if (isPast) {
            className = 'tax-calendar-past-day-this-month';
        } else {
            className = 'tax-calendar-day-this-month';
        }

        if (hasEventOnDay) {
            className = 'tax-calendar-day-with-event';
            boxClassName = 'tax-calendar-box-with-event';
        }

        if (isToday) {
            boxClassName = boxClassName ? `${boxClassName} tax-calendar-box-today` : 'tax-calendar-box-today';
        }

        return (
            <div className={`col ${boxClassName}`} key={date.toISOString()}>
                <p className={className}>{day}</p>
            </div>
        );
    };

    // Agrupar días en semanas (7 días por fila)
    const renderWeeks = () => {
        const weeks = [];
        for (let i = 0; i < calendarDays.length; i += 7) {
            const week = calendarDays.slice(i, i + 7);
            if (week.length === 7) {
                weeks.push(
                    <div className='row tax-calendar-week-row' key={`week-${i}`}>
                        <div className='col'></div>
                        {week.map(dayInfo => renderDay(dayInfo))}
                        <div className='col'></div>
                    </div>
                );
            }
        }
        return weeks;
    };

    // Separar eventos en próximos y expirados
    const comingEvents = displayEvents.filter(e => e.isComing);
    const expiredEvents = displayEvents.filter(e => !e.isComing);

    return (
        (!loading && taxCalendar?.Calendar_Title) ? (
            <div>
                <div className="tax-calendar-title-container">
                    <div className="icon-size_1 tax-calendar-icon icon-calendar-days-solid" aria-label={taxCalendar.Calendar_Title} />
                    <h5 className="tax-calendar-title">{taxCalendar.Calendar_Title}</h5>
                </div>
                <p>{taxCalendar.Calendar_Text}</p>

                <div className='row tax-calendar-period-content'>
                    <div className='col'></div>
                    <div className='col tax-calendar-period-text-content'>
                        <p>{taxCalendar.Calendar_Period_Text}</p>
                    </div>
                    <div className='col tax-calendar-period-control'>
                        <span
                            className="icon-size_4 tax-calendar-backward-icon icon-backward-solid"
                            onClick={goToPreviousMonth}
                            style={{ cursor: 'pointer' }}
                        />
                        <div className='tax-calendar-period-value-content'>
                            <p className='tax-calendar-period-value' id='TCAL_Selected_Period'>
                                {(() => {
                                    const monthIndex = selectedDate.getMonth();
                                    const year = selectedDate.getFullYear();
                                    const monthName = monthNames[monthIndex];
                                    /*console.log('Debug - Month Index:', monthIndex, 'Year:', year, 'Month Name:', monthName, 'All Months:', monthNames);*/

                                    if (monthNames.length > 0 && monthName) {
                                        return `${monthName.slice(0, 3)} ${year}`;
                                    }
                                    return '';
                                })()}
                            </p>
                        </div>
                        <span
                            className="icon-size_4 tax-calendar-forward-icon icon-forward-solid"
                            onClick={goToNextMonth}
                            style={{ cursor: 'pointer' }}
                        />
                    </div>
                    <div className='col'></div>
                </div>

                <div className='tax-calendar-frame'>
                    {/* Nombres de los días */}
                    <div className='row'>
                        <div className='col'></div>
                        <div className='col'>
                            <p className='tax-calendar-day-name'>{taxCalendar.Calendar_Week_Day_1?.slice(0, 3)}</p>
                        </div>
                        <div className='col'>
                            <p className='tax-calendar-day-name'>{taxCalendar.Calendar_Week_Day_2?.slice(0, 3)}</p>
                        </div>
                        <div className='col'>
                            <p className='tax-calendar-day-name'>{taxCalendar.Calendar_Week_Day_3?.slice(0, 3)}</p>
                        </div>
                        <div className='col'>
                            <p className='tax-calendar-day-name'>{taxCalendar.Calendar_Week_Day_4?.slice(0, 3)}</p>
                        </div>
                        <div className='col'>
                            <p className='tax-calendar-day-name'>{taxCalendar.Calendar_Week_Day_5?.slice(0, 3)}</p>
                        </div>
                        <div className='col'>
                            <p className='tax-calendar-day-name'>{taxCalendar.Calendar_Week_Day_6?.slice(0, 3)}</p>
                        </div>
                        <div className='col'>
                            <p className='tax-calendar-day-name'>{taxCalendar.Calendar_Week_Day_7?.slice(0, 3)}</p>
                        </div>
                        <div className='col'></div>
                    </div>

                    {/* Separador */}
                    <div className='row'>
                        <div className='col tax-calendar-separator'></div>
                    </div>

                    {/* Días del calendario */}
                    {renderWeeks()}

                    {/* Eventos próximos */}
                    {comingEvents.length > 0 && (
                        <>
                            <h5 className='tax-calendar-coming-title'>{taxCalendar.Calendar_Coming_Text}</h5>
                            {comingEvents.map((event, index) => (
                                <div className='row' key={`coming-${index}`}>
                                    <div className='col-2'>
                                        <p className='tax-calendar-coming-event-date'>{formatEventDate(event.Event_Deadline_DateTime)}</p>
                                    </div>
                                    <div className='col-10'>
                                        <p className='tax-calendar-coming-event-text'>
                                            {event.Event_Deadline_Description}
                                            {event.Event_Deadline_Link_URL && event.Event_Deadline_Link_Text?.trim() && (
                                                <> <a href={event.Event_Deadline_Link_URL} target="_blank" rel="noreferrer">
                                                    {event.Event_Deadline_Link_Text}
                                                </a></>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {/* Eventos expirados */}
                    {expiredEvents.length > 0 && (
                        <>
                            <h5 className='tax-calendar-expired-title'>{taxCalendar.Calendar_Expired_Text}</h5>
                            {expiredEvents.map((event, index) => (
                                <div className='row' key={`expired-${index}`}>
                                    <div className='col-2'>
                                        <p className='tax-calendar-expired-event-date'>{formatEventDate(event.Event_Deadline_DateTime)}</p>
                                    </div>
                                    <div className='col-10'>
                                        <p className='tax-calendar-expired-event-text'>
                                            {event.Event_Deadline_Description}
                                            {event.Event_Deadline_Link_URL && event.Event_Deadline_Link_Text?.trim() && (
                                                <> <a href={event.Event_Deadline_Link_URL} target="_blank" rel="noreferrer">
                                                    {event.Event_Deadline_Link_Text}
                                                </a></>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        ) : (
            <p>Loading Tax Calendar</p>
        )
    );
};

export default TaxCalendar;
