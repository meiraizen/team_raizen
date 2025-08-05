import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:600px)');
  const theme = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const hoverColor = {
    // fontWeight: '700',
    transition: 'color 0.5s, text-shadow 0.5s',
    '&:hover': {
      color: theme.palette.raizenColors.white,
      textShadow: [
        '0 0 6px ' + theme.palette.raizenColors.neon_red,
        '0 0 12px ' + theme.palette.raizenColors.neon_red,
        '0 0 20px ' + theme.palette.raizenColors.neon_red,
        '0 0 30px ' + theme.palette.raizenColors.neon_red
      ].join(', ')
    }
  }

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
  const currentTitle = getTitleFromPath(location.pathname);



  return (
    <AppBar position="fixed" sx={{ bgcolor: theme.palette.raizenColors.main }}>
      <Toolbar>
        {isMobile && (
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {currentTitle}
        </Typography>
        {user && (
          <Box sx={{ display: 'flex', gap: 5 }}>
            <Button color="inherit" component={Link} to="/home" sx={hoverColor}>Home</Button>
            <Button color="inherit" component={Link} to="/billbook" sx={hoverColor}>Billbook</Button>
            <Button color="inherit" component={Link} to="/contact" sx={hoverColor}>Contact</Button>
            <Button color="inherit" onClick={handleLogout} sx={hoverColor}>Logout</Button>
          </Box>
        )}
        {!user && (
          <Button color="inherit" component={Link} to="/login" sx={neonButtonSx}>Login</Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
