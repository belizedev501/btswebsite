import React, { useEffect, useState } from 'react';
import './TaxCalculator.component.css';
import { useStrapiSingle } from '../Strapi/strapiCollection';

const TaxCalculator = () => {
    const [taxCalculator, setTaxCalculator] = useState(null);
    const [loading, setLoading] = useState(true);
    const [salary, setSalary] = useState('');
    const [frequency, setFrequency] = useState('');
    const [frequencyLabel, setFrequencyLabel] = useState('');
    const [results, setResults] = useState({
        salaryResult: '',
        totalTaxPayable: '',
        totalYearEmoluments: '',
        totalTaxPayableYearly: ''
    });

    // Consultas a Strapi con idioma
    const {
        data: strapiTaxCalculator,
        loading: strapiTaxCalculatorLoading,
        error: strapiTaxCalculatorError
    } = useStrapiSingle(`tax-calculator`, '=*');

    // Efectos para asignar data
    useEffect(() => {
        if (strapiTaxCalculator) setTaxCalculator(strapiTaxCalculator);
        setLoading(strapiTaxCalculatorLoading);
        if (strapiTaxCalculatorError) {
            console.error("Error fetching Tax Calculator:", strapiTaxCalculatorError);
        }
    }, [strapiTaxCalculator, strapiTaxCalculatorLoading, strapiTaxCalculatorError]);

    const handleCalculate = (e) => {
        e.preventDefault();

        // Validación
        if (!salary || !frequency || frequency === taxCalculator.Tax_Calculator_Field_2_Text) {
            alert(taxCalculator.Tax_Calculator_Input_Alert);
            return;
        }

        const salaryNum = parseFloat(salary);
        const frequencyNum = parseFloat(frequency);

        if (isNaN(salaryNum) || salaryNum <= 0) {
            alert(taxCalculator.Tax_Calculator_Invalid_Salary_Alert);
            return;
        }

        // Cálculos
        const yearlyEmoluments = salaryNum * frequencyNum;

        let taxPayable = 0;
        let taxPayableYearly = 0;

        if (yearlyEmoluments <= 29000) {
            taxPayable = 0;
            taxPayableYearly = 0;
        } else if (yearlyEmoluments > 29000 && yearlyEmoluments <= 32000) {
            taxPayableYearly = yearlyEmoluments - 29000;
            taxPayable = taxPayableYearly / frequencyNum;
        } else {
            taxPayableYearly = ((yearlyEmoluments - 32000) * 0.25) + 3000;
            taxPayable = taxPayableYearly / frequencyNum;
        }

        // Actualizar resultados
        setResults({
            salaryResult: salaryNum.toFixed(2),
            totalTaxPayable: taxPayable.toFixed(2),
            totalYearEmoluments: yearlyEmoluments.toFixed(2),
            totalTaxPayableYearly: taxPayableYearly.toFixed(2)
        });
    };

    const handleClear = (e) => {
        e.preventDefault();
        setSalary('');
        setFrequency('');
        setFrequencyLabel('');
        setResults({
            salaryResult: '',
            totalTaxPayable: '',
            totalYearEmoluments: '',
            totalTaxPayableYearly: ''
        });
    };

    const handleFrequencyChange = (e) => {
        const selectedValue = e.target.value;
        const selectedText = e.target.options[e.target.selectedIndex].text;
        setFrequency(selectedValue);
        setFrequencyLabel(selectedText);
    };

    const handleCopyResults = (e) => {
        e.preventDefault();
        const resultText = `
${taxCalculator.Tax_Calculator_Result_Text_1} ${frequencyLabel}: $${results.salaryResult}
${taxCalculator.Tax_Calculator_Result_Text_2}: $${results.totalTaxPayable}
${taxCalculator.Tax_Calculator_Result_Text_3}: $${results.totalYearEmoluments}
${taxCalculator.Tax_Calculator_Result_Text_4}: $${results.totalTaxPayableYearly}
        `.trim();

        navigator.clipboard.writeText(resultText).then(() => {
            alert('Resultados copiados al portapapeles');
        }).catch(err => {
            console.error('Error al copiar:', err);
        });
    };

    return (
        (!loading && taxCalculator?.Tax_Calculator_Title) ? (
            <div>
                <div className="tax-calculator-title-container">
                    <div className="icon-size_1 tax-calculator-icon icon-calculator_solid" aria-label="Tax Calculator" />
                    <h5 className="tax-calculator-title">{taxCalculator.Tax_Calculator_Title}</h5>
                </div>

                <p>{taxCalculator.Tax_Calculator_Text} <a href={taxCalculator.Tax_Calculator_Link_URL} target="_blank" rel="noreferrer">{taxCalculator.Tax_Calculator_Link_Text}</a></p>

                <div className='tax-calculator-frame'>
                    <form>
                        <div className="row mb-3 tax-calculator-field">
                            <label className="col-sm-2 col-form-label">
                                <div className="icon-size_2 tax-calculator-sack-icon icon-sack-dollar-solid" aria-label={taxCalculator.Tax_Calculator_Field_1_Text} />
                            </label>
                            <div className="col-sm-10">
                                <input
                                    type="number"
                                    className="form-control"
                                    id="TC_Salary"
                                    placeholder={taxCalculator.Tax_Calculator_Field_1_Text}
                                    value={salary}
                                    onChange={(e) => setSalary(e.target.value)}
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                        </div>
                        <div className="row mb-3 tax-calculator-field">
                            <label className="col-sm-2 col-form-label">
                                <div className="icon-size_2 tax-calculator-calendar-days-icon icon-calendar-days-solid" aria-label={taxCalculator.Tax_Calculator_Field_2_Text} />
                            </label>
                            <div className="col-sm-10">
                                <select
                                    className="form-select"
                                    id="TC_Frecuency"
                                    aria-label={taxCalculator.Tax_Calculator_Field_2_Text}
                                    value={frequency}
                                    onChange={handleFrequencyChange}
                                >
                                    <option value="">{taxCalculator.Tax_Calculator_Field_2_Text}</option>
                                    <option value="1">{taxCalculator.Tax_Calculator_Field_2_Annually}</option>
                                    <option value="12">{taxCalculator.Tax_Calculator_Field_2_Monthly}</option>
                                    <option value="24">{taxCalculator.Tax_Calculator_Field_2_Bi_Monthly}</option>
                                    <option value="52">{taxCalculator.Tax_Calculator_Field_2_Weekly}</option>
                                    <option value="26">{taxCalculator.Tax_Calculator_Field_2_Bi_Weekly}</option>
                                    <option value="365">{taxCalculator.Tax_Calculator_Field_2_Daily}</option>
                                </select>
                            </div>
                        </div>
                        <div className="row mb-3 tax-calculator-field">
                            <div className="col-sm-2">
                            </div>
                            <div className="col-sm-10">
                                <button
                                    id="TC_Calculate"
                                    type="submit"
                                    className="btn btn-primary tax-calculator-btn-primary"
                                    onClick={handleCalculate}
                                >
                                    {taxCalculator.Tax_Calculator_Button_3_Text}
                                </button>
                                <button
                                    id="TC_Clear"
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleClear}
                                >
                                    {taxCalculator.Tax_Calculator_Button_Clear_Text}
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className='tax-calculator-results-area'>
                        <p className='tax-calculator-text-4'>{taxCalculator.Tax_Calculator_Text_4}</p>
                        <div className='row'>
                            <div id="TC_SalaryResult_Text" className='col-sm-8 tax-calculator-results-label'>
                                <p>{taxCalculator.Tax_Calculator_Result_Text_1} {frequencyLabel}</p>
                            </div>
                            <div className='col-sm-4'>
                                <p id="TC_SalaryResult" className='tax-calculator-results-value'>
                                    {results.salaryResult ? `$${results.salaryResult}` : '$0.00'}
                                </p>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-sm-8 tax-calculator-results-label'>
                                <p>{taxCalculator.Tax_Calculator_Result_Text_2}</p>
                            </div>
                            <div className='col-sm-4'>
                                <p id="TC_TotalTaxPayable" className='tax-calculator-results-value'>
                                    {results.totalTaxPayable ? `$${results.totalTaxPayable}` : '$0.00'}
                                </p>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-sm-8 tax-calculator-results-label'>
                                <p>{taxCalculator.Tax_Calculator_Result_Text_3}</p>
                            </div>
                            <div className='col-sm-4'>
                                <p id="TC_TotalYearEmoluments" className='tax-calculator-results-value'>
                                    {results.totalYearEmoluments ? `$${results.totalYearEmoluments}` : '$0.00'}
                                </p>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-sm-8 tax-calculator-results-label'>
                                <p>{taxCalculator.Tax_Calculator_Result_Text_4}</p>
                            </div>
                            <div className='col-sm-4'>
                                <p id="TC_TotalTaxPayableYearly" className='tax-calculator-results-value'>
                                    {results.totalTaxPayableYearly ? `$${results.totalTaxPayableYearly}` : '$0.00'}
                                </p>
                            </div>
                        </div>
                        <div className="tax-calculator-copy-button-container">
                            <button
                                type="button"
                                id="TC_CopyResults"
                                className="btn btn-primary tax-calculator-copy-button"
                                onClick={handleCopyResults}
                            >
                                <span>{taxCalculator.Tax_Calculator_Button_Copy_Text}</span>
                                <span className="icon-size_3 tax-calculator-copy-icon icon-copy-solid" aria-label={taxCalculator.Tax_Calculator_Button_Copy_Text} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <p>Loading Tax Calculator</p>
        )
    );
};

export default TaxCalculator;