import React from 'react';
import ReactMarkdown from 'react-markdown';
import { BlocksRenderer } from '@strapi/blocks-react-renderer';

const normalizeLineEndings = (value = '') => value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

export const normalizeRichText = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value;
    return '';
};

export const renderRichText = (value, options = {}) => {
    const { className = '', blankLineClassName = '' } = options;
    const wrapperClassName = ['rich-text-content', className].filter(Boolean).join(' ');
    if (!value) return null;

    if (Array.isArray(value)) {
        if (value.length === 0) return null;
        return (
            <div className={wrapperClassName}>
                <BlocksRenderer content={value} />
            </div>
        );
    }

    if (typeof value === 'string') {
        const normalized = normalizeLineEndings(value).replace(/[ \t]+\n/g, '\n');
        if (!normalized.trim()) return null;

        const parts = normalized.split(/(\n{2,})/);
        return (
            <div className={wrapperClassName}>
                {parts.map((part, index) => {
                    if (!part) return null;

                    if (/^\n{2,}$/.test(part)) {
                        const blankLines = Math.max(1, part.length - 1);
                        const mergedClassName = ['rich-text-blankline', blankLineClassName].filter(Boolean).join(' ');
                        return (
                            <div
                                key={`blank-${index}`}
                                className={mergedClassName}
                                style={{ '--blank-lines': blankLines }}
                                aria-hidden='true'
                            />
                        );
                    }

                    const withSoftBreaks = part.replace(/\n/g, '  \n');
                    return <ReactMarkdown key={`md-${index}`}>{withSoftBreaks}</ReactMarkdown>;
                })}
            </div>
        );
    }

    return null;
};
