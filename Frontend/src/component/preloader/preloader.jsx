import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

function Preload() {
  return (
    <div className="preloader">
        <Box sx={{ display: 'flex' }}>
            <CircularProgress />
        </Box>
    </div>
    
  );
}

export default Preload;