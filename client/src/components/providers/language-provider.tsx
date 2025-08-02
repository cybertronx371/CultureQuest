import { useState, useEffect, ReactNode } from 'react';
import { LanguageContext, Language, translations, LanguageContextType } from '@/lib/i18n';

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    // Get language from localStorage or default to English
    const saved = localStorage.getItem('language');
    return (saved === 'id' || saved === 'en') ? saved : 'en';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}