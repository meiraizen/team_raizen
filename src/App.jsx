import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Box from '@mui/material/Box';
import { ThemeProvider } from '@mui/material/styles';
import theme from './themecolor.jsx';
import CustomContextMenu from './components/CustomContextMenu.jsx';
import { useAuthStore } from './store/auth';
import { publicRoutes, protectedRoutes, notFoundRoute } from './routes/routesConfig.jsx';

function AppContent() {
  const user = useAuthStore((state) => state.user);
  const sessionExpiry = useAuthStore((state) => state.sessionExpiry);
  const isAuthenticated = !!user && !!sessionExpiry && Date.now() < sessionExpiry;

  // Protected layout (shows Header and protected routes)
  const ProtectedLayout = () => (
    <>
      <Header />
      <Box sx={{ width: '100%', minHeight: '100vh' }}>
        <Box sx={{
          pt: { xs: 2, sm: 3, md: 6 },
          pb: { xs: 2, sm: 3, md: 6 },
          px: { xs: 1, sm: 2, md: 6 },
          maxWidth: { xs: '100%', sm: '100%', md: '1200px', xl: '2048px' },
          margin: '0 auto',
          transition: 'all 0.3s',
        }}>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              {/* Always redirect / and /otp-verify to /home if authenticated */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/otp-verify" element={<Navigate to="/home" replace />} />
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                {protectedRoutes.map(({ path, component: C }) => (
                  <Route key={path} path={path} element={<C />} />
                ))}
                {/* 404 for logged-in users */}
                <Route path={notFoundRoute.path} element={<notFoundRoute.component />} />
              </Route>
            </Routes>
          </Suspense>
        </Box>
      </Box>
    </>
  );

  // Public layout (no Header, only for unauthenticated users)
  const PublicLayout = () => (
    <Box sx={{ width: '100%', minHeight: '100vh' }}>
      <Box sx={{
        pt: { xs: 2, sm: 3, md: 6 },
        pb: { xs: 2, sm: 3, md: 6 },
        px: { xs: 1, sm: 2, md: 6 },
        maxWidth: { xs: '100%', sm: '100%', md: '1200px', xl: '2048px' },
        margin: '0 auto',
        transition: 'all 0.3s',
      }}>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            {/* Always redirect /home and protected routes to /login if not authenticated */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/home" element={<Navigate to="/login" replace />} />
            {/* Public routes */}
            {publicRoutes.map(({ path, component: C }) => (
              <Route key={path} path={path} element={<C />} />
            ))}
            {/* 404 for not logged-in users */}
            <Route path={notFoundRoute.path} element={<notFoundRoute.component />} />
          </Routes>
        </Suspense>
      </Box>
    </Box>
  );

  return (
    <>
      <CustomContextMenu />
      <BrowserRouter>
        {isAuthenticated ? <ProtectedLayout /> : <PublicLayout />}
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
