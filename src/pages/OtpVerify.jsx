import React, { useState } from 'react';
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
  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = verifyOtp(otp);
    if (result === true) {
      navigate('/home');
    } else if (result && result.error) {
      setError(result.error);
    } else {
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
          <TextField label="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} required fullWidth />
          <Button type="submit" variant="contained" color="primary">Verify OTP</Button>
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </Container>
    </Box>
  );
}
