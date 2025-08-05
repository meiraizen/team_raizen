import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/home.jsx';
import Contact from './pages/contact';
import Login from './pages/login';
import Billbook from './pages/billbook';
import NotFound from './pages/NotFound';
import VerifyCertificate from './pages/VerifyCertificate';
import StudentsInfo from './pages/StudentsInfo';
import OtpVerify from './pages/OtpVerify.jsx';
import Box from '@mui/material/Box';
import { useTheme, ThemeProvider } from '@mui/material/styles';
import theme from './themecolor.jsx';
import CustomContextMenu from './components/CustomContextMenu.jsx';

function AppContent() {
  const theme = useTheme();
  return (
    <>
      <CustomContextMenu />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/otp-verify" element={<OtpVerify />} />
          <Route element={<ProtectedRoute />}>
            <Route
              path="*"
              element={
                <>
                  <Header />
                  <Box sx={{ width: '100%'  ,  minHeight: '100vh',}}>
                                   <Box sx={{
                                      // bgcolor: theme.palette.background.default,
                      pt: { xs: 2, sm: 3, md: 6 },
                      pb: { xs: 2, sm: 3, md: 6 },
                      px: { xs: 1, sm: 2, md: 6 },
                      maxWidth: { xs: '100%', sm: '100%', md: '1200px' , xl: '2048px' },
                      margin: '0 auto',
                      // boxShadow: { xs: 'none', md: 3 },
                      transition: 'all 0.3s',
                    }}>
                      <Routes>
                        <Route path="/home" element={<Home />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/billbook" element={<Billbook />} />
                        <Route path="/verify-certificate" element={<VerifyCertificate />} />
                        <Route path="/students-info" element={<StudentsInfo />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Box>
                  </Box>
                </>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <AppContent />
    </ThemeProvider>
  );
}
