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

  // Protected layout (Header + container + Outlet)
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
              {/* Auth redirect root */}
              <Route
                path="/"
                element={user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
              />
              {/* Public */}
              {publicRoutes.map(({ path, component: C }) => (
                <Route key={path} path={path} element={<C />} />
              ))}
              {/* Protected */}
              <Route element={<ProtectedRoute />}>
                {protectedRoutes.map(({ path, component: C }) => (
                  <Route key={path} path={path} element={<C />} />
                ))}
              </Route>
              {/* 404 */}
              <Route path={notFoundRoute.path} element={<notFoundRoute.component />} />
            </Routes>
          </Suspense>
        </Box>
      </Box>
    </>
  );

  return (
    <>
      <CustomContextMenu />
      <BrowserRouter>
        {/* Entire routing handled inside ProtectedLayout (which adapts per auth) */}
        <ProtectedLayout />
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
     
