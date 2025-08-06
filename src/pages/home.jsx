import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import HomeCards from './HomeCards.jsx';
import { useAuthStore } from '../store/auth'; // add import

export default function Home() {
  const user = useAuthStore((state) => state.user); // get user from store

  const welcometxt = {
    welcome: { fontWeight: 600, fontSize: 20, color: "black" },
    name: { fontWeight: 800, fontSize: 24, color: "red" }
  };

  return (
    <Container
      maxWidth="md" 
      sx={{ mt: 4 }}>
      <Typography gutterBottom>
        {user && user.name ? (
          <>
            <span style={welcometxt.welcome}>Welcome Back, </span>
            <span style={welcometxt.name}>{user.name}</span>
          </>
        ) : (
          'Welcome to Raizen Management'
        )}
      </Typography>
      <HomeCards />
    </Container>
  );
}
