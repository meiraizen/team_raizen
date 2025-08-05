import { create } from 'zustand';
import emailjs from '@emailjs/browser';

const allowedAccounts = [
  { email: 'bala.raizen@gmail.com' },
  { email: 'amalesh.raizen@gmail.com' },
  { email: 'samebinezer.raizen@gmail.com' },
  { email: 'danjr.raizen@gmail.com' },
  { email: 'meii.raizen@gmail.com' },
  { email: 'muthu.raizen@gmail.com' },
];

const getStoredUser = () => {
  try {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

// Secure random OTP generator (6 digits)
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

// Use environment variables for EmailJS keys
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_USER_ID = import.meta.env.VITE_EMAILJS_USER_ID;

const sendOtpEmail = (email, otp) => {
  return emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    {
      passcode: otp,
      email: email, // Use this if your template's To field is {{email}}
    },
    EMAILJS_USER_ID
  );
};

export const useAuthStore = create((set, get) => ({
  user: getStoredUser(),
  otpSent: false,
  otp: null,
  otpExpiry: null,
  login: async (email) => {
    const found = allowedAccounts.find(
      (acc) => acc.email === email
    );
    if (found) {
      const otp = generateOtp();
      const expiry = Date.now() + 2 * 60 * 1000; // 5 minutes from now
      try {
        await sendOtpEmail(email, otp);
      } catch (e) {
        set({ otpSent: false, otp: null, otpExpiry: null });
        return { error: 'Failed to send OTP. Please try again.' };
      }
      set({ otpSent: true, otp, otpExpiry: expiry, user: { email } });
      localStorage.setItem('auth_user', JSON.stringify({ email }));
      return 'otp';
    }
    return false;
  },
  verifyOtp: (inputOtp) => {
    const { otp, otpExpiry } = get();
    if (!inputOtp || inputOtp.length !== 6 || !/^[0-9]{6}$/.test(inputOtp)) {
      return { error: 'OTP must be a 6-digit number.' };
    }
    if (!otp || !otpExpiry || Date.now() > otpExpiry) {
      set({ otpSent: false, otp: null, otpExpiry: null });
      return { error: 'OTP expired. Please login again.' };
    }
    if (inputOtp === otp) {
      set({ otpSent: false, otp: null, otpExpiry: null });
      return true;
    }
    return { error: 'Invalid OTP.' };
  },
  logout: () => {
    localStorage.removeItem('auth_user');
    set({ user: null, otpSent: false, otp: null, otpExpiry: null });
  },
}));
