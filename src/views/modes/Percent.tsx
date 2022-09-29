import React from 'react';
import { useTranslation } from 'react-i18next';

const Percent = () => {
  const { t } = useTranslation();

  return (
    <div className="Percent">
      <h1>{t('main:modePercent')}</h1>
    </div>
  );
};

export default Percent;
