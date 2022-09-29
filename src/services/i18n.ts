import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';

const backendOptions = {
  loadPath: 'locales/{{lng}}/{{ns}}.json'
};

i18next
  .use(initReactI18next)
  .use(HttpApi)
  .init({
    backend: backendOptions,
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
i18next.changeLanguage(new URL(document.location.href).searchParams.get('lang') ?? navigator.language);
export default i18next;
