import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

// Styles
const getHoverColor = (theme) => ({
  cursor: 'none',
  position: 'relative',
  transition: 'color 400ms cubic-bezier(0.25, 0.8, 0.25, 1)',
  '&:hover': {
    color: theme.palette.raizenColors.neon_red,
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    left: 0,
    bottom: 2,
    width: '100%',
    height: '3px',
    background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, #fff 50%, rgba(255,255,255,0) 100%)',
    transform: 'scaleX(0)',
    transition: 'transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1)',
    borderRadius: '2px',
    pointerEvents: 'none',
  },
  '&:hover:after': {
    transform: 'scaleX(1)',
  }
});

// Map routes to titles
  // const routeTitles = {
  //   '/home': 'Home',
  //   '/billbook': 'Billbook',
  //   '/contact': 'Contact',
  //   '/login': 'Login',
  //   // add more routes as needed
  // };
  // Get the title for the current route, fallback to default
  // const currentTitle = routeTitles[location.pathname] || 'Raizen Management';

const getTitleFromPath = (pathname) => {
  if (pathname === '/' || pathname === '') return 'Raizen Management';
  if (pathname === '/home') return null;
  return pathname
    .split('/')
    .filter(Boolean)
    .map(segment =>
      segment
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    )
    .join(' / ');
};

export default function Header() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const logoutAllDevices = useAuthStore(state => state.logoutAllDevices);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:600px)');
  const theme = useTheme();
  const hoverColor = getHoverColor(theme);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLogoutAll = async () => {
    if (window.confirm('Logout from all devices?')) {
      try { await logoutAllDevices(); } catch {}
      navigate('/login');
    }
  };

  const currentTitle = getTitleFromPath(location.pathname);

  return (
    <AppBar position="fixed" sx={{ bgcolor: theme.palette.raizenColors.main, }}>
      <Toolbar>
        {isMobile && (
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          {currentTitle === null
            ? <img src='src/assets/raizenEagle.svg' style={{ height: 35, width: 60 }} alt="Raizen Eagle" />
            : currentTitle}
        </Typography>
        {user ? (
          <Box sx={{ display: 'flex', gap: 5,  cursor: 'none' }}>
            <Button color="inherit" component={Link} to="/home" sx={hoverColor}>Home</Button>
            <Button color="inherit" component={Link} to="/billbook" sx={hoverColor}>Billbook</Button>
            <Button color="inherit" component={Link} to="/contact" sx={hoverColor}>Contact</Button>
            <Button color="inherit" onClick={handleLogoutAll} sx={hoverColor}>Logout All</Button>
            <Button color="inherit" onClick={handleLogout} sx={hoverColor}>Logout</Button>
          </Box>
        ) : (
          <Button color="inherit" component={Link} to="/login" sx={neonButtonSx}>Login</Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
