import React, { useState, useRef, useEffect } from 'react';
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const otpSent = useAuthStore((state) => state.otpSent);
  const navigate = useNavigate();
  const timeoutRef = useRef();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email);
    if (result === 'otp') {
      timeoutRef.current = setTimeout(() => {
        setLoading(false);
        navigate('/otp-verify');
      }, 2000);
    } else if (result && result.error) {
      setLoading(false);
      setError(result.error);
    } else {
      setLoading(false);
      setError('Use Raizen Gmail');
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
          <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required fullWidth disabled={loading} />
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </Button>
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
        {otpSent && !loading && (
          <Alert severity="info" sx={{ mt: 2 }}>OTP sent to your email. Please check and verify.</Alert>
        )}
      </Container>
    </Box>
  );
}
