import React, { useState, useMemo, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, Drawer, List, ListItemButton, ListItemText, Divider, Avatar, Menu, MenuItem, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { usePermissions } from '../hooks/usePermissions';
import { MODULES } from '../services/permissions';
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
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:600px)');
  const theme = useTheme();
  const hoverColor = getHoverColor(theme);
  const { canView, isSuperAdmin } = usePermissions();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const toggleMobile = () => setMobileOpen(o => !o);

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentTitle = getTitleFromPath(location.pathname);

  const navItems = useMemo(() => {
    if (!user) return [];
    return [
      canView(MODULES.BILLBOOK) && { label: 'Billbook', path: '/billbook' },
    ].filter(Boolean);
  }, [user, canView]);

  const mobileMenuItems = useMemo(() => {
    if (!user) return [];
    return [
      { label: 'Home', path: '/home' },
      ...navItems,
      ...(isSuperAdmin ? [{ label: 'Manage Users', path: '/user-management' }] : []),
      { label: 'Logout', action: handleLogout },
    ];
  }, [navItems, isSuperAdmin]);

  const handleItemClick = (item) => {
    if (item.path) navigate(item.path);
    else if (item.action) item.action();
  };

  return (
    <>
      <AppBar position="fixed" sx={{ bgcolor: theme.palette.raizenColors.main }}>
        <Toolbar>
          {isMobile && user && (
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleMobile} sx={{ mr: 1 }}>
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          )}
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              ml: isMobile && user ? 1 : 0,
              minWidth: 0
            }}
          >
            {currentTitle === null
              ? (!isMobile && (
                  <img
                    src="/raizenEagle.svg"
                    alt="Raizen Eagle"
                    style={{
                      height: 35,
                      width: 60,
                      transition: 'width .2s,height .2s'
                    }}
                  />
                ))
              : currentTitle}
          </Typography>
          {/* Mobile: place logo on the right when on home (currentTitle === null) */}
          {isMobile && currentTitle === null && (
            <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
              <img
                src="/raizenEagle.svg"
                alt="Raizen Eagle"
                style={{ height: 30, width: 50 }}
              />
            </Box>
          )}
          {!isMobile && user && (
            <Box sx={{ display: 'flex', gap: 5, cursor: 'none', alignItems: 'center' }}>
              <Button color="inherit" component={Link} to="/home" sx={hoverColor}>Home</Button>
              {navItems.map(item => (
                <Button key={item.path} color="inherit" component={Link} to={item.path} sx={hoverColor}>
                  {item.label}
                </Button>
              ))}
              <Tooltip title={user?.email || ''}>
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ ml: 2 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                onClick={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem disabled sx={{ opacity: 0.7 }}>
                  <PersonIcon sx={{ mr: 1 }} fontSize="small" />
                  {user?.user_metadata?.full_name || user?.email}
                </MenuItem>
                <Divider />
                {isSuperAdmin && (
                  <MenuItem onClick={() => navigate('/user-management')}>
                    <ManageAccountsIcon sx={{ mr: 1 }} fontSize="small" />
                    Manage Users
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          )}
          {!isMobile && !user && (
            <Button color="inherit" component={Link} to="/login">Login</Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Spacer to offset fixed AppBar height and prevent overlap */}
      <Box sx={theme.mixins.toolbar} />

      {/* Mobile Drawer */}
      {isMobile && user && (
        <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={toggleMobile}
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            sx: {
              width: 240,
              bgcolor: theme.palette.background.paper,
              pt: 1
            }
          }}
        >
          <Box role="presentation">
            <Box sx={{ display: 'flex', alignItems: 'center', px: 1, pb: 1 }}>
              <Button
                onClick={toggleMobile}
                size="small"
                sx={{ textTransform: 'none' }}
              >
                Back
              </Button>
            </Box>
            <Divider />
            <List>
              {mobileMenuItems.map(item => (
                <ListItemButton
                  key={item.label}
                  onClick={() => handleItemClick(item)}
                  selected={!!item.path && location.pathname === item.path}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </Drawer>
      )}
    </>
  );
}
