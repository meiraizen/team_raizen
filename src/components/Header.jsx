import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import raizenEagle from '../assets/raizenEagle.svg'; 
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

// Inline fallback to avoid path resolution issues
const RaizenEagleLogo = (props) => (
  <svg {...props} viewBox="0 0 3918 1490" xmlns="http://www.w3.org/2000/svg">
    <image
      width="3918"
      height="1490"
      href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAD04AAAXSCAYAAAAlzi1EAAAACXBIWXMAAEzlAABM5QF1zvCVAAAGlmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4xLWMwMDAgNzkuZWRhMmIzZiwgMjAyMS8xMS8xNC0xMjozMDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIzLjEgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyMy0wNC0zMFQxNzowMzo0MyswNTozMCIgeG1wOk1vZGlmeURhdGU9IjIwMjUtMDgtMDVUMTg6MzQ6MDkrMDU6MzAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjUtMDgtMDVUMTg6MzQ6MDkrMDU6MzAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjMyYTljZDJkLTcyZTQtMWI0Mi1iYmQ2LTY4MjQ4MzMwNmI5OSIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjQyY2UyOTQ0LTE0MzMtZDE0Ni1iNmFjLTI5MzBhNzE2MmMzNCIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmMwN2M2NmMwLWQ1MzAtYTk0Mi05YmQ2LTEyNmNjZmYwYWRiNSI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6YzA3YzY2YzAtZDUzMC1hOTQyLTliZDYtMTI2Y2NmZjBhZGI1IiBzdEV2dDp3aGVuPSIyMDIzLTA0LTMwVDE3OjAzOjQzKzA1OjMwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjMuMSAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmI2YmM0MDM0LTcxODgtZTI0MC04Yzg5LTI3MjQ4YjMwYjkxMSIgc3RFdnQ6d2hlbj0iMjAyNS0wOC0wNVQxODoyMjo1OCswNTozMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIzLjEgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDozMmE5Y2QyZC03MmU0LTFiNDItYmJkNi02ODI0ODMzMDZiOTkiIHN0RXZ0OndoZW49IjIwMjUtMDgtMDVUMTg6MzQ6MDkrMDU6MzAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMy4xIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4="
    />
  </svg>
);

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
            ? <img
            src={raizenEagle}
            alt="Raizen Eagle"
            height={35}
            width={60} 
            />
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
