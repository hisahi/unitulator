import React from 'react';
import { useTranslation } from 'react-i18next';

const Logarithm = () => {
  const { t } = useTranslation();

  return (
    <div className="Logarithm">
      <h1>{t('main:modeLogarithm')}</h1>
    </div>
  );
};

export default Logarithm;
