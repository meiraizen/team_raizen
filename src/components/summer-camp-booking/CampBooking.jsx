import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { createClient } from '@supabase/supabase-js';
import emailjs from '@emailjs/browser';
import { Search, Calendar, ArrowLeft, CheckCircle, CalendarDays } from 'lucide-react';

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
    // Wait exactly 1.2 seconds, then trigger the door opening
    const openTimer = setTimeout(() => {
      setIsOpen(true);
    }, 1200);

    // Wait for the animation to completely finish
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
      <div className={`raizen-splash-door raizen-splash-door--left ${isOpen ? 'is-open' : ''}`}></div>
      <div className={`raizen-splash-door raizen-splash-door--right ${isOpen ? 'is-open' : ''}`}></div>
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
  const [showSplash, setShowSplash] = useState(true); 
  const [view, setView] = useState('landing'); 
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
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      <div className="raizen-app-wrapper">
        {view === 'success' && (
          <Confetti 
            width={windowDimensions.width} 
            height={windowDimensions.height} 
            recycle={false}
            numberOfPieces={800} 
            gravity={0.3}         
             colors={['#da0a1c', '#388eff', '#ff3ade', '#319e23', '#666666', '#9c79f0']}
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
        <h1 className="raizen-title" style={{ marginBottom: '0.5rem' }}>Summer Camp 2026</h1>
        
        {/* --- ADDED: Beautiful Date Badge --- */}
        <div style={{ 
          backgroundColor: 'rgba(218, 10, 28, 0.08)', 
          color: 'var(--raizen-accent-red)', 
          padding: '0.5rem 1rem', 
          borderRadius: '8px', 
          display: 'inline-flex', 
          alignItems: 'center',
          gap: '8px',
          fontWeight: '900', 
          marginBottom: '1.5rem', 
          border: '1px solid rgba(218, 10, 28, 0.2)'
        }}>
          <CalendarDays size={16} /> MAY 11 - MAY 22, 2026
        </div>

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
  const [formData, setFormData] = useState({ 
    parentName: '', 
    studentName: '', 
    gender: '', // Added gender state
    mobile: '', 
    email: '',
    referralSource: '', 
    referralOther: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [availableSlots, setAvailableSlots] = useState([
    { id: '1', time: '8:00 AM to 9:30 AM', status: 'available' }
  ]);
  
  const [selectedSlot, setSelectedSlot] = useState(availableSlots[0]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleNext = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
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

    const finalReferral = formData.referralSource === 'Other' 
      ? `Other: ${formData.referralOther}` 
      : formData.referralSource;

    const bookingPayload = { 
        parent_name: formData.parentName, 
        student_name: formData.studentName, 
        gender: formData.gender, // Included gender in payload
        mobile: formData.mobile, 
        email: formData.email,
        time_slot: selectedSlot.time,
        referral_source: finalReferral 
      };

    const { error: insertError } = await supabase
      .from('camp_bookings')
      .insert([bookingPayload]);

    if (insertError) {
      setError('Failed to lock booking. The slot might have just been taken.');
      setLoading(false);
      return;
    }

    setConfirmedBooking({
        studentName: formData.studentName,
        timeSlot: selectedSlot.time,
        email: formData.email
    });

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

            {/* --- ADDED: Gender Dropdown --- */}
            <div className="raizen-input-group">
              <label className="raizen-input-group__label">Student Gender</label>
              <select 
                className="raizen-input-group__field" 
                name="gender" 
                value={formData.gender} 
                onChange={handleInputChange} 
                required
              >
                <option value="" disabled>Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Not specified">Not specified</option>
              </select>
            </div>

            <div className="raizen-input-group">
              <label className="raizen-input-group__label">What's App Number</label>
              <input className="raizen-input-group__field" required type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange}  pattern="[0-9]{10}" title="Ten digit phone number" />
            </div>
            <div className="raizen-input-group">
              <label className="raizen-input-group__label">Email Address</label>
              <input className="raizen-input-group__field" required type="email" name="email" value={formData.email} onChange={handleInputChange}  />
            </div>

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
                <option value="Friend or family referral">Friend / family referral</option>
                <option value="School">School</option>
                <option value="Instructor recommendation">by Instructor</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Poster / flyer">Poster / flyer</option>
                <option value="Website advertisement">Website ads</option>
                <option value="Other">Other (please specify)</option>
              </select>
            </div>

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
            <h2 className="raizen-title" style={{ marginBottom: '0.5rem' }}>Time slots available for you</h2>
            
            {/* --- ADDED: Date Context Above Student Name --- */}
            <p style={{textAlign:'center', color:'var(--raizen-accent-red)', fontWeight: 900, marginBottom: '0.5rem', fontSize: '0.875rem'}}>
              MAY 11 - MAY 22, 2026
            </p>
            <p style={{textAlign:'center', color:'var(--raizen-text-muted)', marginBottom:'1.5rem', textTransform:'none', fontWeight:400}}>
              Student: {formData.studentName}
            </p>
            
            <div className="raizen-time-grid" style={{ gridTemplateColumns: '1fr' }}>
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
              {loading ? 'Securing Spot...' : 'Book'}
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
            <p><strong style={{textTransform:'none'}}>Camp Dates:</strong> May 11 - May 22, 2026</p>
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

        <ul className="raizen-details-list">
            <li>
                <span>Student</span>
                <span style={{textTransform:'none'}}>{bookingDetails.studentName}</span>
            </li>
            {/* --- ADDED: Dates in Receipt --- */}
            <li>
                <span>Camp Dates</span>
                <span style={{textTransform:'none', fontWeight: '900'}}>May 11 - May 22, 2026</span>
            </li>
            <li>
                <span>Training Time</span>
                <span>{bookingDetails.timeSlot}</span>
            </li>
        </ul>

        <p style={{ fontSize: '0.875rem', color: 'var(--raizen-text-muted)', marginBottom: '1.5rem', textTransform:'none' }}>
          Check your booking confirmation in the<br/><strong style={{color:'var(--raizen-text-main)'}}>Check Booking Status</strong> on the home page.
        </p>

        <button className="raizen-btn raizen-btn--secondary" onClick={onFinalize}>
          Back to home
        </button>
      </div>
    </React.Fragment>
  );
}