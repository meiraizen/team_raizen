import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useAuthStore } from '../store/auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(email, password);
    if (success) {
      navigate('/home');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default',
      p: 0,
      m: 0,
    }}>
      <Container maxWidth="xs" sx={{ boxShadow: 3, borderRadius: 3, py: 4, bgcolor: 'background.paper' }}>
        <Typography variant="h5" gutterBottom>Login</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required fullWidth />
          <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required fullWidth />
          <Button type="submit" variant="contained" color="primary">Login</Button>
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </Container>
    </Box>
  );
}
