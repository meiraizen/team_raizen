import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import HomeCards from './HomeCards.jsx';

export default function Home() {
  return (
    <Container
      maxWidth="md" 
    sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Welcome to Raizen Management</Typography>
      <HomeCards />
    </Container>
  );
}
