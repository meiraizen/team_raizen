import React, { lazy } from 'react';
import PermissionGuard from '../components/PermissionGuard';
import { MODULES } from '../services/permissions';
import { ModalProvider } from '../components/billbook/ModalContext.jsx';

const wrapWithGuard = (Component, moduleKey) => (props) => (
  <PermissionGuard moduleKey={moduleKey}>
    <Component {...props} />
  </PermissionGuard>
);

export const publicRoutes = [
  { path: '/login', component: lazy(() => import('../pages/login')) },
  { path: '/otp-verify', component: lazy(() => import('../pages/OtpVerify.jsx')) },
];

const ReceiptTableLazy = lazy(() => import('../components/billbook/ReceiptTable.jsx'));

export const protectedRoutes = [
  { path: '/home', component: lazy(() => import('../pages/home.jsx')) },
  { path: '/billbook', component: wrapWithGuard(lazy(() => import('../pages/billbook')), MODULES.BILLBOOK) },
  { path: '/verify-certificate', component: wrapWithGuard(lazy(() => import('../pages/VerifyCertificate')), MODULES.CERTIFICATES) },
  { path: '/students-info', component: wrapWithGuard(lazy(() => import('../pages/StudentsInfo')), MODULES.STUDENTS_INFO) },
  { path: '/chat', component: wrapWithGuard(lazy(() => import('../chat/ChatPage.jsx')), MODULES.CHAT) },
  { path: '/onlinedojo', component: wrapWithGuard(lazy(() => import('../components/course/VideoPlaylist')), MODULES.ONLINEDOJO) },
  { path: '/attendance', component: wrapWithGuard(lazy(() => import('../components/attendance/MockAttendance.jsx')), MODULES.ATTENDANCE) },
  { path: '/user-management', component: lazy(() => import('../pages/UserManagement')) },
  { path: '/student-registration', component: wrapWithGuard(lazy(() => import('../pages/RegisterStudent')), MODULES.STUDENT_REGISTRATION) },
  {
    path: '/receipttable', component: (props) => (
      <ModalProvider>
        <ReceiptTableLazy {...props} />
      </ModalProvider>
    ),
  },
];

export const notFoundRoute = { path: '*', component: lazy(() => import('../pages/NotFound')) };
