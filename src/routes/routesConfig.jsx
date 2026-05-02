import React, { lazy } from 'react';
import { ModalProvider } from '../components/billbook/ModalContext.jsx';

export const publicRoutes = [
  // { path: '/login', component: lazy(() => import('../pages/login')) },
  { path: '/login', component: lazy(() => import("../components/summer-camp-booking/CampBooking.jsx")) },
  { path: '/otp-verify', component: lazy(() => import('../pages/OtpVerify.jsx')) },
  { path: '/meidiet', component: lazy(() => import('../components/Diet/Diet.jsx')) },
  { path: '/lowcal', component: lazy(() => import('../components/low-cal/LowCal.jsx')) },
  { path: '/camp', component: lazy(() => import('../components/summer-camp-booking/AdminDashboard.jsx')) },



];

const ReceiptTableLazy = lazy(() => import('../components/billbook/ReceiptTable.jsx'));


export const protectedRoutes = [
  { path: '/home', component: lazy(() => import('../pages/home.jsx')) },
  { path: '/contact', component: lazy(() => import('../pages/contact')) },
  { path: '/billbook', component: lazy(() => import('../pages/billbook')) },
  { path: '/verify-certificate', component: lazy(() => import('../pages/VerifyCertificate')) },
  { path: '/students-info', component: lazy(() => import('../pages/StudentsInfo')) },
  { path: '/chat', component: lazy(() => import('../chat/ChatPage.jsx')) },
  { path: '/onlinedojo', component: lazy(() => import('../components/course/VideoPlaylist')) },
  {
    path: '/receipttable', component: (props) => (
      <ModalProvider>
        <ReceiptTableLazy {...props} />
      </ModalProvider>
    ),
  },
   { path: '/attendance', component: lazy(() => import('../components/attendance/MockAttendance.jsx')) },
];

export const notFoundRoute = { path: '*', component: lazy(() => import('../pages/NotFound')) };
