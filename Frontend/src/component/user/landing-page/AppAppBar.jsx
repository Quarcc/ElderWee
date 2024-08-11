import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import axios from 'axios';

const logoStyle = {
  width: '90px',
  height: 'auto',
  cursor: 'pointer',
};

function AppAppBar() {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get('http://localhost:8000/check-session', { withCredentials: true });
        console.log('Session response:', response.data);
        if (response.data.loggedIn) {
          setLoggedIn(true);
          setUser(response.data.user);
        } else {
          setLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        setLoggedIn(false);
        setUser(null);
        console.error('Session check error:', error);
      }
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8000/logout', {}, { withCredentials: true });
      setLoggedIn(false);
      setUser(null);
      navigate('/landing');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  return (
    <div>
      <AppBar
        position="fixed"
        sx={{
          boxShadow: 0,
          bgcolor: 'transparent',
          backgroundImage: 'none',
          mt: 2,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            variant="regular"
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              borderRadius: '999px',
              bgcolor:
                theme.palette.mode === 'light'
                  ? 'rgba(255, 255, 255, 0.4)'
                  : 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(24px)',
              maxHeight: 40,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow:
                theme.palette.mode === 'light'
                  ? `0 0 1px rgba(85, 166, 246, 0.1), 1px 1.5px 2px -1px rgba(85, 166, 246, 0.15), 4px 4px 12px -2.5px rgba(85, 166, 246, 0.15)`
                  : '0 0 1px rgba(2, 31, 59, 0.7), 1px 1.5px 2px -1px rgba(2, 31, 59, 0.65), 4px 4px 12px -2.5px rgba(2, 31, 59, 0.65)',
            })}
          >
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                ml: '-18px',
                px: 0,
              }}
            >
              <Link to="/home">
                <img
                  src='/elderwee-logo/svg/logo-no-background.svg'
                  style={logoStyle}
                  alt="logo of elderwee"
                />
              </Link>
              <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                {loggedIn && (
                  <>
                    <MenuItem
                      onClick={() => navigate('/home')}
                      sx={{ py: '6px', px: '12px' }}
                    >
                      <Typography variant="body2" color="text.primary">
                        Home
                      </Typography>
                    </MenuItem>
                    <MenuItem
                      onClick={() => navigate('/profile')}
                      sx={{ py: '6px', px: '12px' }}
                    >
                      <Typography variant="body2" color="text.primary">
                        Profile
                      </Typography>
                    </MenuItem>
                  </>
                )}
                <MenuItem
                  onClick={() => navigate('/faq')}
                  sx={{ py: '6px', px: '12px' }}
                >
                  <Typography variant="body2" color="text.primary">
                    FAQ
                  </Typography>
                </MenuItem>
              </Box>
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, alignItems: 'center' }}>
              {!loggedIn ? (
                <>
                  <Button color="primary" variant="text" size="small" onClick={() => navigate('/login')}>
                    Log in
                  </Button>
                  <Button color="primary" variant="contained" size="small" onClick={() => navigate('/signup')}>
                    SignUp
                  </Button>
                </>
              ) : (
                <Button color="primary" variant="contained" size="small" onClick={handleLogout}>
                  Log out
                </Button>
              )}
            </Box>
            <Box sx={{ display: { sm: '', md: 'none' } }}>
              <Button variant="text" color="primary" aria-label="menu" onClick={toggleDrawer(true)} sx={{ minWidth: '30px', p: '4px' }}>
                <MenuIcon />
              </Button>
              <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
                <Box sx={{ minWidth: '60dvw', p: 2, backgroundColor: 'background.paper', flexGrow: 1 }}>
                  {loggedIn && (
                    <>
                      <MenuItem onClick={() => navigate('/home')}>Home</MenuItem>
                      <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
                      <Divider />
                    </>
                  )}
                  <MenuItem onClick={() => navigate('/faq')}>FAQ</MenuItem>
                  <Divider />
                  {!loggedIn ? (
                    <>
                      <MenuItem>
                        <Button color="primary" variant="contained" onClick={() => navigate('/signup')} sx={{ width: '100%' }}>
                          Sign up
                        </Button>
                      </MenuItem>
                      <MenuItem>
                        <Button color="primary" variant="outlined" onClick={() => navigate('/login')} sx={{ width: '100%' }}>
                          Log in
                        </Button>
                      </MenuItem>
                    </>
                  ) : (
                    <MenuItem>
                      <Button color="primary" variant="contained" onClick={handleLogout} sx={{ width: '100%' }}>
                        Log out
                      </Button>
                    </MenuItem>
                  )}
                </Box>
              </Drawer>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </div>
  );
}

export default AppAppBar;
