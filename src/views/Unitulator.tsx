import React from 'react';
import './Unitulator.css';
import { Box, Container } from '@mui/material';
import { useSelector } from 'react-redux';
import TopBar from './components/TopBar';
import SideBar from './components/SideBar';
import { UnitulatorMode, modeSelector } from '../states/mode';
import ModeDifference from './modes/Difference';
import ModeAdditive from './modes/Additive';
import ModeAbsolute from './modes/Absolute';
import ModeLogarithm from './modes/Logarithm';
import ModePercent from './modes/Percent';
import ModeHelp from './modes/Help';

const Unitulator = () => {
  const modeState = useSelector(modeSelector);

  const displayMode = () => {
    switch (modeState.mode) {
      case UnitulatorMode.Difference:
        return <ModeDifference />;
      case UnitulatorMode.Additive:
        return <ModeAdditive />;
      case UnitulatorMode.Absolute:
        return <ModeAbsolute />;
      case UnitulatorMode.Logarithm:
        return <ModeLogarithm />;
      case UnitulatorMode.Percent:
        return <ModePercent />;
      case UnitulatorMode.Help:
        return <ModeHelp />;
    }
  };

  return (
    <div className="Unitulator">
      <Box sx={{ flexGrow: 1 }}>
        <SideBar />
        <header>
          <TopBar />
        </header>
        <main>
          <Container maxWidth="sm">{displayMode()}</Container>
        </main>
      </Box>
    </div>
  );
};

export default Unitulator;
