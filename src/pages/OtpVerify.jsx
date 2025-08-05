import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useAuthStore } from '../store/auth';
import { useNavigate } from 'react-router-dom';

export default function OtpVerify() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const otpExpiry = useAuthStore((state) => state.otpExpiry);
  const navigate = useNavigate();
  const timeoutRef = React.useRef();

  useEffect(() => {
    if (!otpExpiry) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((otpExpiry - Date.now()) / 1000));
      setTimer(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        navigate('/login');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [otpExpiry, navigate]);

  useEffect(() => {
    if (otpExpiry) {
      setTimer(Math.max(0, Math.floor((otpExpiry - Date.now()) / 1000)));
    }
  }, [otpExpiry]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = verifyOtp(otp);
    if (result === true) {
      timeoutRef.current = setTimeout(() => {
        setLoading(false);
        navigate('/home');
      }, 2000);
    } else if (result && result.error) {
      setLoading(false);
      setError(result.error);
    } else {
      setLoading(false);
      setError('Invalid OTP');
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
        <Typography variant="h5" gutterBottom>OTP Verification</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} required fullWidth disabled={loading} />
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Verify OTP'}
          </Button>
          {timer > 0 && (
            <Alert
              severity={timer <= 20 ? 'error' : timer <= 90 ? 'warning' : 'info'}
              sx={timer <= 20 ? { bgcolor: 'error.main', color: 'white' } : timer <= 90 ? { bgcolor: 'warning.main', color: 'black' } : {}}
            >
              OTP expires in {timer} second{timer !== 1 ? 's' : ''}.
            </Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </Container>
    </Box>
  );
}
