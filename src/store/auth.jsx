import { create } from 'zustand';
import emailjs from '@emailjs/browser';
import { supabase } from '../chat/supabaseClient';

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
  try { return JSON.parse(localStorage.getItem('auth_user')) || null; } catch { return null; }
};

// OTP
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_USER_ID = import.meta.env.VITE_EMAILJS_USER_ID;

const sendOtpEmail = (email, otp) =>
  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { passcode: otp, email }, EMAILJS_USER_ID);

// Session / multi‑device
const SESSION_KEY = 'auth_session_expiry';
const SESSION_TOKEN_KEY = 'auth_session_token';
const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;

const getStoredSessionExpiry = () => {
  try {
    const v = localStorage.getItem(SESSION_KEY);
    return v ? Number(v) : null;
  } catch {
    return null;
  }
};

const getStoredSessionToken = () => {
  try { return localStorage.getItem(SESSION_TOKEN_KEY) || null; } catch { return null; }
};

const createSessionToken = () =>
  (crypto?.randomUUID?.() || (Date.now().toString(36) + Math.random().toString(36).slice(2)));

function subscribeLogoutChannel(email, onLogout) {
  if (!email) return null;
  const channel = supabase.channel(`logout_all:${email}`);
  channel.on('broadcast', { event: 'logout' }, () => onLogout?.()).subscribe();
  return channel;
}

export const useAuthStore = create((set, get) => ({
  user: getStoredUser(),
  otpSent: false,
  otp: null,
  otpExpiry: null,
  sessionExpiry: getStoredSessionExpiry(),
  sessionToken: getStoredSessionToken(),
  logoutChannel: null,

  login: async (email) => {
    const found = allowedAccounts.find(a => a.email === email);
    if (!found) return false;
    const otp = generateOtp();
    const expiry = Date.now() + 2 * 60 * 1000; // 2 minutes OTP validity
    try { await sendOtpEmail(email, otp); }
    catch {
      set({ otpSent: false, otp: null, otpExpiry: null });
      return { error: 'Failed to send OTP. Please try again.' };
    }
    const user = { email, name: found.name };
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ user, otpSent: true, otp, otpExpiry: expiry });
    return 'otp';
  },

  verifyOtp: (inputOtp) => {
    const { otp, otpExpiry, user } = get();
    if (!/^[0-9]{6}$/.test(inputOtp || '')) return { error: 'OTP must be a 6-digit number.' };
    if (!otp || !otpExpiry || Date.now() > otpExpiry) {
      set({ otpSent: false, otp: null, otpExpiry: null });
      return { error: 'OTP expired. Please login again.' };
    }
    if (inputOtp !== otp) return { error: 'Invalid OTP.' };

    // Success
    const sessionExpiry = Date.now() + FIVE_HOURS_MS;
    const sessionToken = createSessionToken();
    try {
      localStorage.setItem(SESSION_KEY, String(sessionExpiry));
      localStorage.setItem(SESSION_TOKEN_KEY, sessionToken);
    } catch {}

    const logoutChannel = subscribeLogoutChannel(user?.email, () => {
      get().logout({ internal: true });
    });

    set({
      otpSent: false,
      otp: null,
      otpExpiry: null,
      sessionExpiry,
      sessionToken,
      logoutChannel
    });

    return true;
  },

  logout: ({ internal } = {}) => {
    const { logoutChannel } = get();
    if (logoutChannel) {
      try { supabase.removeChannel(logoutChannel); } catch {}
    }
    try { localStorage.removeItem('auth_user'); } catch {}
    try { localStorage.removeItem(SESSION_KEY); } catch {}
    try { localStorage.removeItem(SESSION_TOKEN_KEY); } catch {}
    set({
      user: null,
      otpSent: false,
      otp: null,
      otpExpiry: null,
      sessionExpiry: null,
      sessionToken: null,
      logoutChannel: null
    });
  },

  logoutAllDevices: async () => {
    const { user } = get();
    if (!user?.email) return;
    try {
      supabase.channel(`logout_all:${user.email}`)
        .send({ type: 'broadcast', event: 'logout', payload: { ts: Date.now() } });
    } catch {}
    get().logout({ internal: true });
  },

  extendSession: () => {
    const { user } = get();
    if (!user) return;
    const sessionExpiry = Date.now() + FIVE_HOURS_MS;
    try { localStorage.setItem(SESSION_KEY, String(sessionExpiry)); } catch {}
    set({ sessionExpiry });
  },
}));

// --- Session expiry watchdog (auto logout when expired) ---
let __sessionExpiryInterval;
(function initSessionExpiryWatch() {
  const check = () => {
    const { sessionExpiry, user, logout } = useAuthStore.getState();
    if (user && sessionExpiry && Date.now() > sessionExpiry) {
      logout({});
    }
  };
  check();
  if (!__sessionExpiryInterval) {
    __sessionExpiryInterval = setInterval(check, 60 * 1000);
  }
  window.addEventListener('focus', check);
})();

// --- Rehydrate logout channel after refresh if needed ---
(function rehydrateLogoutChannel() {
  const { user, sessionToken, logoutChannel } = useAuthStore.getState();
  if (user?.email && sessionToken && !logoutChannel) {
    const channel = supabase
      .channel(`logout_all:${user.email}`)
      .on('broadcast', { event: 'logout' }, () => {
        useAuthStore.getState().logout({ internal: true });
      })
      .subscribe();
    useAuthStore.setState({ logoutChannel: channel });
  }
})();

