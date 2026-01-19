import React, { useState, useEffect } from 'react';
import { api } from '../api';

const CurrencySelector = ({ value, onChange, className }) => {
    const [currencies, setCurrencies] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchCurrencies = async () => {
            try {
                const data = await api.get('/api/currencies');
                if (isMounted) {
                    setCurrencies(data);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Failed to fetch currencies", error);
                if (isMounted) {
                    // Fallback currencies
                    setCurrencies({
                        "USD": "United States Dollar",
                        "EUR": "Euro",
                        "GBP": "British Pound",
                        "XAF": "Central African CFA Franc"
                    });
                    setLoading(false);
                }
            }
        };
        fetchCurrencies();
        return () => { isMounted = false; };
    }, []);

    if (loading) return <span className="text-gray-400 text-sm">Loading currencies...</span>;

    return (
        <select
            value={value}
            onChange={(e) => {
                console.log('Currency changed to:', e.target.value);
                onChange(e.target.value);
            }}
            onClick={() => console.log('Currency selector clicked')}
            className={`cursor-pointer bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${className}`}
        >
            {Object.entries(currencies).map(([code, name]) => (
                <option key={code} value={code}>
                    {code} - {name}
                </option>
            ))}
        </select>
    );
};

export default CurrencySelector;
