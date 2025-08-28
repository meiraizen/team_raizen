import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import BillbookFormHandler from '../components/billbook/BillbookFormHandler';
import BackButton from "../components/BackButton.jsx";


export default function Billbook() {
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
       {/* <BackButton /> */}
      <Typography variant="body1" gutterBottom sx={{ color: 'text.secondary' }}>Manage Student bills here. Only authenticated users can access this page.</Typography>
      <BillbookFormHandler />
    </Container>
  );
}
