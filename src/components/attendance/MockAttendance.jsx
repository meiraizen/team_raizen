import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getBatches, createBatch, deleteBatch, getStudents, getAttendance, upsertAttendance } from '../../services/supabase';
import { logAudit } from '../../services/audit';
import { useAuthStore } from '../../store/auth';
import ConfirmDelete from '../ConfirmDelete';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const adjusted = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
  return `${adjusted.getFullYear()}-${String(adjusted.getMonth() + 1).padStart(2, '0')}-${String(adjusted.getDate()).padStart(2, '0')}`;
};

const formatAMPM = (time) => {
  if (!time) return '';
  const [h, m] = time.split(':');
  const hn = parseInt(h, 10);
  const ampm = hn >= 12 ? 'PM' : 'AM';
  const h12 = hn % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

const Styles = () => (
  <style>{`
    :root {
      --primary-color: #4f46e5; --primary-hover: #4338ca; --secondary: #e5e7eb;
      --bg: #f3f4f6; --card-bg: #ffffff; --text-primary: #111827;
      --text-secondary: #374151; --text-light: #6b7280; --border: #e5e7eb;
      --success: #10b981; --danger: #ef4444; --warning: #f59e0b;
      --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --radius: 0.75rem; --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }
    body { margin: 0; font-family: var(--font); background: var(--bg); color: var(--text-primary); }
    * { box-sizing: border-box; }
    .app-header { background: var(--card-bg); position: sticky; top: 0; z-index: 10; padding: 1rem 1.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
    .header-left { display: flex; align-items: center; gap: 1rem; }
    .header-info { display: flex; flex-direction: column; }
    .back-btn { padding: 0.5rem; border-radius: 9999px; background: none; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .back-btn svg { width: 1.5rem; height: 1.5rem; color: var(--text-secondary); }
    .header-title { font-size: 1.25rem; font-weight: 700; margin: 0; }
    .header-stats { font-size: 0.875rem; font-weight: 500; color: var(--text-secondary); margin-top: 0.125rem; }
    .header-stats .present { color: var(--success); font-weight: 600; }
    .header-stats .absent { color: var(--danger); font-weight: 600; }
    .header-action button { background: var(--primary-color); color: white; padding: 0.6rem 1.2rem; border: none; border-radius: var(--radius); font-weight: 600; cursor: pointer; box-shadow: var(--shadow); }
    .btn { width: 100%; text-align: center; padding: 0.75rem 1rem; border-radius: var(--radius); font-weight: 600; border: none; cursor: pointer; margin-top: 1rem; }
    .btn-primary { background: var(--primary-color); color: white; }
    .page-container { padding: 1.5rem; }
    .dashboard-section-title { font-size: 1rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 1rem 0; display: flex; align-items: center; }
    .batch-card { background: var(--card-bg); padding: 1.25rem; border-radius: var(--radius); box-shadow: var(--shadow); margin-bottom: 1rem; border: 1px solid var(--border); }
    .batch-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; cursor: pointer; }
    .batch-card-details { flex-grow: 1; }
    .batch-card-title { font-weight: 700; font-size: 1.25rem; margin: 0 0 0.25rem 0; }
    .batch-card-days { color: var(--text-secondary); margin: 0 0 0.25rem 0; font-weight: 500; }
    .batch-card-time { font-size: 0.875rem; color: var(--text-light); margin: 0; }
    .batch-card-student-count { text-align: center; background: var(--bg); padding: 0.5rem 1rem; border-radius: var(--radius); }
    .student-count-label { font-size: 0.75rem; font-weight: 500; color: var(--text-secondary); text-transform: uppercase; }
    .student-count-number { font-size: 1.75rem; font-weight: 700; color: var(--primary-color); }
    .take-attendance-btn { margin-top: 1rem; width: 100%; padding: 0.75rem; background: var(--warning); color: var(--text-primary); font-weight: 700; border: none; border-radius: var(--radius); cursor: pointer; }
    .details-section { background: var(--card-bg); padding: 1.5rem; border-radius: var(--radius); box-shadow: var(--shadow); margin-bottom: 1.5rem; }
    .details-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .details-section-title { font-size: 1.125rem; font-weight: 600; margin: 0; color: var(--text-secondary); }
    .attendance-item { display: flex; align-items: center; justify-content: space-between; background: var(--bg); padding: 0.75rem 1rem; border-radius: var(--radius); margin-bottom: 0.5rem; }
    .student-stats { font-size: 0.875rem; font-weight: 500; }
    .student-stats .present { color: var(--success); margin-right: 0.75rem; }
    .student-stats .absent { color: var(--danger); }
    .attendance-switch { width: 3.5rem; height: 2rem; border-radius: 9999px; display: flex; align-items: center; cursor: pointer; padding: 0.25rem; }
    .switch-on { background: var(--success); }
    .switch-off { background: var(--danger); }
    .switch-thumb { width: 1.5rem; height: 1.5rem; background: white; border-radius: 9999px; transition: transform 0.2s; }
    .thumb-on { transform: translateX(1.5rem); }
    .day-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 1rem; }
    .day-btn { padding: 0.5rem; font-size: 0.875rem; border-radius: var(--radius); border: 1px solid #d1d5db; cursor: pointer; background: orange; }
    .day-btn-selected { background: var(--primary-color); color: white; border-color: var(--primary-color); }
    .time-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    .input-group { margin-bottom: 1rem; }
    .input-label { display: block; font-size: 0.875rem; font-weight: 500; color: var(--text-secondary); margin-bottom: 0.25rem; }
    .input-field { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: var(--radius); }
    .calendar-container { background: var(--card-bg); padding: 1rem; border-radius: var(--radius); }
    .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .calendar-header h3 { margin: 0; font-size: 1.125rem; }
    .calendar-nav-btn { background: none; border: none; padding: 0.5rem; cursor: pointer; border-radius: 50%; }
    .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; text-align: center; }
    .calendar-day-name { font-weight: 600; font-size: 0.75rem; color: var(--text-light); }
    .calendar-day { padding: 0.5rem; border-radius: 50%; cursor: pointer; }
    .calendar-day.is-empty { visibility: hidden; }
    .calendar-day:hover { background: var(--secondary); }
    .calendar-day.is-today { font-weight: bold; border: 1px solid var(--primary-color); }
    .calendar-day.is-selected { background: var(--primary-color); color: white; }
    .calendar-day.is-disabled { color: #d1d5db; cursor: not-allowed; }
    .calendar-day.has-attendance { text-decoration: underline; text-decoration-color: var(--success); }
    .no-items { text-align: center; color: var(--text-light); padding: 2rem; background: var(--card-bg); border-radius: var(--radius); border: 2px dashed var(--border); }
    .notification-banner { position: fixed; top: 1rem; left: 50%; transform: translateX(-50%); padding: 1rem 1.5rem; border-radius: var(--radius); color: white; z-index: 100; font-weight: 600; box-shadow: var(--shadow); opacity: 0; visibility: hidden; transition: opacity 0.3s, visibility 0.3s; }
    .notification-banner.show { opacity: 1; visibility: visible; }
    .notification-banner.success { background: var(--success); }
    .notification-banner.error { background: var(--danger); }
    .loading-spinner { text-align: center; padding: 2rem; color: var(--text-light); }
    .delete-batch-btn { position: absolute; top: 0; right: 0; background: none; border: none; cursor: pointer; color: var(--text-light); padding: 0.25rem; border-radius: 0.25rem; }
    .delete-batch-btn:hover { color: var(--danger); background: rgba(239,68,68,0.1); }
  `}</style>
);

const Notification = ({ message, type, onClear }) => {
  useEffect(() => {
    if (message) { const t = setTimeout(onClear, 3000); return () => clearTimeout(t); }
  }, [message, onClear]);
  return <div className={`notification-banner ${type} ${message ? 'show' : ''}`}>{message}</div>;
};

const Calendar = ({ selectedDate, onDateSelect, attendanceDates = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = firstDay === 0 ? 6 : firstDay - 1;
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const attendanceSet = new Set(attendanceDates.map(d => formatDate(d)));

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="calendar-nav-btn">&lt;</button>
        <h3>{MONTH_NAMES[month]} {year}</h3>
        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="calendar-nav-btn">&gt;</button>
      </div>
      <div className="calendar-grid">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => <div key={d} className="calendar-day-name">{d}</div>)}
        {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} className="calendar-day is-empty"></div>)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const date = new Date(year, month, day); date.setHours(0, 0, 0, 0);
          const dateStr = formatDate(date);
          const isFuture = date > today;
          const isSelected = dateStr === selectedDate;
          const isToday = date.getTime() === today.getTime();
          const hasAttendance = attendanceSet.has(dateStr);
          return (
            <div key={day} onClick={() => !isFuture && onDateSelect(dateStr)}
              className={`calendar-day ${isSelected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''} ${isFuture ? 'is-disabled' : ''} ${hasAttendance ? 'has-attendance' : ''}`}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DashboardHeader = ({ title, onBack, action, stats }) => (
  <header className="app-header">
    <div className="header-left">
      {onBack && <button onClick={onBack} className="back-btn"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></button>}
      <div className="header-info"><h1 className="header-title">{title}</h1>{stats && <p className="header-stats">{stats}</p>}</div>
    </div>
    {action && <div className="header-action">{action}</div>}
  </header>
);

const Button = ({ children, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled} className="btn btn-primary">{children}</button>
);

// ─── Create Batch ──────────────────────────────────────────
function CreateBatch({ onNavigate, batches, handleCreateBatch, showNotification }) {
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const dayAbb = { Monday: 'M', Tuesday: 'Tu', Wednesday: 'W', Thursday: 'Th', Friday: 'F', Saturday: 'Sa', Sunday: 'Su' };
  const orderedDays = DAYS_OF_WEEK.filter(d => selectedDays.includes(d));
  const batchName = `${orderedDays.map(d => dayAbb[d]).join(' - ')} ${formatAMPM(startTime)}`.trim();

  const onCreate = async () => {
    if (!batchName || selectedDays.length === 0 || !startTime || !endTime) {
      showNotification('Please select days and set start/end times.', 'error'); return;
    }
    const exists = batches.some(b => b.batch_name === batchName);
    if (exists) { showNotification('A batch with this name already exists.', 'error'); return; }
    await handleCreateBatch({ batch_name: batchName, days: orderedDays, start_time: startTime, end_time: endTime });
    showNotification('Batch created successfully!', 'success');
    onNavigate('existingBatches');
  };

  return (
    <div>
      <DashboardHeader title="Create New Batch" onBack={() => onNavigate('existingBatches')} />
      <div className="page-container">
        <div className="details-section">
          <div className="input-group">
            <label className="input-label">Generated Batch Name</label>
            <div className="batch-card-title" style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>{batchName || 'Select days and start time...'}</div>
          </div>
          <div className="input-group">
            <label className="input-label">Batch Days</label>
            <div className="day-grid">{DAYS_OF_WEEK.map(day => (
              <button key={day} onClick={() => setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])}
                className={`day-btn ${selectedDays.includes(day) ? 'day-btn-selected' : ''}`}>{day.substring(0, 3)}</button>
            ))}</div>
          </div>
          <div className="time-grid">
            <div className="input-group"><label className="input-label">Start Time</label><input className="input-field" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} /></div>
            <div className="input-group"><label className="input-label">End Time</label><input className="input-field" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} /></div>
          </div>
          <Button onClick={onCreate}>Create Batch</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Existing Batches ──────────────────────────────────────
function ExistingBatches({ onNavigate, setSelectedBatch, batches, students, onTakeAttendance, todayString, onDelete }) {
  const today = new Date(todayString);
  const todayName = DAYS_OF_WEEK[today.getDay() === 0 ? 6 : today.getDay() - 1];
  const todaysBatches = batches.filter(b => b.days?.includes(todayName));
  const otherBatches = batches.filter(b => !b.days?.includes(todayName));

  const renderCard = (batch, isToday) => {
    const batchStudents = students.filter(s => s.batch_id === batch.id);
    return (
      <div key={batch.id} className="batch-card">
        <div style={{ position: 'relative' }}>
          <div className="batch-card-header" onClick={() => { setSelectedBatch(batch); onNavigate('batchDetails'); }}>
            <div className="batch-card-details">
              <h3 className="batch-card-title">{batch.batch_name}</h3>
              <p className="batch-card-days">{batch.days?.join(', ')}</p>
              <p className="batch-card-time">{formatAMPM(batch.start_time)} - {formatAMPM(batch.end_time)}</p>
            </div>
            <div className="batch-card-student-count">
              <h4 className="student-count-label">Students</h4>
              <p className="student-count-number">{batchStudents.length}</p>
            </div>
          </div>
          <button className="delete-batch-btn" onClick={(e) => { e.stopPropagation(); onDelete?.({ id: batch.id, name: batch.batch_name }); }}
            title="Delete batch">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
        {isToday && <button className="take-attendance-btn" onClick={() => onTakeAttendance(batch)}>Take Today's Attendance</button>}
      </div>
    );
  };

  return (
    <div>
      <DashboardHeader title="Dashboard" action={<button onClick={() => onNavigate('createBatch')}>+ New Batch</button>} />
      <div className="page-container">
        <h2 className="dashboard-section-title">Today's Classes</h2>
        {todaysBatches.length > 0 ? todaysBatches.map(b => renderCard(b, true)) : <p className="no-items">No batches scheduled for today.</p>}
        <h2 className="dashboard-section-title" style={{ marginTop: '2rem' }}>All Batches</h2>
        {otherBatches.length > 0 ? otherBatches.map(b => renderCard(b)) : <p className="no-items">No other batches found.</p>}
      </div>
    </div>
  );
}

// ─── Batch Details ─────────────────────────────────────────
function BatchDetails({ batch, onNavigate, students, attendance, handleSaveAttendance, initialDate, showNotification, batchAttendanceDates }) {
  const [selectedDate, setSelectedDate] = useState(initialDate || '');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!selectedDate) { setAttendanceRecords([]); return; }
    const batchStudents = students.filter(s => Number(s.batch_id) === Number(batch.id));
    const dateAttendance = attendance.filter(a => a.date === selectedDate && Number(a.batch_id) === Number(batch.id));
    const records = batchStudents.map(s => ({
      student_id: s.id,
      name: s.full_name || s.name,
      is_present: dateAttendance.find(a => Number(a.student_id) === Number(s.id))?.is_present ?? true,
    }));
    setAttendanceRecords(records);
  }, [selectedDate, batch.id, students, attendance]);

  useEffect(() => {
    if (!selectedDate) {
      const totalPresent = attendance.filter(a => Number(a.batch_id) === Number(batch.id) && a.is_present).length;
      const totalAbsent = attendance.filter(a => Number(a.batch_id) === Number(batch.id) && !a.is_present).length;
      setStats(<span>All-Time: <span className="present">P: {totalPresent}</span> | <span className="absent">A: {totalAbsent}</span></span>);
    } else {
      const present = attendanceRecords.filter(r => r.is_present).length;
      const absent = attendanceRecords.length - present;
      setStats(<span>{selectedDate}: <span className="present">P: {present}</span> | <span className="absent">A: {absent}</span></span>);
    }
  }, [selectedDate, attendanceRecords, batch.id, attendance]);

  const toggleAttendance = (student_id) => {
    setAttendanceRecords(prev => prev.map(r => r.student_id === student_id ? { ...r, is_present: !r.is_present } : r));
  };

  const onSave = async () => {
    setLoading(true);
    const records = attendanceRecords.map(r => ({
      student_id: r.student_id, batch_id: batch.id,
      date: selectedDate, is_present: r.is_present,
    }));
    await handleSaveAttendance(records);
    setLoading(false);
    showNotification('Attendance saved!', 'success');
  };

  return (
    <div>
      <DashboardHeader title={batch.batch_name} onBack={() => onNavigate('existingBatches')} stats={stats} />
      <div className="page-container">
        <div className="details-section">
          <h3 className="details-section-title">Take Attendance</h3>
          <Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} attendanceDates={batchAttendanceDates} />
        </div>
        {selectedDate ? (
          <div className="details-section">
            <h3 className="details-section-title">Attendance for {selectedDate}</h3>
            {attendanceRecords.map(r => (
              <div key={r.student_id} className="attendance-item">
                <p>{r.name}</p>
                <div onClick={() => toggleAttendance(r.student_id)} className={`attendance-switch ${r.is_present ? 'switch-on' : 'switch-off'}`}>
                  <span className={`switch-thumb ${r.is_present ? 'thumb-on' : ''}`} />
                </div>
              </div>
            ))}
            <Button onClick={onSave} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        ) : (
          <div className="details-section">
            <h3 className="details-section-title">Enrolled Students ({students.filter(s => Number(s.batch_id) === Number(batch.id)).length})</h3>
            {students.filter(s => Number(s.batch_id) === Number(batch.id)).map(student => {
              const sAtt = attendance.filter(a => Number(a.student_id) === Number(student.id));
              const p = sAtt.filter(a => a.is_present).length;
              const a = sAtt.length - p;
              return (
                <div key={student.id} className="attendance-item">
                  <p>{student.full_name || student.name}</p>
                  <div className="student-stats"><span className="present">P: {p}</span><span className="absent">A: {a}</span></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────
export default function AttendanceApp() {
  const user = useAuthStore(s => s.user);
  const [page, setPage] = useState('existingBatches');
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [attendanceDates, setAttendanceDates] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '', key: 0 });
  const [loading, setLoading] = useState(true);
  const [todayString, setTodayString] = useState(formatDate(new Date()));
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const ns = formatDate(new Date());
      if (ns !== todayString) setTodayString(ns);
    }, 60000);
    return () => clearInterval(interval);
  }, [todayString]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, sRes, aRes] = await Promise.all([
        getBatches(),
        getStudents(),
        getAttendance({}),
      ]);
      if (bRes.data) setBatches(bRes.data);
      if (sRes.data) setStudents(sRes.data);
      if (aRes.data) {
        setAttendance(aRes.data);
        setAttendanceDates(aRes.data.map(a => a.date));
      }
    } catch (err) {
      console.error('Failed to load attendance data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const showNotification = (message, type) => setNotification(prev => ({ message, type, key: prev.key + 1 }));

  const handleCreateBatch = async (batchData) => {
    const { data, error } = await createBatch({ ...batchData, created_by: user?.email });
    if (error) { showNotification(error.message, 'error'); return; }
    if (data) setBatches(prev => [...prev, data]);
    await logAudit({
      action: 'CREATE', entityType: 'batch', entityId: data?.id,
      changes: { before: null, after: batchData },
      metadata: { created_by: user?.email },
    });
  };

  const handleSaveAttendance = async (records) => {
    const { data, error } = await upsertAttendance(records.map(r => ({
      ...r, marked_by: user?.email, marked_at: new Date().toISOString(),
    })));
    if (error) { showNotification(error.message, 'error'); return; }
    if (data) {
      setAttendance(prev => {
        const filtered = prev.filter(a => !(a.date === records[0]?.date && Number(a.batch_id) === Number(records[0]?.batch_id)));
        return [...filtered, ...data];
      });
    }
    await logAudit({
      action: 'UPDATE', entityType: 'attendance', entityId: `${records[0]?.batch_id}:${records[0]?.date}`,
      changes: { records: records.length, present: records.filter(r => r.is_present).length },
      metadata: { marked_by: user?.email, batch_id: records[0]?.batch_id, date: records[0]?.date },
    });
  };

  const handleTakeAttendance = (batch) => {
    setSelectedBatch(batch);
    setPage('batchDetails');
  };

  const handleDeleteBatch = async () => {
    if (!deleteConfirm) return;
    const { error } = await deleteBatch(deleteConfirm.id);
    if (error) { showNotification(error.message, 'error'); return; }
    setBatches(prev => prev.filter(b => b.id !== deleteConfirm.id));
    await logAudit({
      action: 'DELETE', entityType: 'batch', entityId: String(deleteConfirm.id),
      changes: { before: { batch_name: deleteConfirm.name }, after: null },
      metadata: { deleted_by: user?.email },
    });
    showNotification(`Batch "${deleteConfirm.name}" deleted.`, 'success');
    setDeleteConfirm(null);
  };

  const handleNavigate = (newPage) => setPage(newPage);

  const renderPage = () => {
    if (loading) return <div className="loading-spinner">Loading attendance data...</div>;

    switch (page) {
      case 'createBatch':
        return <CreateBatch onNavigate={handleNavigate} batches={batches} handleCreateBatch={handleCreateBatch} showNotification={showNotification} />;
      case 'existingBatches':
        return <ExistingBatches onNavigate={handleNavigate} setSelectedBatch={setSelectedBatch} batches={batches} students={students} onTakeAttendance={handleTakeAttendance} todayString={todayString} onDelete={setDeleteConfirm} />;
      case 'batchDetails':
        return <BatchDetails batch={selectedBatch} onNavigate={handleNavigate} students={students} attendance={attendance} handleSaveAttendance={handleSaveAttendance} initialDate={todayString} showNotification={showNotification} batchAttendanceDates={attendanceDates} />;
      default:
        return <ExistingBatches onNavigate={handleNavigate} setSelectedBatch={setSelectedBatch} batches={batches} students={students} onTakeAttendance={handleTakeAttendance} todayString={todayString} />;
    }
  };

  return (
    <>
      <Styles />
      <Notification key={notification.key} message={notification.message} type={notification.type} onClear={() => setNotification({ message: '', type: '', key: notification.key })} />
      <div className="app-container">{renderPage()}</div>
      <ConfirmDelete
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteBatch}
        itemName={deleteConfirm?.name || ''}
        itemType="batch"
      />
    </>
  );
}
