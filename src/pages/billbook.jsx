import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import BackButton from '../components/BackButton.jsx';

export default function Billbook() {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <BackButton />
      <Typography variant="h4" gutterBottom>Billbook</Typography>
      <Typography variant="body1">Manage your bills here. Only authenticated users can access this page.</Typography>
    </Container>
  );
}
