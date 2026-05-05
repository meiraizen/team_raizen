import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Search, LogOut, RefreshCw, Calendar, Users, 
  Phone, Download, Cloud, ArrowDown, ArrowUp, Filter
} from 'lucide-react';
import './camp-booking-admin.css';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const ADMIN_PIN = '2233';

export default function AdminDashboard({ onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('All');
  const [filterGender, setFilterGender] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc'); 

  const availableSources = ['All', ...new Set(bookings.map(b => b.referral_source || 'N/A'))];

  useEffect(() => {
    if (isAuthenticated) fetchBookings();
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
    const { data, error: dbError } = await supabase
      .from('camp_bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) setError('Failed to fetch data.');
    else setBookings(data || []);
    setLoading(false);
  };

  const generateCSV = (data) => {
    const headers = ["DATE BOOKED", "STUDENT NAME", "GENDER", "PARENT NAME", "MOBILE", "EMAIL", "TIME SLOT", "SOURCE"];
    const rows = data.map(b => [
      new Date(b.created_at).toLocaleDateString('en-IN'),
      b.student_name,
      b.gender || 'N/A', 
      b.parent_name,
      b.mobile,
      b.email,
      b.time_slot,
      b.referral_source || 'N/A'
    ]);

    const csvContent = [
      headers.join(","), 
      ...rows.map(row => row.join(","))
    ].join("\n");

    return csvContent;
  };

  const handleDownloadCSV = () => {
    const csv = generateCSV(filteredAndSortedBookings);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `raizen_Camp_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSort = () => {
    setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterSource('All');
    setFilterGender('All');
  };

  const filteredAndSortedBookings = bookings
    .filter((booking) => {
      const matchesSearch = 
        booking.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.mobile.includes(searchTerm);
        
      const source = booking.referral_source || 'N/A';
      const matchesSource = filterSource === 'All' || source === filterSource;

      let matchesGender = true;
      if (filterGender !== 'All') {
        const bgender = (booking.gender || '').toLowerCase();
        if (filterGender === 'M') {
          matchesGender = bgender === 'male' || bgender === 'm';
        } else if (filterGender === 'F') {
          matchesGender = bgender === 'female' || bgender === 'f';
        }
      }
      
      return matchesSearch && matchesSource && matchesGender;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const handleCloseClick = () => {
    const confirmClose = window.confirm("Are you sure you want to close this tab?");
    if (confirmClose) {
      window.close();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="camp-admin-auth-wrapper">
        <div className="camp-admin-auth-card">
          <h2 className="camp-admin-title">Admin Access</h2>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              className="camp-admin-input" 
              placeholder="Enter PIN" 
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              maxLength={4}
              required
            />
            {pinError && <p className="camp-admin-error">{pinError}</p>}
            <button type="submit" className="camp-admin-btn camp-admin-btn--primary" style={{marginTop: '1rem'}}>
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="camp-admin-dashboard">
      <div className="camp-admin-header">
        <div>
          <h1 className="camp-admin-title" style={{margin: 0}}>Camp Details</h1>
          <p className="camp-admin-subtitle">Total: {filteredAndSortedBookings.length}</p>
        </div>
        <div className="camp-admin-header-actions">
          <button onClick={handleDownloadCSV} className="camp-admin-icon-btn" title="Download CSV">
            <Download size={20} />
          </button>
          <button onClick={fetchBookings} className="camp-admin-icon-btn" title="Refresh">
            <RefreshCw size={20} className={loading ? 'camp-admin-spin' : ''} />
          </button>
          <button onClick={handleCloseClick} className="camp-admin-btn camp-admin-btn--secondary">
            <LogOut size={16} /> Exit
          </button>
        </div>
      </div>

      <div className="camp-admin-filters">
        <div className="camp-admin-search-box">
          <Search size={18} className="camp-admin-search-icon" />
          <input 
            type="text" 
            className="camp-admin-input" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="camp-admin-select-box">
          <select 
            className="camp-admin-input" 
            value={filterSource} 
            onChange={(e) => setFilterSource(e.target.value)}
          >
            {availableSources.map(source => (
              <option key={source} value={source}>
                {source === 'All' ? 'Filter by Source' : source}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="camp-admin-table-container">
        {filteredAndSortedBookings.length === 0 ? (
          
          /* --- NEW ALERT UI FOR EMPTY STATE --- */
          <div className="camp-admin-empty" style={{ padding: '4rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div className="camp-admin-error" style={{ margin: 0, padding: '1rem 2rem', border: '1px solid var(--camp-admin-accent-red)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚠️ No records found matching your current filters.
            </div>
            <button 
              onClick={resetFilters} 
              className="camp-admin-btn camp-admin-btn--secondary" 
              style={{ width: 'auto', padding: '0.5rem 1.5rem' }}
            >
              Clear All Filters
            </button>
          </div>

        ) : (
          <div className="camp-admin-grid">
            <div className="camp-admin-grid-header">
              <div 
                onClick={toggleSort} 
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', userSelect: 'none' }}
                title="Click to sort by date"
              >
                Date Booked
                {sortOrder === 'desc' ? (
                  <ArrowDown size={14} style={{ color: 'var(--camp-admin-accent-red)' }} />
                ) : (
                  <ArrowUp size={14} style={{ color: 'var(--camp-admin-accent-red)' }} />
                )}
              </div>
              
              <div>Student</div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Gender
                <select 
                  value={filterGender} 
                  onChange={(e) => setFilterGender(e.target.value)}
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    cursor: 'pointer', 
                    outline: 'none', 
                    fontWeight: '900', 
                    color: 'var(--camp-admin-accent-red)',
                    padding: 0,
                    fontSize: '0.75rem',
                    fontFamily: 'inherit'
                  }}
                  title="Filter by Gender"
                >
                  <option value="All">(ALL)</option>
                  <option value="M">(M)</option>
                  <option value="F">(F)</option>
                </select>
              </div>

              <div>Parent</div>
              <div>Contact</div>
              <div>Slot</div>
              <div>Source</div>
            </div>
            
            {filteredAndSortedBookings.map((booking) => (
              <div key={booking.id} className="camp-admin-grid-row">
                <div className="camp-admin-cell" data-label="Date">
                  {new Date(booking.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </div>
                <div className="camp-admin-cell camp-admin-cell--strong" data-label="Student">{booking.student_name}</div>
                <div className="camp-admin-cell" data-label="Gender" style={{textTransform: 'capitalize'}}>{booking.gender || 'N/A'}</div>
                <div className="camp-admin-cell" data-label="Parent">{booking.parent_name}</div>
                <div className="camp-admin-cell" data-label="Contact">{booking.mobile}</div>
                <div className="camp-admin-cell" data-label="Slot"><span className="camp-admin-badge">{booking.time_slot}</span></div>
                <div className="camp-admin-cell" data-label="Source">{booking.referral_source || 'N/A'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}