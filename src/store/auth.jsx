import { create } from 'zustand';
import emailjs from '@emailjs/browser';

export const allowedAccounts = [
  { id:'1', email: 'bala.raizen@gmail.com',name: 'Bala' },
  { id:'2', email: 'amalesh.raizen@gmail.com',name: 'Amalesh' },
  { id:'3', email: 'samebinezer.raizen@gmail.com',name: 'Ebi' },
  { id:'4', email: 'danjr.raizen@gmail.com',name: 'Dan' },
  { id:'5', email: 'meii.raizen@gmail.com',name: 'Mei' },
  { id:'6', email: 'muthu.raizen@gmail.com',name: 'Muthu' },
  { id:'7', email: 'bsmeiyarasu@gmail.com',name: 'MEi OG' }
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

const SESSION_KEY = 'auth_session_expiry';
const TWO_HOURS_MS = 5 * 60 * 60 * 1000;

const getStoredSessionExpiry = () => {
  try {
    const v = localStorage.getItem(SESSION_KEY);
    return v ? Number(v) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create((set, get) => ({
  user: getStoredUser(),
  otpSent: false,
  otp: null,
  otpExpiry: null,
  sessionExpiry: getStoredSessionExpiry(),
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
      // Store both email and name
      set({ otpSent: true, otp, otpExpiry: expiry, user: { email, name: found.name } });
      localStorage.setItem('auth_user', JSON.stringify({ email, name: found.name }));
      return 'otp';
    }
    return false;
  },
  verifyOtp: (inputOtp) => {
    const { otp, otpExpiry, user } = get();
    if (!inputOtp || inputOtp.length !== 6 || !/^[0-9]{6}$/.test(inputOtp)) {
      return { error: 'OTP must be a 6-digit number.' };
    }
    if (!otp || !otpExpiry || Date.now() > otpExpiry) {
      set({ otpSent: false, otp: null, otpExpiry: null });
      return { error: 'OTP expired. Please login again.' };
    }
    if (inputOtp === otp) {
      // set session expiry ONLY after successful OTP verification
      const sessionExpiry = Date.now() + TWO_HOURS_MS;
      try { localStorage.setItem(SESSION_KEY, String(sessionExpiry)); } catch {}
      set({ otpSent: false, otp: null, otpExpiry: null, sessionExpiry });
      return true;
    }
    return { error: 'Invalid OTP.' };
  },
  logout: () => {
    try { localStorage.removeItem('auth_user'); } catch {}
    try { localStorage.removeItem(SESSION_KEY); } catch {}
    set({ user: null, otpSent: false, otp: null, otpExpiry: null, sessionExpiry: null });
  },
  // Helper to manually refresh session if desired (not used yet)
  extendSession: () => {
    const { user } = get();
    if (!user) return;
    const sessionExpiry = Date.now() + TWO_HOURS_MS;
    try { localStorage.setItem(SESSION_KEY, String(sessionExpiry)); } catch {}
    set({ sessionExpiry });
  },
}));

// --- Auto-expiry watchdog (runs once) ---
let __sessionInterval;
(function initSessionWatcher() {
  const check = () => {
    const { sessionExpiry, logout, user } = useAuthStore.getState();
    if (!user || !sessionExpiry) return;
    if (Date.now() > sessionExpiry) {
      logout();
    }
  };
  // Immediate check on load
  check();
  if (!__sessionInterval) {
    __sessionInterval = setInterval(check, 60 * 1000); // every minute
  }
  // Also check when window regains focus (more responsive)
  window.addEventListener('focus', check);
})();
