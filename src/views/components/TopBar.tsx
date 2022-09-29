import React from 'react';
import { AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { openMenu } from '../../states/menu';

const TopBar = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  return (
    <div className="TopBar">
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => dispatch(openMenu())}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t('main:appName')}
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default TopBar;
