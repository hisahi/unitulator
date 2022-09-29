import React from 'react';
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import {
  AddRoad,
  Escalator,
  Help,
  Percent,
  SyncAlt,
  Thermostat,
} from '@mui/icons-material';
import { menuSelector, closeMenu } from '../../states/menu';
import { UnitulatorMode, changeMode } from '../../states/mode';

const SideBar = () => {
  const menuState = useSelector(menuSelector);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  return (
    <div className="TopBar">
      <Drawer open={menuState.open} onClose={() => dispatch(closeMenu())}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => dispatch(closeMenu())}
          onKeyDown={() => dispatch(closeMenu())}
        >
          <List>
            <ListItem
              disablePadding
              onClick={() => dispatch(changeMode(UnitulatorMode.Help))}
            >
              <ListItemButton>
                <ListItemIcon>
                  <Help />
                </ListItemIcon>
                <ListItemText primary={t('main:menu.help')} />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem
              disablePadding
              onClick={() => dispatch(changeMode(UnitulatorMode.Difference))}
            >
              <ListItemButton>
                <ListItemIcon>
                  <SyncAlt />
                </ListItemIcon>
                <ListItemText primary={t('main:menu.difference')} />
              </ListItemButton>
            </ListItem>
            <ListItem
              disablePadding
              onClick={() => dispatch(changeMode(UnitulatorMode.Additive))}
            >
              <ListItemButton>
                <ListItemIcon>
                  <AddRoad />
                </ListItemIcon>
                <ListItemText primary={t('main:menu.additive')} />
              </ListItemButton>
            </ListItem>
            <ListItem
              disablePadding
              onClick={() => dispatch(changeMode(UnitulatorMode.Absolute))}
            >
              <ListItemButton>
                <ListItemIcon>
                  <Thermostat />
                </ListItemIcon>
                <ListItemText primary={t('main:menu.absolute')} />
              </ListItemButton>
            </ListItem>
            {/* <ListItem disablePadding onClick={() => dispatch(changeMode(UnitulatorMode.Logarithm))}>
              <ListItemButton>
                <ListItemIcon>
                  <Escalator />
                </ListItemIcon>
                <ListItemText primary={t('main:menu.logarithm')} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding onClick={() => dispatch(changeMode(UnitulatorMode.Percent))}>
              <ListItemButton>
                <ListItemIcon>
                  <Percent />
                </ListItemIcon>
                <ListItemText primary={t('main:menu.percent')} />
              </ListItemButton>
            </ListItem> */}
          </List>
        </Box>
      </Drawer>
    </div>
  );
};

export default SideBar;
