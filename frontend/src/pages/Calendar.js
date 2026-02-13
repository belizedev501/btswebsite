import React from 'react';
import TaxCalendar from '../components/TaxCalendar/TaxCalendar';

const Calendar = () => {
    return (
        <div className='container boxed-container home-area'>
            <div className='row'>
                <div className='col-lg-12'>
                    <TaxCalendar />
                </div>
            </div>
        </div>
    );
};

export default Calendar;
