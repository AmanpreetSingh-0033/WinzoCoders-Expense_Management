const CACHE_KEY = 'currency_rates';
const CACHE_DURATION = 3600000;

let ratesCache = null;
let lastFetchTime = null;

export const fetchExchangeRates = async (baseCurrency = 'USD') => {
  if (ratesCache && lastFetchTime && Date.now() - lastFetchTime < CACHE_DURATION) {
    return ratesCache;
  }

  try {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    ratesCache = data.rates;
    lastFetchTime = Date.now();

    return data.rates;
  } catch (error) {
    console.error('Currency API error:', error);
    return getFallbackRates();
  }
};

const getFallbackRates = () => {
  return {
    USD: 1.0,
    EUR: 0.85,
    GBP: 0.73,
    JPY: 110.0,
    CAD: 1.25,
    AUD: 1.35,
    CHF: 0.92,
    CNY: 6.45,
    INR: 74.5
  };
};

export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  try {
    const rates = await fetchExchangeRates(fromCurrency);
    const rate = rates[toCurrency];

    if (!rate) {
      throw new Error(`Exchange rate not found for ${toCurrency}`);
    }

    return amount * rate;
  } catch (error) {
    console.error('Currency conversion error:', error);
    return amount;
  }
};

export const formatCurrency = (amount, currency = 'USD') => {
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'CA$',
    AUD: 'A$',
    CHF: 'CHF',
    CNY: '¥',
    INR: '₹'
  };

  const symbol = currencySymbols[currency] || currency;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);

  return `${symbol}${formatted}`;
};
