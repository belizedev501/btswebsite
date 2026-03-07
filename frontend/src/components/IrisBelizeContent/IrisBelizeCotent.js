import React from 'react';
import './IrisBelizeCotent.component.css';
import { useStrapiSingle } from '../Strapi/strapiCollection';
import { normalizeRichText, renderRichText } from '../utils/richText';

const IrisBelizeCotent = () => {
    const { data: irisBelizeData, loading } = useStrapiSingle('iris-belize', '=*');

    if (loading) return <div className="iris-belize-loading">Loading...</div>;
    if (!irisBelizeData) return null;

    const attributes = irisBelizeData.attributes || irisBelizeData;

    const title = attributes.IRIS_Belize_Title;
    const subTitle = attributes.IRIS_Belize_SubTitle;
    const textRaw = attributes.IRIS_Belize_Text;
    const text = normalizeRichText(textRaw);

    const loginText = attributes.IRIS_Belize_Login_Button_text;
    const loginUrl = attributes.IRIS_Belize_Login_Button_URL;
    const registerText = attributes.IRIS_Belize_Register_Button_Text;
    const registerUrl = attributes.IRIS_Belize_Register_Button_URL;

    return (
        <section className="iris-belize-container">
            <div className="iris-belize-hero">
                <h2 className="iris-belize-title">{title}</h2>
                {subTitle && <h3 className="iris-belize-subtitle">{subTitle}</h3>}
            </div>

            {renderRichText(text, { className: 'iris-belize-text' })}

            <div className="iris-belize-actions">
                {loginText && loginUrl && (
                    <a className="btn btn-primary iris-belize-button" href={loginUrl} target='_blank'>
                        <span className="iris-belize-button-text">{loginText}</span>
                    </a>
                )}
                {registerText && registerUrl && (
                    <a className="btn btn-secondary iris-belize-button" href={registerUrl} target='_blank'>
                        <span className="iris-belize-button-text">{registerText}</span>
                    </a>
                )}
            </div>
        </section>
    );
};

export default IrisBelizeCotent;

