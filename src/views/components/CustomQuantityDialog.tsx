import React, { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, Stack, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Quantity, quantitySearchKey, parseQuantityFromKey, quantityConstructionToFormula } from '../../core/quantity';
import { SCALAR_QUANTITY, QUANTITIES } from '../../data/quantity';
import { QuantityGroup } from '../lib/units';
import { getLocalizedQuantityName, makeLiteralQuantityName } from '../../services/quantityText';
import QuantityPicker from './QuantityPicker';

const allQuantitiesFlat: QuantityGroup[] = [{ label: '', quantities: QUANTITIES }];

const CustomQuantityDialog = ({ open, defaultQuantity, onClose, onSubmit }: { open: boolean, defaultQuantity: Quantity | null, onClose: () => void, onSubmit: (quantity: Quantity) => void }) => {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(defaultQuantity ?? SCALAR_QUANTITY);
  const [quantityName, setQuantityName] = useState((defaultQuantity != null) ? getLocalizedQuantityName(defaultQuantity.name, t) : '');
  const [partQuantity, setPartQuantity] = useState<Quantity | null>(null);
  const [powerValue, setPowerValue] = useState<number>(1);
  const [sourceDialogOpen, setSourceDialogOpen] = useState<boolean>(false);
  const [sourceDialogError, setSourceDialogError] = useState<boolean>(false);
  const [sourceDialogText, setSourceDialogText] = useState<string>('');

  const updatePowerValue = (value: string) => {
    const n = Number(value);
    if (!n || n < 1 || n > 9) {
      setPowerValue(NaN);
    } else {
      setPowerValue(n);
    }
  };

  const submit = () => {
    onSubmit({ ...quantity, name: makeLiteralQuantityName(quantityName) });
    onCloseSourceDialog();
    onClose();
  };

  const onCloseWrapper = (event: object, reason: string) => {
    if (reason !== 'backdropClick') {
      onCloseSourceDialog();
      onClose();
    }
  };

  const onCloseSourceDialog = () => setSourceDialogOpen(false);

  const onSubmitSourceDialog = () => {
    const parsedQuantity = parseQuantityFromKey('', sourceDialogText);
    if (parsedQuantity === null) {
      setSourceDialogError(true);
    } else {
      setSourceDialogError(false);
      setQuantity(parsedQuantity);
      onCloseSourceDialog();
    }
  };

  const resetToPartQuantity = () => {
    const newQuantity = partQuantity;
    if (newQuantity != null) {
      if (powerValue > 1) {
        setQuantity(Quantity.extendQuantity('', newQuantity, [...Array(powerValue - 1).fill(newQuantity)], []));
      } else {
        setQuantity(newQuantity);
      }
    }
  };

  const multiplyByPartQuantity = () => {
    const newQuantity = partQuantity;
    if (newQuantity != null) {
      setQuantity(Quantity.extendQuantity('', quantity, [...Array(powerValue).fill(newQuantity)], []));
    }
  };

  const divideByPartQuantity = () => {
    const newQuantity = partQuantity;
    if (newQuantity != null) {
      setQuantity(Quantity.extendQuantity('', quantity, [], [...Array(powerValue).fill(newQuantity)]));
    }
  };

  const onSourceButton = () => {
    setSourceDialogText(quantitySearchKey(quantity));
    setSourceDialogError(false);
    setSourceDialogOpen(true);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onCloseWrapper}
        aria-labelledby="custom-quantity-dialog-title"
        fullWidth
      >
        <DialogTitle id="custom-quantity-dialog-title">
          {t('main:customQuantityDialog.title')}
        </DialogTitle>
        <DialogContent>
          <Box style={ { alignItems: 'stretch', minHeight: '500px', flexDirection: 'column' } }>
            <Stack spacing={2}>
              <TextField fullWidth value={quantityName} onChange={e => setQuantityName(e.target.value)} label={t('main:customQuantityDialog.name')} required />
              <TextField fullWidth value={quantityConstructionToFormula(quantity)} label={t('main:customQuantityDialog.formula')} variant="filled" inputProps={{ readOnly: true }} />
              <Divider />
              <Grid container spacing={0}>
                <Grid item xs={8} p={1}>
                  <QuantityPicker quantityGroups={allQuantitiesFlat} value={(partQuantity != null) ? { quantity: partQuantity, custom: false } : null} onChange={p => setPartQuantity(p.quantity)} allowCustom={false} />
                </Grid>
                <Grid item xs={4} p={1}>
                  <TextField type="number" label={t('main:customQuantityDialog.power')} inputProps={{ style: { textAlign: 'end' }, min: 1, max: 9 }} value={powerValue} onChange={e => updatePowerValue(e.target.value)} error={!powerValue} fullWidth />
                </Grid>
                <Grid item xs={12} p={1}>
                  <Grid container spacing={1}>
                    <Grid item xs>
                      <Button fullWidth onClick={() => resetToPartQuantity()} disabled={partQuantity == null}>{t('main:customQuantityDialog.set')}</Button>
                    </Grid>
                    <Grid item xs>
                      <Button fullWidth onClick={() => multiplyByPartQuantity()} disabled={partQuantity == null}>{t('main:customQuantityDialog.multiply')}</Button>
                    </Grid>
                    <Grid item xs>
                      <Button fullWidth onClick={() => divideByPartQuantity()} disabled={partQuantity == null}>{t('main:customQuantityDialog.divide')}</Button>
                    </Grid>
                    {/*
                    <Grid item xs>
                      <Button fullWidth onClick={() => simplify()}>{t('main:customQuantityDialog.simplify')}</Button>
                    </Grid>
                    */}
                  </Grid>
                </Grid>
              </Grid>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onSourceButton}>{t('main:customQuantityDialog.source')}</Button>
          <Button onClick={onClose}>{t('main:cancel')}</Button>
          <Button onClick={submit} disabled={!quantityName} autoFocus>{t('main:ok')}</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={sourceDialogOpen}
        onClose={onCloseSourceDialog}
        aria-labelledby="custom-quantity-source-dialog-title"
        fullWidth
      >
        <DialogTitle id="custom-quantity-source-dialog-title">
          {t('main:customQuantityDialog.source')}
        </DialogTitle>
        <DialogContent>
          <br />
          <Stack spacing={2}>
            <TextField fullWidth value={sourceDialogText} onChange={e => setSourceDialogText(e.target.value)} label={t('main:customQuantityDialog.source')} error={sourceDialogError} />
          </Stack>
          <br />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseSourceDialog}>{t('main:cancel')}</Button>
          <Button onClick={onSubmitSourceDialog}>{t('main:ok')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomQuantityDialog;
