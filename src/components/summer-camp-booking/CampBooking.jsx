import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { createClient } from '@supabase/supabase-js';
import emailjs from '@emailjs/browser';
import { Search, Calendar, ArrowLeft, CheckCircle } from 'lucide-react';

// Import your logo here. Adjust the path if it's in an 'assets' folder.
import raizenLogoFullImg from "../../assets/Raizen_Logo.png"; 
import raizenEagleImg from "../../assets/RaizenEagle.svg";
import "./CampBooking.css";

// Initialize Supabase (Ensure these are in your .env file)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// --- NEW SPLASH SCREEN COMPONENT ---
function SplashScreen({ onComplete }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Wait exactly 0.7 seconds, then trigger the door opening
    const openTimer = setTimeout(() => {
      setIsOpen(true);
    }, 1200);

    // Wait for the animation to completely finish (0.7s delay + 0.8s slide + 0.1s buffer)
    // Then unmount this component so it doesn't block clicks on the main screen
    const removeTimer = setTimeout(() => {
      onComplete();
    }, 1600);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(removeTimer);
    };
  }, [onComplete]);

  return (
    <div className="raizen-splash-overlay">
      {/* Left White Door */}
      <div className={`raizen-splash-door raizen-splash-door--left ${isOpen ? 'is-open' : ''}`}></div>
      
      {/* Right White Door */}
      <div className={`raizen-splash-door raizen-splash-door--right ${isOpen ? 'is-open' : ''}`}></div>
      
      {/* Centered Logo */}
      <div className={`raizen-splash-logo-wrapper ${isOpen ? 'is-open' : ''}`}>
        <img 
          src={raizenLogoFullImg} 
          alt="Raizen Karate Fitness" 
          style={{ maxWidth: '250px', width: '80vw', height: 'auto' }} 
        />
      </div>
    </div>
  );
}

// --- REUSABLE LOGO COMPONENT ---
function RaizenLogo() {
  return (
    <div className="raizen-logo-container">
      <img 
        src={raizenEagleImg} 
        alt="Raizen Karate Fitness" 
        className="raizen-logo" 
      />
    </div>
  );
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [showSplash, setShowSplash] = useState(true); // Controls the splash screen visibility
  const [view, setView] = useState('landing'); // landing, booking, search, success
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [windowDimensions, setWindowDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const goHome = () => {
    setConfirmedBooking(null);
    setView('landing');
  };

  return (
    <React.Fragment>
      {/* Render Splash Screen on initial load */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      <div className="raizen-app-wrapper">
        {view === 'success' && (
          <Confetti 
            width={windowDimensions.width} 
            height={windowDimensions.height} 
            recycle={false}
            numberOfPieces={800} // High confetti intensity
            gravity={0.5}         // Fast fall
            initialVelocityY={35} // Hard explosion
            initialVelocityX={25} 
            confettiSource={{ 
              x: windowDimensions.width / 2, 
              y: windowDimensions.height / 2, 
              w: 0, 
              h: 0 
            }} 
            colors={['#da0a1c', '#ef5350', '#ffffff', '#000000', '#666666', '#35a73a']} // Precise theme colors
          />
        )}
        
        {view === 'landing' && <LandingView setView={setView} />}
        {view === 'booking' && <BookingFlow setView={setView} setConfirmedBooking={setConfirmedBooking} />}
        {view === 'search' && <SearchView setView={setView} />}
        {view === 'success' && <SuccessView bookingDetails={confirmedBooking} onFinalize={goHome} />}
      </div>
    </React.Fragment>
  );
}

// --- 1. LANDING COMPONENT ---
function LandingView({ setView }) {
  return (
    <React.Fragment>
      <RaizenLogo />
      <div className="raizen-card raizen-card--centered">
        <h1 className="raizen-title">Summer Camp 2026</h1>
        <p style={{ color: 'var(--raizen-text-muted)', marginBottom: '2rem' }}>Don’t wait. Join © Raizen Karate Fitness</p>
        
        <button className="raizen-btn raizen-btn--primary" onClick={() => setView('booking')}>
          <Calendar size={18} />
          Book Now
        </button>
        
        <button className="raizen-btn raizen-btn--secondary" onClick={() => setView('search')}>
          <Search size={18} />
          Check your Booking
        </button>
      </div>
    </React.Fragment>
  );
}

// --- 2. BOOKING FLOW COMPONENT ---
function BookingFlow({ setView, setConfirmedBooking }) {
  const [step, setStep] = useState(1);
  // --- UPDATED: Added referral tracking to state ---
  const [formData, setFormData] = useState({ 
    parentName: '', 
    studentName: '', 
    mobile: '', 
    email: '',
    referralSource: '', 
    referralOther: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [availableSlots, setAvailableSlots] = useState([
    { id: '1', time: '06:00 AM - 07:00 AM', status: 'available' },
    { id: '2', time: '07:00 AM - 08:00 AM', status: 'available' },
    { id: '3', time: '05:00 PM - 06:00 PM', status: 'available' },
    { id: '4', time: '06:00 PM - 07:00 PM', status: 'available' },
  ]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleNext = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Duplicate check
    const { data, error: dbError } = await supabase
      .from('camp_bookings')
      .select('id')
      .or(`email.eq.${formData.email},mobile.eq.${formData.mobile}`);

    if (dbError) {
        setError('Database connection error. Please try again.');
        setLoading(false);
        return;
    }

    if (data && data.length > 0) {
      setError('This Email or Mobile number is already registered.');
      setLoading(false);
      return;
    }

    setStep(2);
    setLoading(false);
  };

  const handleBooking = async () => {
    if (!selectedSlot) {
      setError('Please select a time slot.');
      return;
    }
    setLoading(true);
    setError('');

    // Figure out the final referral string to save to the database
    const finalReferral = formData.referralSource === 'Other' 
      ? `Other: ${formData.referralOther}` 
      : formData.referralSource;

    const bookingPayload = { 
        parent_name: formData.parentName, 
        student_name: formData.studentName, 
        mobile: formData.mobile, 
        email: formData.email,
        time_slot: selectedSlot.time,
        referral_source: finalReferral // Make sure this column exists in Supabase!
      };

    // 1. Insert to Supabase
    const { error: insertError } = await supabase
      .from('camp_bookings')
      .insert([bookingPayload]);

    if (insertError) {
      setError('Failed to lock booking. The slot might have just been taken.');
      setLoading(false);
      return;
    }

    // Capture dynamic details for the success screen
    setConfirmedBooking({
        studentName: formData.studentName,
        timeSlot: selectedSlot.time,
        email: formData.email
    });

    // 2. Trigger EmailJS
    emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        to_email: formData.email,
        parent_name: formData.parentName,
        student_name: formData.studentName,
        time_slot: selectedSlot.time
      },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    ).catch((err) => console.error('Email notification failed:', err));

    // 3. Go to success screen
    setView('success');
  };

  return (
    <React.Fragment>
      <RaizenLogo />
      <div className="raizen-card">
        <button className="raizen-btn raizen-btn--icon-only" onClick={() => step === 1 ? setView('landing') : setStep(1)}>
          <ArrowLeft size={20} />
        </button>

        {step === 1 ? (
          <form onSubmit={handleNext}>
            <h2 className="raizen-title">Student Details</h2>
            
            <div className="raizen-input-group">
              <label className="raizen-input-group__label">Parent Name</label>
              <input className="raizen-input-group__field" required type="text" name="parentName" value={formData.parentName} onChange={handleInputChange} />
            </div>
            <div className="raizen-input-group">
              <label className="raizen-input-group__label">Student Name</label>
              <input className="raizen-input-group__field" required type="text" name="studentName" value={formData.studentName} onChange={handleInputChange} />
            </div>
            <div className="raizen-input-group">
              <label className="raizen-input-group__label">Mobile Number</label>
              <input className="raizen-input-group__field" required type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange}  pattern="[0-9]{10}" title="Ten digit phone number" />
            </div>
            <div className="raizen-input-group">
              <label className="raizen-input-group__label">Email Address</label>
              <input className="raizen-input-group__field" required type="email" name="email" value={formData.email} onChange={handleInputChange}  />
            </div>

            {/* --- NEW REFERRAL DROPDOWN --- */}
            <div className="raizen-input-group">
              <label className="raizen-input-group__label">How did you find this camp?</label>
              <select 
                className="raizen-input-group__field" 
                name="referralSource" 
                value={formData.referralSource} 
                onChange={handleInputChange} 
                required
              >
                <option value="" disabled>Select an option</option>
                <option value="Google search">Google search</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="Friend or family referral">Friend or family referral</option>
                <option value="School">School</option>
                <option value="Instructor recommendation">Instructor recommendation</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Poster / flyer">Poster / flyer</option>
                <option value="Website advertisement">Website advertisement</option>
                <option value="Other">Other (please specify)</option>
              </select>
            </div>

            {/* --- CONDITIONAL "OTHER" TEXT INPUT --- */}
            {formData.referralSource === 'Other' && (
              <div className="raizen-input-group">
                <label className="raizen-input-group__label">Please specify</label>
                <input 
                  className="raizen-input-group__field" 
                  required 
                  type="text" 
                  name="referralOther" 
                  value={formData.referralOther} 
                  onChange={handleInputChange} 
                  placeholder="Tell us where..."
                />
              </div>
            )}

            {error && <p className="raizen-error-text">{error}</p>}
            <button className="raizen-btn raizen-btn--primary" type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Continue to Timing'}
            </button>
          </form>
        ) : (
          <div>
            <h2 className="raizen-title">Select Time Slot</h2>
            <p style={{textAlign:'center', color:'var(--raizen-text-muted)', marginBottom:'1.5rem', textTransform:'none', fontWeight:400}}>Student: {formData.studentName}</p>
            <div className="raizen-time-grid">
              {availableSlots.map((slot) => (
                <div 
                  key={slot.id} 
                  className={`raizen-time-slot ${slot.status === 'booked' ? 'raizen-time-slot--booked' : ''} ${selectedSlot?.id === slot.id ? 'raizen-time-slot--selected' : ''}`}
                  onClick={() => slot.status !== 'booked' && setSelectedSlot(slot)}
                >
                  {slot.time}
                </div>
              ))}
            </div>
            {error && <p className="raizen-error-text">{error}</p>}
            <button className="raizen-btn raizen-btn--primary" onClick={handleBooking} disabled={loading || !selectedSlot}>
              {loading ? 'Securing Spot...' : 'Confirm Booking'}
            </button>
          </div>
        )}
      </div>
    </React.Fragment>
  );
}

// --- 3. SEARCH COMPONENT ---
function SearchView({ setView }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const { data, error } = await supabase
      .from('camp_bookings')
      .select('*')
      .or(`email.eq.${searchTerm},mobile.eq.${searchTerm}`)
      .single();

    if (error || !data) {
      setError('No entry found for the provided Mobile or Email.');
    } else {
      setResult(data);
    }
    setLoading(false);
  };

  return (
    <React.Fragment>
      <RaizenLogo />
      <div className="raizen-card">
        <button className="raizen-btn raizen-btn--icon-only" onClick={() => setView('landing')}>
          <ArrowLeft size={20} />
        </button>

        <h2 className="raizen-title">Find Your Booking</h2>
        <form onSubmit={handleSearch}>
          <div className="raizen-input-group">
            <label className="raizen-input-group__label">Enter registered Mobile or Email</label>
            <input className="raizen-input-group__field" required type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}  />
          </div>
          <button className="raizen-btn raizen-btn--primary" type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <p className="raizen-error-text">{error}</p>}

        {result && (
          <div className="raizen-data-box">
            <h3 style={{ marginBottom: '1rem', color: 'green', display:'flex', alignItems:'center', gap:'8px' }}><CheckCircle size={18}/> Booking Confirmed</h3>
            <p><strong style={{textTransform:'none'}}>Student:</strong> <span style={{textTransform:'none'}}>{result.student_name}</span></p>
            <p><strong style={{textTransform:'none'}}>Time Slot:</strong> {result.time_slot}</p>
          </div>
        )}
      </div>
    </React.Fragment>
  );
}

// --- 4. SUCCESS COMPONENT ---
function SuccessView({ bookingDetails, onFinalize }) {
  if (!bookingDetails) {
      return (
        <React.Fragment>
          <RaizenLogo />
          <div className="raizen-card raizen-card--centered">
              <CheckCircle size={64} color="green" style={{ margin: '0 auto 1rem auto' }} />
              <h2 className="raizen-title">Booking Complete!</h2>
              <button className="raizen-btn raizen-btn--secondary" onClick={onFinalize}>Return Home</button>
          </div>
        </React.Fragment>
      )
  }

  return (
    <React.Fragment>
      <RaizenLogo />
      <div className="raizen-card raizen-card--centered">
        <CheckCircle size={64} color="var(--raizen-accent-green)" style={{ margin: '0 auto 1.5rem auto' }} />
        <h2 className="raizen-title">Successfully booked!</h2>
        <p style={{ color: 'var(--raizen-text-muted)', marginBottom: '1.5rem' }}>RAIZEN KARATE FITNESS - SUMMER CAMP 2026</p>

        {/* --- DYNAMIC BOOKED DETAILS DISPLAY --- */}
        <ul className="raizen-details-list">
            <li>
                <span>Student</span>
                <span style={{textTransform:'none'}}>{bookingDetails.studentName}</span>
            </li>
            <li>
                <span>Training Time</span>
                <span>{bookingDetails.timeSlot}</span>
            </li>
        </ul>

        <p style={{ fontSize: '0.875rem', color: 'var(--raizen-text-muted)', marginBottom: '1.5rem', textTransform:'none' }}>
          A confirmation email has been sent to<br/><strong style={{color:'var(--raizen-text-main)'}}>{bookingDetails.email}</strong>.
        </p>

        <button className="raizen-btn raizen-btn--secondary" onClick={onFinalize}>
          Back to home
        </button>
      </div>
    </React.Fragment>
  );
}