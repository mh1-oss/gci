
import React, { createContext, useContext, useState, useEffect } from "react";

type CurrencyType = "USD" | "IQD";

interface CurrencyContextType {
  currency: CurrencyType;
  exchangeRate: number;
  setCurrency: (currency: CurrencyType) => void;
  setExchangeRate: (rate: number) => void;
  formatPrice: (price: number) => string;
  convertPrice: (price: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyType>("USD");
  const [exchangeRate, setExchangeRate] = useState<number>(1450); // Default exchange rate: 1 USD = 1450 IQD
  
  // Load saved currency settings from localStorage on initial render
  useEffect(() => {
    const savedCurrency = localStorage.getItem("currency");
    const savedExchangeRate = localStorage.getItem("exchangeRate");
    
    if (savedCurrency) {
      setCurrency(savedCurrency as CurrencyType);
    }
    
    if (savedExchangeRate) {
      setExchangeRate(parseFloat(savedExchangeRate));
    }
  }, []);
  
  // Save currency settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("currency", currency);
    localStorage.setItem("exchangeRate", exchangeRate.toString());
  }, [currency, exchangeRate]);
  
  // Format price based on the selected currency
  const formatPrice = (price: number): string => {
    if (currency === "USD") {
      return `$${price.toFixed(2)}`;
    } else {
      const iqdPrice = price * exchangeRate;
      return `${Math.round(iqdPrice).toLocaleString()} د.ع`;
    }
  };
  
  // Convert price to the selected currency value
  const convertPrice = (price: number): number => {
    if (currency === "USD") {
      return price;
    } else {
      return price * exchangeRate;
    }
  };
  
  const value = {
    currency,
    exchangeRate,
    setCurrency,
    setExchangeRate,
    formatPrice,
    convertPrice
  };
  
  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
