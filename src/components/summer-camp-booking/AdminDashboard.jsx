import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, LogOut, RefreshCw, Calendar, Users, Phone } from 'lucide-react';
import './camp-booking-admin.css';

// Initialize Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const ADMIN_PIN = '2026';

export default function AdminDashboard({ onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSlot, setFilterSlot] = useState('All');

  const availableSlots = [
    'All',
    '06:00 AM - 07:00 AM',
    '07:00 AM - 08:00 AM',
    '05:00 PM - 06:00 PM',
    '06:00 PM - 07:00 PM',
  ];

  // Fetch data only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Incorrect PIN. Access Denied.');
      setPinInput('');
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    
    const { data, error: dbError } = await supabase
      .from('camp_bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) {
      setError('Failed to fetch data from database.');
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.mobile.includes(searchTerm) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesSlot = filterSlot === 'All' || booking.time_slot === filterSlot;

    return matchesSearch && matchesSlot;
  });

  if (!isAuthenticated) {
    return (
      <div className="camp-admin-auth-wrapper">
        <div className="camp-admin-auth-card">
          <h2 className="camp-admin-title">Admin Access</h2>
          <p className="camp-admin-subtitle">Enter PIN to view camp bookings</p>
          
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.25rem' }}>
              <input 
                type="password" 
                className="camp-admin-input" 
                placeholder="Enter PIN" 
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                maxLength={4}
                required
              />
            </div>
            {pinError && <p className="camp-admin-error">{pinError}</p>}
            <button type="submit" className="camp-admin-btn camp-admin-btn--primary">
              Unlock Dashboard
            </button>
          </form>
          
          <button onClick={onClose} className="camp-admin-btn camp-admin-btn--secondary" style={{marginTop: '1rem'}}>
            Back to Site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="camp-admin-dashboard">
      <div className="camp-admin-header">
        <div>
          <h1 className="camp-admin-title" style={{marginBottom: 0, textAlign: 'left'}}>Camp Roster</h1>
          <p className="camp-admin-subtitle" style={{marginBottom: 0}}>Total Bookings: <strong style={{color: 'var(--camp-admin-text-main)'}}>{filteredBookings.length}</strong></p>
        </div>
        <div className="camp-admin-header-actions">
          <button onClick={fetchBookings} className="camp-admin-icon-btn" title="Refresh Data">
            <RefreshCw size={20} className={loading ? 'camp-admin-spin' : ''} />
          </button>
          <button onClick={onClose} className="camp-admin-btn camp-admin-btn--secondary">
            <LogOut size={16} /> Exit Admin
          </button>
        </div>
      </div>

      <div className="camp-admin-filters">
        <div className="camp-admin-search-box">
          <Search size={18} className="camp-admin-search-icon" />
          <input 
            type="text" 
            className="camp-admin-input" 
            placeholder="Search name, phone, email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="camp-admin-select-box">
          <select 
            className="camp-admin-input" 
            value={filterSlot} 
            onChange={(e) => setFilterSlot(e.target.value)}
          >
            {availableSlots.map(slot => (
              <option key={slot} value={slot}>{slot === 'All' ? 'All Time Slots' : slot}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="camp-admin-error">{error}</p>}

      <div className="camp-admin-table-container">
        {loading && bookings.length === 0 ? (
          <div className="camp-admin-empty">Loading roster...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="camp-admin-empty">No bookings found matching your filters.</div>
        ) : (
          <div className="camp-admin-grid">
            {/* Desktop Header Row (6 Columns) */}
            <div className="camp-admin-grid-header">
              <div>Date Booked</div>
              <div>Student</div>
              <div>Parent Info</div>
              <div>Contact</div>
              <div>Time Slot</div>
              <div>Source</div>
            </div>

            {/* Data Rows (6 Columns) */}
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="camp-admin-grid-row">
                <div className="camp-admin-cell" data-label="Date Booked">
                  <Calendar size={14} className="camp-admin-cell-icon"/>
                  {new Date(booking.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </div>
                
                <div className="camp-admin-cell camp-admin-cell--strong" data-label="Student">
                  <Users size={14} className="camp-admin-cell-icon desktop-hide"/>
                  {booking.student_name}
                </div>
                
                <div className="camp-admin-cell" data-label="Parent">
                  {booking.parent_name}
                </div>
                
                <div className="camp-admin-cell" data-label="Contact">
                  <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                    <span style={{display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold'}}><Phone size={12}/> {booking.mobile}</span>
                    <span style={{fontSize: '0.8rem', color: 'var(--camp-admin-text-muted)', textTransform: 'none'}}>{booking.email}</span>
                  </div>
                </div>
                
                <div className="camp-admin-cell" data-label="Time Slot">
                  <span className="camp-admin-badge">{booking.time_slot}</span>
                </div>

                <div className="camp-admin-cell" data-label="Source" style={{ fontSize: '0.8rem', color: 'var(--camp-admin-text-muted)', textTransform: 'none' }}>
                  {booking.referral_source || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}