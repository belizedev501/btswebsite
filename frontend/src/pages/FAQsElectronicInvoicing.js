import React, { useEffect } from 'react';

const FAQsElectronicInvoicing = () => {
    useEffect(() => {
        window.location.replace('https://bts.gov.bz/faq?FAQ_Section_Name=Electronic%20Invoicing');
    }, []);

    return null;
};

export default FAQsElectronicInvoicing;
