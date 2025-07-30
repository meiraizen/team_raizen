import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1565c0',
            contrastText: '#fff',
        },
        secondary: {
            main: '#ff9800',
            contrastText: '#fff',
        },
        raizenRed: {
            main: '#0f0f0f', // Raizen Red
            contrastText: '#fff',
            hover: '#B71C2B', // custom hover color
        },
        background: {
            default: '#f4f6fb',
            paper: '#fff',
        },
        error: {
            main: '#d32f2f',
        },
        success: {
            main: '#388e3c',
        },
        warning: {
            main: '#fbc02d',
        },
        info: {
            main: '#0288d1',
        },
        text: {
            primary: '#212121',
            secondary: '#757575',
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
        h1: { color: '#1565c0' },
        h2: { color: '#1565c0' },
        h3: { color: '#1565c0' },
        h4: { color: '#1565c0' },
        h5: { color: '#1565c0' },
        h6: { color: '#f7fdffff' },
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 2048,
        },
    },
});

export default theme;
