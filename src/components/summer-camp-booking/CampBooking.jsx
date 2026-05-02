import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { createClient } from '@supabase/supabase-js';
import emailjs from '@emailjs/browser';
import { Search, Calendar, ArrowLeft, CheckCircle } from 'lucide-react';
import './CampBooking.css';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  const [view, setView] = useState('landing'); // landing, booking, search, success
  // State to hold details of the booking just completed
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [windowDimensions, setWindowDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper to reset app state and go home
  const goHome = () => {
    setConfirmedBooking(null);
    setView('landing');
  };

  return (
    <div className="raizen-app-container">
      {view === 'success' && (
        <Confetti 
          width={windowDimensions.width} 
          height={windowDimensions.height} 
          recycle={false}
          // --- UPDATED CONFETTI FX & SPEED ---
          numberOfPieces={400} // Way more paper
          gravity={0.3}         // Falls faster
          initialVelocityY={30} // Shoots up harder initially
          initialVelocityX={10} // Spreads wider
          colors={['#d32f2f', '#ef5350', '#ffffff', '#1f2937', '#6b7280']} // Theme colors
        />
      )}
      
      {view === 'landing' && <LandingView setView={setView} />}
      {view === 'booking' && <BookingFlow setView={setView} setConfirmedBooking={setConfirmedBooking} />}
      {view === 'search' && <SearchView setView={setView} />}
      {view === 'success' && <SuccessView bookingDetails={confirmedBooking} onFinalize={goHome} />}
    </div>
  );
}

// --- 1. LANDING COMPONENT ---
function LandingView({ setView }) {
  return (
    <div className="raizen-card raizen-card--centered">
      <h1 className="raizen-title">Summer Karate Camp</h1>
      <p style={{ color: 'var(--raizen-text-muted)', marginBottom: '2rem' }}>Secure your spot or check your status.</p>
      
      <button className="raizen-btn raizen-btn--primary" onClick={() => setView('booking')}>
        <Calendar size={18} />
        Book a Slot
      </button>
      
      <button className="raizen-btn raizen-btn--secondary" onClick={() => setView('search')}>
        <Search size={18} />
        Check Booking Status
      </button>
    </div>
  );
}

// --- 2. BOOKING FLOW COMPONENT ---
function BookingFlow({ setView, setConfirmedBooking }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ parentName: '', studentName: '', mobile: '', email: '' });
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

    const bookingPayload = { 
        parent_name: formData.parentName, 
        student_name: formData.studentName, 
        mobile: formData.mobile, 
        email: formData.email,
        time_slot: selectedSlot.time
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

    // --- UPDATED logic to store details before showing success ---
    setConfirmedBooking({
        studentName: formData.studentName,
        timeSlot: selectedSlot.time,
        email: formData.email
    });

    // 2. Trigger EmailJS (non-blocking, don't wait for email to show success)
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

    // 3. Go to success screen (Confetti triggers there)
    setView('success');
  };

  return (
    <div className="raizen-card">
      <button className="raizen-btn raizen-btn--icon-only" onClick={() => step === 1 ? setView('landing') : setStep(1)}>
        <ArrowLeft size={20} />
      </button>

      {step === 1 ? (
        <form onSubmit={handleNext}>
          <h2 className="raizen-title">Student Details</h2>
          
          <div className="raizen-input-group">
            <label className="raizen-input-group__label">Parent Name</label>
            <input className="raizen-input-group__field" required type="text" name="parentName" value={formData.parentName} onChange={handleInputChange}  />
          </div>
          <div className="raizen-input-group">
            <label className="raizen-input-group__label">Student Name</label>
            <input className="raizen-input-group__field" required type="text" name="studentName" value={formData.studentName} onChange={handleInputChange}  />
          </div>
          <div className="raizen-input-group">
            <label className="raizen-input-group__label">Mobile Number</label>
            <input className="raizen-input-group__field" required type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange}  pattern="[0-9]{10}" title="Ten digit phone number" />
          </div>
          <div className="raizen-input-group">
            <label className="raizen-input-group__label">Email Address</label>
            <input className="raizen-input-group__field" required type="email" name="email" value={formData.email} onChange={handleInputChange}  />
          </div>

          {error && <p className="raizen-error-text">{error}</p>}
          <button className="raizen-btn raizen-btn--primary" type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Continue to Timing'}
          </button>
        </form>
      ) : (
        <div>
          <h2 className="raizen-title">Select Time Slot</h2>
          <p style={{textAlign:'center', color:'var(--raizen-text-muted)', marginBottom:'1.5rem'}}>For: {formData.studentName}</p>
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
            {loading ? 'Securing Spot...' : `Confirm Booking for ${selectedSlot ? selectedSlot.time : '...'}`}
          </button>
        </div>
      )}
    </div>
  );
}

// --- 3. SEARCH COMPONENT (unchanged) ---
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
      setError('No booking found with these details.');
    } else {
      setResult(data);
    }
    setLoading(false);
  };

  return (
    <div className="raizen-card">
      <button className="raizen-btn raizen-btn--icon-only" onClick={() => setView('landing')}>
        <ArrowLeft size={20} />
      </button>

      <h2 className="raizen-title">Find Your Booking</h2>
      <form onSubmit={handleSearch}>
        <div className="raizen-input-group">
          <label className="raizen-input-group__label">Enter registered Mobile or Email</label>
          <input className="raizen-input-group__field" required type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <button className="raizen-btn raizen-btn--primary" type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p className="raizen-error-text">{error}</p>}

      {result && (
        <div className="raizen-data-box">
          <h3 style={{ marginBottom: '1rem', color: 'green', display:'flex', alignItems:'center', gap:'8px' }}><CheckCircle size={18}/> Booking Confirmed</h3>
          <p><strong>Student:</strong> {result.student_name}</p>
          <p><strong>Time Slot:</strong> {result.time_slot}</p>
        </div>
      )}
    </div>
  );
}

// --- 4. SUCCESS COMPONENT ---
// --- UPDATED to accept and display bookingDetails ---
function SuccessView({ bookingDetails, onFinalize }) {
  // Fallback if data is missing somehow
  if (!bookingDetails) {
      return (
        <div className="raizen-card raizen-card--centered">
            <CheckCircle size={64} color="green" style={{ margin: '0 auto 1rem auto' }} />
            <h2 className="raizen-title">Booking Complete!</h2>
            <button className="raizen-btn raizen-btn--secondary" onClick={onFinalize}>Return Home</button>
        </div>
      )
  }

  return (
    <div className="raizen-card raizen-card--centered">
      <CheckCircle size={64} color="var(--raizen-accent-red)" style={{ margin: '0 auto 1.5rem auto' }} />
      <h2 className="raizen-title">Oss! You're Booked.</h2>
      <p style={{ color: 'var(--raizen-text-muted)', marginBottom: '1.5rem' }}>
        Excited to see you at the Summer Karate Camp.
      </p>

      {/* --- NEW BOOKED DETAILS DISPLAY --- */}
      <ul className="raizen-details-list">
          <li>
              <span>Student</span>
              <span>{bookingDetails.studentName}</span>
          </li>
          <li>
              <span>Training Time</span>
              <span>{bookingDetails.timeSlot}</span>
          </li>
      </ul>

      <p style={{ fontSize: '0.875rem', color: 'var(--raizen-text-muted)', marginBottom: '1.5rem' }}>
        A confirmation email has been sent to <br/><strong>{bookingDetails.email}</strong>.
      </p>

      <button className="raizen-btn raizen-btn--secondary" onClick={onFinalize}>
        Finish & Return Home
      </button>
    </div>
  );
}