import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
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
      color: theme.palette.raizenRed.white,
      textShadow: [
        '0 0 6px ' + theme.palette.raizenRed.neon_red,
        '0 0 12px ' + theme.palette.raizenRed.neon_red,
        '0 0 20px ' + theme.palette.raizenRed.neon_red,
        '0 0 30px ' + theme.palette.raizenRed.neon_red
      ].join(', ')
    }
  }

  return (
    <AppBar position="fixed" sx={{ bgcolor: theme.palette.raizenRed.main }}>
      <Toolbar>
        {isMobile && (
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Raizen Management
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
