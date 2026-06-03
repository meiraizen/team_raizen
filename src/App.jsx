import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Box from '@mui/material/Box';
import { ThemeProvider } from '@mui/material/styles';
import theme from './themecolor.jsx';
import { useAuthStore } from './store/auth';
import { publicRoutes, protectedRoutes, notFoundRoute } from './routes/routesConfig.jsx';

function AnimatedOutlet({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes({ isAuthenticated }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {isAuthenticated ? (
          <>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/otp-verify" element={<Navigate to="/home" replace />} />
            <Route element={<ProtectedRoute />}>
              {protectedRoutes.map(({ path, component: C }) => (
                <Route key={path} path={path} element={<AnimatedOutlet><C /></AnimatedOutlet>} />
              ))}
              <Route path={notFoundRoute.path} element={<AnimatedOutlet><notFoundRoute.component /></AnimatedOutlet>} />
            </Route>
          </>
        ) : (
          <>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/home" element={<Navigate to="/login" replace />} />
            {publicRoutes.map(({ path, component: C }) => (
              <Route key={path} path={path} element={<AnimatedOutlet><C /></AnimatedOutlet>} />
            ))}
            <Route path={notFoundRoute.path} element={<AnimatedOutlet><notFoundRoute.component /></AnimatedOutlet>} />
          </>
        )}
      </Routes>
    </AnimatePresence>
  );
}

function AppContent() {
  const user = useAuthStore((state) => state.user);
  const sessionExpiry = useAuthStore((state) => state.sessionExpiry);
  const isAuthenticated = !!user && !!sessionExpiry && Date.now() < sessionExpiry;

  return (
    <>
      <BrowserRouter>
        {isAuthenticated && <Header />}
        <Box sx={{
          width: '100%',
          minHeight: '100vh',
          pt: isAuthenticated ? { xs: 7, sm: 8 } : 0,
        }}>
          <Box sx={{
            pt: { xs: 2, sm: 3, md: 6 },
            pb: { xs: 2, sm: 3, md: 6 },
            px: { xs: 1, sm: 2, md: 6 },
            maxWidth: { xs: '100%', sm: '100%', md: '1200px', xl: '2048px' },
            margin: '0 auto',
            transition: 'all 0.3s',
          }}>
            <Suspense fallback={<div>Loading...</div>}>
              <AnimatedRoutes isAuthenticated={isAuthenticated} />
            </Suspense>
          </Box>
        </Box>
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
