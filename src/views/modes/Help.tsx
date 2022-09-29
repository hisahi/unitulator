import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

const Help = () => {
  const { t } = useTranslation();

  return (
    <div className="Help">
      <h1>{t('main:help.title')}</h1>
      <p>{t('main:help.description')}</p>
      <p>{t('main:help.modes')}</p>
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>{t('main:help.modes.mode')}</TableCell>
              <TableCell>{t('main:help.modes.description')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell component="th" scope="row">
                {t('main:help.mode.difference.name')}
              </TableCell>
              <TableCell>
                {t('main:help.mode.difference.description')}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th" scope="row">
                {t('main:help.mode.additive.name')}
              </TableCell>
              <TableCell>{t('main:help.mode.additive.description')}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th" scope="row">
                {t('main:help.mode.absolute.name')}
              </TableCell>
              <TableCell>{t('main:help.mode.absolute.description')}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <p>{t('main:help.customize')}</p>
    </div>
  );
};

export default Help;
