import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function Contact() {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Contact Us</Typography>
      <Typography variant="body1">For inquiries, please email us at support@raizen.com.</Typography>
    </Container>
  );
}
