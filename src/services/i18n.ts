import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';

i18next
  .use(initReactI18next)
  .use(HttpApi)
  .init({
    lng: new URL(document.location.href).searchParams.get('lang') ?? navigator.language,
    fallbackLng: 'en',
    nonExplicitSupportedLngs: true,
    ns: [
      'main',
      'prefix',
      'quantity',
      'unit',
      'extra'
    ],
    defaultNS: 'main',
    interpolation: {
      escapeValue: false,
    },
    debug: false, // process.env.NODE_ENV !== 'production',
  });

export default i18next;
