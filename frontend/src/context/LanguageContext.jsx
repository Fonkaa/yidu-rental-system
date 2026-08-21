import { createContext, useContext, useMemo, useState } from 'react';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key, fallback = '') => {
        const translations = {
          en: {
            appName: 'House Rental System',
            login: 'Login',
            register: 'Register',
            dashboard: 'Dashboard',
            properties: 'Properties',
            favorites: 'Favorites',
            messages: 'Messages',
            notifications: 'Notifications',
            profile: 'Profile'
          },
          am: {
            appName: 'ቤት ኪራይ ስርዓት',
            login: 'ግባ',
            register: 'መመዝገብ',
            dashboard: 'ዳሽቦርድ',
            properties: 'ንብረቶች',
            favorites: 'የተወደዱ',
            messages: 'መልእክቶች',
            notifications: 'ማሳወቂያዎች',
            profile: 'መገለጫ'
          }
        };

        return translations[language]?.[key] || fallback || key;
      }
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
