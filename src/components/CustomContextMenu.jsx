import React, { useState, useEffect, useRef } from 'react';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';
import { useAuthStore } from '../store/auth';

const menuItems = [
  { label: 'Copy', icon: <ContentCopyIcon fontSize="small" /> },
  { label: 'Paste', icon: <ContentPasteIcon fontSize="small" /> },
  { label: 'Cut', icon: <ContentCutIcon fontSize="small" /> },
  { label: 'Download', icon: <DownloadIcon fontSize="small" /> },
  { label: 'Delete', icon: <DeleteIcon fontSize="small" />, divider: false },
];

export default function CustomContextMenu({ mode = "light" }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [menuKey, setMenuKey] = useState(0); // force re-render for animation
  const theme = useTheme();
  const menuRef = useRef(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const handleContextMenu = (e) => {
      if (!user) {
        e.preventDefault();
        setVisible(false);
        return;
      }
      e.preventDefault();
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(false); // reset first
      setTimeout(() => {
        setMenuKey((prev) => prev + 1); // change key to force re-mount
        setVisible(true);
      }, 0);
    };
    const handleClick = () => setVisible(false);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);
    window.addEventListener('blur', handleClick);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
      window.removeEventListener('blur', handleClick);
    };
  }, [user]);

  // Theme styles for light and dark
  const styles = mode === "dark"
    ? {
        background: 'linear-gradient(45deg, rgba(10,20,28,0.2) 0%, rgba(10,20,28,0.7) 100%)',
        color: '#fff',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 2px 2px rgb(0 0 0 / 3%), 0 4px 4px rgb(0 0 0 / 4%), 0 10px 8px rgb(0 0 0 / 5%), 0 15px 15px rgb(0 0 0 / 6%), 0 30px 30px rgb(0 0 0 / 7%), 0 70px 65px rgb(0 0 0 / 9%)',
        borderColor: 'rgba(255,255,255,0.1)',
        hoverBg: 'rgba(255,255,255,0.1)',
        hoverColor: theme.palette.raizenRed.contrastText,
        iconColor: '#fff',
      }
    : mode === "white"
    ? {
        background: 'rgba(255, 255, 255)', // glassmorphism
        color: 'rgb(10,20,28)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        border: '1px solid rgba(255,255,255,0.18)',
        borderColor: 'rgba(0,0,0,0.1)',
        hoverBg: 'rgba(10,20,28,0.09)',
        hoverColor: theme.palette.raizenRed.main,
        iconColor: 'rgb(10,20,28)',
        backdropFilter: 'blur(1px)', // stronger blur
      }
    : {
        background: 'linear-gradient(45deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.85) 100%)',
        color: 'rgb(10,20,28)',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 2px 2px rgb(0 0 0 / 3%), 0 4px 4px rgb(0 0 0 / 4%), 0 10px 8px rgb(0 0 0 / 5%), 0 15px 15px rgb(0 0 0 / 6%), 0 30px 30px rgb(0 0 0 / 7%), 0 70px 65px rgb(0 0 0 / 9%)',
        borderColor: 'rgba(0,0,0,0.1)',
        hoverBg: 'rgba(10,20,28,0.09)',
        hoverColor: theme.palette.raizenRed.main,
        iconColor: 'rgb(10,20,28)',
      };

  return visible ? (
    <Paper
      key={menuKey}
      ref={menuRef}
      sx={{
        position: 'fixed',
        top: pos.y,
        left: pos.x,
        zIndex: 9999,
        minWidth: 180,
        bgcolor: 'transparent',
        background: styles.background,
        backdropFilter: styles.backdropFilter || 'blur(5px)',
        boxShadow: styles.boxShadow,
        borderRadius: 2,
        border: styles.border || undefined,
        p: 0.5,
        overflow: 'hidden',
        animation: 'menuAnimation 0.4s both',
        transformOrigin: 'left',
      }}
      elevation={8}
    >
      <MenuList autoFocus>
        {menuItems.map((item, idx) => (
          <MenuItem
            key={item.label}
            divider={item.divider}
            sx={{
              color: styles.color,
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              borderTop: item.divider ? `1px solid ${styles.borderColor}` : undefined,
              '&:hover': {
                backgroundColor: styles.hoverBg,
                color: styles.hoverColor,
              },
              transition: 'all 0.2s',
              animation: 'menuItemAnimation 0.2s both',
              animationDelay: `${idx * 0.08}s`,
            }}
            onClick={() => setVisible(false)}
          >
            {item.icon && <ListItemIcon sx={{ color: styles.iconColor, minWidth: 32 }}>{item.icon}</ListItemIcon>}
            <Typography variant="inherit">{item.label}</Typography>
          </MenuItem>
        ))}
      </MenuList>
      <style>{`
        @keyframes menuAnimation {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; border-radius: 8px; transform: scale(1); }
        }
        @keyframes menuItemAnimation {
          0% { opacity: 0; transform: translateX(-10px); }
          100% { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </Paper>
  ) : null;
}
