import React, { useContext, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import './SupportCenterContent.component.css';
import { useStrapiSingle } from '../Strapi/strapiCollection';
import { GlobalContext } from '../Context/Context';

const SupportCenterContentBase = ({ executeRecaptcha }) => {
    const { globalTokenStrapi, globalServerStrapi } = useContext(GlobalContext);
    const [formValues, setFormValues] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [formStatus, setFormStatus] = useState({ state: 'idle', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: supportCenterData, loading } = useStrapiSingle(
        'support-center',
        '[Support_Center_Contact_Form_Subject_Value][populate]=*'
    );

    if (loading) return <div className="support-center-loading">Loading...</div>;
    if (!supportCenterData) return null;
    const attributes = supportCenterData.attributes || supportCenterData;

    const subjectValueRaw = attributes.Support_Center_Contact_Form_Subject_Value?.data
        || attributes.Support_Center_Contact_Form_Subject_Value
        || [];
    const subjectValueList = Array.isArray(subjectValueRaw) ? subjectValueRaw : [];

    const blocksToMarkdown = (blocks) => {
        if (!Array.isArray(blocks)) return '';
        const renderInline = (children = []) => children.map((child) => {
            const text = child.text || '';
            if (child.bold) return `**${text}**`;
            if (child.italic) return `*${text}*`;
            if (child.underline) return `__${text}__`;
            return text;
        }).join('');

        return blocks.map((block) => {
            if (block.type === 'paragraph') {
                return renderInline(block.children);
            }
            if (block.type === 'heading') {
                const level = Math.min(Math.max(block.level || 2, 1), 6);
                return `${'#'.repeat(level)} ${renderInline(block.children)}`;
            }
            if (block.type === 'list') {
                const ordered = block.format === 'ordered';
                return (block.children || []).map((item, idx) => {
                    const prefix = ordered ? `${idx + 1}. ` : '- ';
                    return `${prefix}${renderInline(item.children)}`;
                }).join('\n');
            }
            return '';
        }).filter(Boolean).join('\n\n');
    };

    const title = attributes.Support_Center_Title || 'Support Center';
    const subTitle = attributes.Support_Center_SubTitle || '';
    const introTextRaw = attributes.Support_Center_Text || '';
    const introText = typeof introTextRaw === 'string'
        ? introTextRaw
        : blocksToMarkdown(introTextRaw);

    const faqTitle = attributes.Support_Center_FAQ_Title || '';
    const faqTextRaw = attributes.Support_Center_FAQ_Text || '';
    const faqText = typeof faqTextRaw === 'string'
        ? faqTextRaw
        : blocksToMarkdown(faqTextRaw);

    const chatBotTitle = attributes.Support_Center_ChatBot_Title || '';
    const chatBotTextRaw = attributes.Support_Center_ChatBot_Text || '';
    const chatBotText = typeof chatBotTextRaw === 'string'
        ? chatBotTextRaw
        : blocksToMarkdown(chatBotTextRaw);

    const contactTitle = attributes.Support_Center_Contact_Form_Title || '';
    const contactTextRaw = attributes.Support_Center_Contact_Form_Text || '';
    const contactText = typeof contactTextRaw === 'string'
        ? contactTextRaw
        : blocksToMarkdown(contactTextRaw);

    const firstNameLabel = attributes.Support_Center_Contact_Form_First_Name || 'First Name';
    const lastNameLabel = attributes.Support_Center_Contact_Form_Last_Name || 'Last Name';
    const emailLabel = attributes.Support_Center_Contact_Form_Email || 'Email';
    const phoneLabel = attributes.Support_Center_Contact_Form_Phone_Number || 'Phone Number';
    const subjectLabel = attributes.Support_Center_Contact_Form_Subject || 'Subject';
    const messageLabel = attributes.Support_Center_Contact_Form_Message || 'Message';
    const submitButtonText = attributes.Support_Center_Contact_Form_Submit_Button_Text || 'Send Message';
    const submitButtonSendingText = attributes.Support_Center_Contact_Form_Submit_Button_Sending_Text || 'Sending...';
    const submitTextRaw = attributes.Support_Center_Contact_Form_Submit_Text || '';
    const submitText = typeof submitTextRaw === 'string'
        ? submitTextRaw
        : blocksToMarkdown(submitTextRaw);
    const errorStrapiText = attributes.Support_Center_Contact_Form_Error_Strapi || 'Strapi server is not configured.';
    const errorSendingText = attributes.Support_Center_Contact_Form_Error_Sending || 'The message could not be sent. Please try again.';
    const recaptchaErrorText = attributes.Support_Center_Contact_Form_Error_Recaptcha || 'Por favor completa el reCAPTCHA.';
    const recaptchaConfigErrorText = attributes.Support_Center_Contact_Form_Error_Recaptcha_Config
        || 'reCAPTCHA no está configurado. Por favor intenta más tarde.';
    const recaptchaSiteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY || '';

    const subjectOptions = subjectValueList
        .map((item) => item?.Subject_Value || item?.attributes?.Subject_Value || '')
        .filter(Boolean);

    const buildApiUrl = (base, path) => `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormStatus({ state: 'idle', message: '' });

        if (!globalServerStrapi) {
            setFormStatus({ state: 'error', message: errorStrapiText });
            return;
        }

        if (!recaptchaSiteKey) {
            setFormStatus({ state: 'error', message: recaptchaConfigErrorText });
            return;
        }

        try {
            setIsSubmitting(true);
            if (!executeRecaptcha) {
                setFormStatus({ state: 'error', message: recaptchaErrorText });
                return;
            }
            const recaptchaToken = await executeRecaptcha('support_center_submit');
            if (!recaptchaToken) {
                setFormStatus({ state: 'error', message: recaptchaErrorText });
                return;
            }
            const fullName = `${formValues.firstName} ${formValues.lastName}`.trim();
            const subjectValue = formValues.subject || 'Support Center Form Submission';
            const textLines = [
                `Name: ${fullName || '-'}`,
                `Email: ${formValues.email || '-'}`,
                `Phone: ${formValues.phone || '-'}`,
                `Subject: ${subjectValue}`,
                `Message: ${formValues.message || '-'}`
            ];
            const htmlLines = [
                `<strong>Name:</strong> ${fullName || '-'}`,
                `<strong>Email:</strong> ${formValues.email || '-'}`,
                `<strong>Phone:</strong> ${formValues.phone || '-'}`,
                `<strong>Subject:</strong> ${subjectValue}`,
                `<strong>Message:</strong> ${formValues.message || '-'}`
            ];

            const payload = {
                to: 'victorhugocanal@gmail.com',
                replyTo: formValues.email || undefined,
                subject: subjectValue,
                text: textLines.join('\n'),
                html: `<p>${htmlLines.join('</p><p>')}</p>`,
                form: { ...formValues },
                recaptchaToken
            };

            const headers = { 'Content-Type': 'application/json' };
            if (globalTokenStrapi) headers.Authorization = `Bearer ${globalTokenStrapi}`;

            const response = await fetch(
                buildApiUrl(globalServerStrapi, 'api/support-requests/submit'),
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                throw new Error(`Error ${response.status}`);
            }

            setFormValues({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            });
            setFormStatus({ state: 'success', message: '' });
        } catch (error) {
            setFormStatus({
                state: 'error',
                message: errorSendingText
            });
            console.error('Support center form error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="support-center">
            <div className="support-center-container">
                <div className="support-center-hero">
                    <h2 className="support-center-main-title">{title}</h2>
                    {subTitle && <p className="support-center-subtitle">{subTitle}</p>}
                    {introText && (
                        <ReactMarkdown className="support-center-intro-text">
                            {introText}
                        </ReactMarkdown>
                    )}
                </div>

                <div className="support-center-feature-grid">
                    {(faqTitle || faqText) && (
                        <article className="support-center-card">
                            {faqTitle && <h3 className="support-center-card-title">{faqTitle}</h3>}
                            {faqText && (
                                <ReactMarkdown className="support-center-card-text">
                                    {faqText}
                                </ReactMarkdown>
                            )}
                        </article>
                    )}

                    {(chatBotTitle || chatBotText) && (
                        <article className="support-center-card">
                            {chatBotTitle && <h3 className="support-center-card-title">{chatBotTitle}</h3>}
                            {chatBotText && (
                                <ReactMarkdown className="support-center-card-text">
                                    {chatBotText}
                                </ReactMarkdown>
                            )}
                        </article>
                    )}
                </div>

                <div className="support-center-contact">
                    {contactTitle && <h3 className="support-center-contact-title">{contactTitle}</h3>}
                    {contactText && (
                        <ReactMarkdown className="support-center-contact-text">
                            {contactText}
                        </ReactMarkdown>
                    )}

                    <form className="support-center-form" onSubmit={handleSubmit}>
                        <div className="support-center-form-row">
                            <label className="support-center-field">
                                <span>{firstNameLabel}</span>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formValues.firstName}
                                    onChange={handleChange}
                                    placeholder={firstNameLabel}
                                />
                            </label>
                            <label className="support-center-field">
                                <span>{lastNameLabel}</span>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formValues.lastName}
                                    onChange={handleChange}
                                    placeholder={lastNameLabel}
                                />
                            </label>
                        </div>

                        <div className="support-center-form-row">
                            <label className="support-center-field">
                                <span>{emailLabel}</span>
                                <input
                                    type="email"
                                    name="email"
                                    value={formValues.email}
                                    onChange={handleChange}
                                    placeholder={emailLabel}
                                />
                            </label>
                            <label className="support-center-field">
                                <span>{phoneLabel}</span>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formValues.phone}
                                    onChange={handleChange}
                                    placeholder={phoneLabel}
                                />
                            </label>
                        </div>

                        <label className="support-center-field support-center-field-full">
                            <span>{subjectLabel}</span>
                            <select
                                name="subject"
                                value={formValues.subject}
                                onChange={handleChange}
                            >
                                <option value="" disabled>
                                    {subjectLabel}
                                </option>
                                {subjectOptions.map((value, index) => (
                                    <option key={`${value}-${index}`} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="support-center-field support-center-field-full">
                            <span>{messageLabel}</span>
                            <textarea
                                rows={5}
                                name="message"
                                value={formValues.message}
                                onChange={handleChange}
                                placeholder={messageLabel}
                            />
                        </label>

                        <button type="submit" className="support-center-submit" disabled={isSubmitting}>
                            {isSubmitting ? submitButtonSendingText : submitButtonText}
                        </button>

                        {formStatus.state === 'success' && (submitText ? (
                            <ReactMarkdown className="support-center-contact-text">
                                {submitText}
                            </ReactMarkdown>
                        ) : (
                            <p className="support-center-contact-text">Mensaje enviado correctamente.</p>
                        ))}

                        {formStatus.state === 'error' && (
                            <p className="support-center-contact-text">{formStatus.message}</p>
                        )}
                    </form>
                </div>
            </div>
        </section>
    );
};

const SupportCenterContentWithRecaptcha = () => {
    const { executeRecaptcha } = useGoogleReCaptcha();
    return <SupportCenterContentBase executeRecaptcha={executeRecaptcha} />;
};

const SupportCenterContent = () => {
    const recaptchaSiteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY || '';

    if (!recaptchaSiteKey) {
        return <SupportCenterContentBase executeRecaptcha={null} />;
    }

    return (
        <GoogleReCaptchaProvider
            reCaptchaKey={recaptchaSiteKey}
            scriptProps={{ async: true, defer: true, appendTo: 'head' }}
        >
            <SupportCenterContentWithRecaptcha />
        </GoogleReCaptchaProvider>
    );
};

export default SupportCenterContent;
