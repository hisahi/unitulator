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
import { AddRoad, Help, SyncAlt, Thermostat } from '@mui/icons-material';
import { closeMenu, selectIsMenuOpen } from '../../states/menu';
import { UnitulatorMode, changeMode } from '../../states/mode';
import { useAppDispatch, useAppSelector } from '../../states/hooks';

const SideBar = () => {
  const isMenuOpen = useAppSelector(selectIsMenuOpen);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  return (
    <div className="TopBar">
      <Drawer open={isMenuOpen} onClose={() => dispatch(closeMenu())}>
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
