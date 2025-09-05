import React, { useState, useEffect, useRef } from 'react';

// --- Mock Data ---
const MOCK_BATCHES = [
  {
    id: 1,
    batch_name: 'M - W - F 9:00 AM',
    days: ['Monday', 'Wednesday', 'Friday'],
    start_time: '09:00',
    end_time: '11:00',
  },
  {
    id: 2,
    batch_name: 'Tu - Th 6:00 PM',
    days: ['Tuesday', 'Thursday'],
    start_time: '18:00',
    end_time: '20:00',
  },
  {
    id: 3,
    batch_name: 'W - Sa 10:00 AM',
    days: ['Wednesday', 'Saturday'],
    start_time: '10:00',
    end_time: '12:00',
  },
];

const MOCK_STUDENTS = [
  { id: 101, batch_id: 1, name: 'Surya' },
  { id: 102, batch_id: 1, name: 'Ravi Krishna' },
  { id: 103, batch_id: 2, name: 'Timon' },
  { id: 104, batch_id: 3, name: 'Pumba' },
  { id: 105, batch_id: 1, name: 'Yuvaraj' },
  { id: 106, batch_id: 1, name: 'Yugapriyan' },
  { id: 107, batch_id: 2, name: 'Manikandan' },
  { id: 108, batch_id: 3, name: 'Sanjeev' },
  { id: 109, batch_id: 1, name: 'Mahima' },
  { id: 110, batch_id: 2, name: 'Kevin' },
  { id: 111, batch_id: 3, name: 'Dhanush' },
  { id: 112, batch_id: 1, name: 'Prithika' },
  { id: 113, batch_id: 2, name: 'Prithesh' },
  { id: 114, batch_id: 3, name: 'Alisha' },
  { id: 115, batch_id: 1, name: 'Nithyashree' },
];

const MOCK_ATTENDANCE = [
  // Existing attendance
  { batch_id: 1, student_id: 101, date: '2025-09-01', is_present: true }, // Monday
  { batch_id: 1, student_id: 102, date: '2025-09-01', is_present: false }, // Monday
  { batch_id: 1, student_id: 101, date: '2025-09-03', is_present: true }, // Wednesday
  { batch_id: 1, student_id: 102, date: '2025-09-03', is_present: true }, // Wednesday
  { batch_id: 2, student_id: 103, date: '2025-09-02', is_present: false }, // Tuesday
  { batch_id: 3, student_id: 104, date: '2025-09-03', is_present: true }, // Wednesday

  // New attendance for new students (two dates per batch)
  // Batch 1 students (M-W-F: 2025-09-01 (Mon), 2025-09-05 (Fri))
  { batch_id: 1, student_id: 105, date: '2025-09-01', is_present: true },
  { batch_id: 1, student_id: 105, date: '2025-09-05', is_present: true },
  { batch_id: 1, student_id: 106, date: '2025-09-01', is_present: false },
  { batch_id: 1, student_id: 106, date: '2025-09-05', is_present: true },
  { batch_id: 1, student_id: 109, date: '2025-09-01', is_present: true },
  { batch_id: 1, student_id: 109, date: '2025-09-05', is_present: false },
  { batch_id: 1, student_id: 112, date: '2025-09-01', is_present: true },
  { batch_id: 1, student_id: 112, date: '2025-09-05', is_present: true },
  { batch_id: 1, student_id: 115, date: '2025-09-01', is_present: false },
  { batch_id: 1, student_id: 115, date: '2025-09-05', is_present: true },

  // Batch 2 students (Tu-Th: 2025-09-02 (Tue), 2025-09-04 (Thu))
  { batch_id: 2, student_id: 103, date: '2025-09-02', is_present: false },
  { batch_id: 2, student_id: 103, date: '2025-09-04', is_present: true },
  { batch_id: 2, student_id: 107, date: '2025-09-02', is_present: true },
  { batch_id: 2, student_id: 107, date: '2025-09-04', is_present: true },
  { batch_id: 2, student_id: 110, date: '2025-09-02', is_present: false },
  { batch_id: 2, student_id: 110, date: '2025-09-04', is_present: false },
  { batch_id: 2, student_id: 113, date: '2025-09-02', is_present: true },
  { batch_id: 2, student_id: 113, date: '2025-09-04', is_present: true },

  // Batch 3 students (W-Sa: 2025-09-03 (Wed), 2025-09-06 (Sat))
  { batch_id: 3, student_id: 104, date: '2025-09-03', is_present: true },
  { batch_id: 3, student_id: 104, date: '2025-09-06', is_present: false },
  { batch_id: 3, student_id: 108, date: '2025-09-03', is_present: true },
  { batch_id: 3, student_id: 108, date: '2025-09-06', is_present: true },
  { batch_id: 3, student_id: 111, date: '2025-09-03', is_present: false },
  { batch_id: 3, student_id: 111, date: '2025-09-06', is_present: true },
  { batch_id: 3, student_id: 114, date: '2025-09-03', is_present: true },
  { batch_id: 3, student_id: 114, date: '2025-09-06', is_present: true },
];

// --- Helper Functions & Constants ---
const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const adjustedDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
  const year = adjustedDate.getFullYear();
  const month = `${adjustedDate.getMonth() + 1}`.padStart(2, '0');
  const day = `${adjustedDate.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatAMPM = (time) => {
  if (!time) return '';
  let [hours, minutes] = time.split(':');
  const hoursNum = parseInt(hours, 10);
  const ampm = hoursNum >= 12 ? 'PM' : 'AM';
  let hours12 = hoursNum % 12;
  hours12 = hours12 ? hours12 : 12; // The hour '0' should be '12'
  return `${hours12}:${minutes} ${ampm}`;
};

// --- Styles Component ---
const AppStyles = () => (
  <style>
    {`
        :root {
            --primary-color: #4f46e5;
            --primary-hover-color: #4338ca;
            --secondary-color: #e5e7eb;
            --secondary-hover-color: #d1d5db;
            --background-color: #f3f4f6;
            --card-background-color: #ffffff;
            --text-primary: #111827;
            --text-secondary: #374151;
            --text-light: #6b7280;
            --border-color: #e5e7eb;
            --success-color: #10b981;
            --danger-color: #ef4444;
            --warning-color: #f59e0b;
            --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            --border-radius: 0.75rem;
            --box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }
        body {
            margin: 0;
            font-family: var(--font-family);
            background-color: var(--background-color);
            color: var(--text-primary);
        }
        * {
            box-sizing: border-box;
        }

        /* --- Components --- */
        .app-header {
            background-color: var(--card-background-color);
            position: sticky;
            top: 0;
            z-index: 10;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .header-left {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        .header-info {
            display: flex;
            flex-direction: column;
        }
        .back-button {
            padding: 0.5rem;
            border-radius: 9999px;
            background: none;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .back-button svg {
            width: 1.5rem;
            height: 1.5rem;
            color: var(--text-secondary);
        }
        .header-title {
            font-size: 1.25rem;
            font-weight: 700;
            margin: 0;
        }
        .header-stats {
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--text-secondary);
            margin-top: 0.125rem;
        }
        .header-stats .present { color: var(--success-color); font-weight: 600; }
        .header-stats .absent { color: var(--danger-color); font-weight: 600; }

        .header-action button {
            background-color: var(--primary-color);
            color: white;
            padding: 0.6rem 1.2rem;
            border: none;
            border-radius: var(--border-radius);
            font-weight: 600;
            cursor: pointer;
            box-shadow: var(--box-shadow);
        }
        
        .btn {
            width: 100%;
            text-align: center;
            padding: 0.75rem 1rem;
            border-radius: var(--border-radius);
            font-weight: 600;
            border: none;
            cursor: pointer;
            margin-top: 1rem;
        }
        .btn-primary { background-color: var(--primary-color); color: white; }

        /* --- Screens --- */
        .page-container { padding: 1.5rem; }
        
        .dashboard-section-title {
            font-size: 1rem;
            font-weight: 700;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin: 0 0 1rem 0;
            display: flex;
            align-items: center;
        }
        .dashboard-section-title .icon {
            width: 1.25rem;
            height: 1.25rem;
            margin-right: 0.5rem;
            color: var(--primary-color);
        }

        .batch-card {
            background-color: var(--card-background-color);
            padding: 1.25rem;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            margin-bottom: 1rem;
            border: 1px solid var(--border-color);
        }
        .batch-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
            cursor: pointer;
        }
        .batch-card-details { flex-grow: 1; }
        .batch-card-title { font-weight: 700; font-size: 1.25rem; margin: 0 0 0.25rem 0; }
        .batch-card-days { color: var(--text-secondary); margin: 0 0 0.25rem 0; font-weight: 500; }
        .batch-card-time { font-size: 0.875rem; color: var(--text-light); margin: 0; }
        .batch-card-student-count { text-align: center; background-color: var(--background-color); padding: 0.5rem 1rem; border-radius: var(--border-radius); }
        .student-count-label { font-size: 0.75rem; font-weight: 500; color: var(--text-secondary); text-transform: uppercase; }
        .student-count-number { font-size: 1.75rem; font-weight: 700; color: var(--primary-color); }
        
        .take-attendance-btn {
            margin-top: 1rem;
            width: 100%;
            padding: 0.75rem;
            background-color: var(--warning-color);
            color: var(--text-primary);
            font-weight: 700;
            border: none;
            border-radius: var(--border-radius);
            cursor: pointer;
        }
        
        .details-section {
            background: var(--card-background-color);
            padding: 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            margin-bottom: 1.5rem;
        }
        .details-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .details-section-title { font-size: 1.125rem; font-weight: 600; margin: 0; color: var(--text-secondary); }
        .add-student-form { display: flex; gap: 0.5rem; margin-top: 0.75rem; align-items: center; }
        .add-student-btn { background-color: var(--primary-color); color: white; padding: 0.5rem 1rem; border-radius: var(--border-radius); border: none; flex-shrink: 0; }
        .icon-btn { background-color: var(--primary-color); color: white; border: none; width: 2.5rem; height: 2.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
        .icon-btn.close { background-color: var(--danger-color); }
        
        .attendance-item { display: flex; align-items: center; justify-content: space-between; background-color: var(--background-color); padding: 0.75rem 1rem; border-radius: var(--border-radius); margin-bottom: 0.5rem; }
        .student-stats { font-size: 0.875rem; font-weight: 500; }
        .student-stats .present { color: var(--success-color); margin-right: 0.75rem; }
        .student-stats .absent { color: var(--danger-color); }

        .attendance-switch { width: 3.5rem; height: 2rem; border-radius: 9999px; display: flex; align-items: center; cursor: pointer; padding: 0.25rem; }
        .switch-on { background-color: var(--success-color); }
        .switch-off { background-color: var(--danger-color); }
        .switch-thumb { width: 1.5rem; height: 1.5rem; background-color: white; border-radius: 9999px; transition: transform 0.2s; }
        .thumb-on { transform: translateX(1.5rem); }

        .day-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 1rem; }
        .day-btn { padding: 0.5rem; font-size: 0.875rem; border-radius: var(--border-radius); border: 1px solid #d1d5db; cursor: pointer; background-color: orange; }
        .day-btn-selected { background-color: var(--primary-color); color: white; border-color: var(--primary-color); }
        .time-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        .input-group { margin-bottom: 1rem; }
        .input-label { display: block; font-size: 0.875rem; font-weight: 500; color: var(--text-secondary); margin-bottom: 0.25rem; }
        .input-field { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: var(--border-radius); }

        /* Calendar */
        .calendar-container { background-color: var(--card-background-color); padding: 1rem; border-radius: var(--border-radius); }
        .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .calendar-header h3 { margin: 0; font-size: 1.125rem; }
        .calendar-nav-btn { background: none; border: none; padding: 0.5rem; cursor: pointer; border-radius: 50%; }
        .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; text-align: center; }
        .calendar-day-name { font-weight: 600; font-size: 0.75rem; color: var(--text-light); }
        .calendar-day { padding: 0.5rem; border-radius: 50%; cursor: pointer; }
        .calendar-day.is-empty { visibility: hidden; }
        .calendar-day:not(.is-empty):not(.is-disabled):hover { background-color: var(--secondary-color); }
        .calendar-day.is-today { font-weight: bold; border: 1px solid var(--primary-color); }
        .calendar-day.is-selected { background-color: var(--primary-color); color: white; }
        .calendar-day.is-disabled { color: #d1d5db; cursor: not-allowed; }

        .no-items-message { text-align: center; color: var(--text-light); padding: 2rem; background-color: var(--card-background-color); border-radius: var(--border-radius); border: 2px dashed var(--border-color); }
    
        .notification-banner {
            position: fixed;
            top: 1rem;
            left: 50%;
            transform: translateX(-50%);
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            color: white;
            z-index: 100;
            font-weight: 600;
            box-shadow: var(--box-shadow);
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s, visibility 0.3s, top 0.3s;
        }
        .notification-banner.show {
            top: 2rem;
            opacity: 1;
            visibility: visible;
        }
        .notification-banner.success { background-color: var(--success-color); }
        .notification-banner.error { background-color: var(--danger-color); }
    `}
  </style>
);

// --- UI Components ---
const Header = ({ title, onBack, action, stats }) => (
  <header className="app-header">
    <div className="header-left">
      {onBack && (
        <button onClick={onBack} className="back-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}
      <div className="header-info">
        <h1 className="header-title">{title}</h1>
        {stats && <p className="header-stats">{stats}</p>}
      </div>
    </div>
    {action && <div className="header-action">{action}</div>}
  </header>
);

const Button = ({ children, onClick, disabled = false }) => (
  <button onClick={onClick} disabled={disabled} className="btn btn-primary">
    {children}
  </button>
);

const Notification = ({ message, type, onClear }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClear();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClear]);

  return (
    <div className={`notification-banner ${type} ${message ? 'show' : ''}`}>
      {message}
    </div>
  );
};

const Calendar = ({ selectedDate, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const handlePrevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  const handleNextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: startDayIndex });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="calendar-nav-btn">
          &lt;
        </button>
        <h3>
          {MONTH_NAMES[month]} {year}
        </h3>
        <button onClick={handleNextMonth} className="calendar-nav-btn">
          &gt;
        </button>
      </div>
      <div className="calendar-grid">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
          <div key={d} className="calendar-day-name">
            {d}
          </div>
        ))}
        {emptyDays.map((_, i) => (
          <div key={`e-${i}`} className="calendar-day is-empty"></div>
        ))}
        {days.map((day) => {
          const date = new Date(year, month, day);
          date.setHours(0, 0, 0, 0);
          const isFuture = date > today;
          const dateStr = formatDate(date);
          const isSelected = dateStr === selectedDate;
          const isToday = date.getTime() === today.getTime();
          return (
            <div
              key={day}
              onClick={() => !isFuture && onDateSelect(date)}
              className={`calendar-day ${isSelected ? 'is-selected' : ''} ${
                isToday ? 'is-today' : ''
              } ${isFuture ? 'is-disabled' : ''}`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Main Application Screens ---

function CreateBatch({
  onNavigate,
  batches,
  handleCreateBatch,
  showNotification,
}) {
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const dayAbbreviations = {
    Monday: 'M',
    Tuesday: 'Tu',
    Wednesday: 'W',
    Thursday: 'Th',
    Friday: 'F',
    Saturday: 'Sa',
    Sunday: 'Su',
  };

  const orderedSelectedDays = DAYS_OF_WEEK.filter((day) =>
    selectedDays.includes(day)
  );
  const dayPart = orderedSelectedDays
    .map((day) => dayAbbreviations[day])
    .join(' - ');
  const generatedBatchName = `${dayPart} ${formatAMPM(startTime)}`.trim();

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const onCreate = () => {
    if (
      !generatedBatchName ||
      selectedDays.length === 0 ||
      !startTime ||
      !endTime
    ) {
      showNotification('Please select days and set start/end times.', 'error');
      return;
    }
    if (batches.some((b) => b.batch_name === generatedBatchName)) {
      showNotification('A batch with this name already exists.', 'error');
      return;
    }
    handleCreateBatch({
      id: Date.now(),
      batch_name: generatedBatchName,
      days: orderedSelectedDays,
      start_time: startTime,
      end_time: endTime,
    });
    showNotification('Batch created successfully!', 'success');
    onNavigate('existingBatches');
  };

  return (
    <div>
      <Header
        title="Create New Batch"
        onBack={() => onNavigate('existingBatches')}
      />
      <div className="page-container">
        <div className="details-section">
          <div className="input-group">
            <label className="input-label">Generated Batch Name</label>
            <div
              className="batch-card-title"
              style={{
                padding: '0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
              }}
            >
              {generatedBatchName || 'Select days and start time...'}
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Batch Days</label>
            <div className="day-grid">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`day-btn ${
                    selectedDays.includes(day) ? 'day-btn-selected' : ''
                  }`}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <div className="time-grid">
            <div className="input-group">
              <label className="input-label">Start Time</label>
              <input
                className="input-field"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="input-label">End Time</label>
              <input
                className="input-field"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={onCreate}>Create Batch</Button>
        </div>
      </div>
    </div>
  );
}

function ExistingBatches({
  onNavigate,
  setSelectedBatch,
  batches,
  students,
  onTakeAttendance,
  todayString,
}) {
  const handleSelectBatch = (batch) => {
    setSelectedBatch(batch);
    onNavigate('batchDetails');
  };

  const today = new Date(todayString);
  const todayName = DAYS_OF_WEEK[today.getDay() === 0 ? 6 : today.getDay() - 1];

  const todaysBatches = batches.filter((batch) =>
    batch.days.includes(todayName)
  );
  const otherBatches = batches.filter(
    (batch) => !batch.days.includes(todayName)
  );

  const renderBatchCard = (batch, isToday = false) => {
    const batchStudents = students.filter(
      (student) => student.batch_id === batch.id
    );
    return (
      <div key={batch.id} className="batch-card">
        <div
          className="batch-card-header"
          onClick={() => handleSelectBatch(batch)}
        >
          <div className="batch-card-details">
            <h3 className="batch-card-title">{batch.batch_name}</h3>
            <p className="batch-card-days">{batch.days.join(', ')}</p>
            <p className="batch-card-time">
              {formatAMPM(batch.start_time)} - {formatAMPM(batch.end_time)}
            </p>
          </div>
          <div className="batch-card-student-count">
            <h4 className="student-count-label">Students</h4>
            <p className="student-count-number">{batchStudents.length}</p>
          </div>
        </div>
        {isToday && (
          <button
            className="take-attendance-btn"
            onClick={() => onTakeAttendance(batch)}
          >
            Take Today's Attendance
          </button>
        )}
      </div>
    );
  };

  return (
    <div>
      <Header
        title="Dashboard"
        action={
          <button onClick={() => onNavigate('createBatch')}>+ New Batch</button>
        }
      />
      <div className="page-container">
        <h2 className="dashboard-section-title">
          <span className="icon">⭐</span> Today's Classes
        </h2>
        {todaysBatches.length > 0 ? (
          todaysBatches.map((batch) => renderBatchCard(batch, true))
        ) : (
          <p className="no-items-message">No batches scheduled for today.</p>
        )}

        <h2 className="dashboard-section-title" style={{ marginTop: '2rem' }}>
          <span className="icon">📅</span> All Batches
        </h2>
        {otherBatches.length > 0 ? (
          otherBatches.map((batch) => renderBatchCard(batch))
        ) : (
          <p className="no-items-message">No other batches found.</p>
        )}
      </div>
    </div>
  );
}

function BatchDetails({
  batch,
  onNavigate,
  students,
  attendance,
  handleAddStudent,
  handleSaveAttendance,
  initialDate,
  showNotification,
}) {
  const [newStudentName, setNewStudentName] = useState('');
  const [selectedDate, setSelectedDate] = useState(initialDate || '');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [stats, setStats] = useState(null);
  const studentInputRef = useRef(null);

  useEffect(() => {
    // Effect to create attendance records for the selected date
    if (!selectedDate) {
      setAttendanceRecords([]);
      return;
    }

    const batchStudents = students.filter((s) => s.batch_id === batch.id);
    const dateAttendance = attendance.filter(
      (a) => a.date === selectedDate && a.batch_id === batch.id
    );
    const records = batchStudents.map((student) => ({
      student_id: student.id,
      name: student.name,
      is_present:
        dateAttendance.find((a) => a.student_id === student.id)?.is_present ??
        true,
    }));
    setAttendanceRecords(records);
  }, [selectedDate, batch.id, students, attendance]);

  useEffect(() => {
    // Effect to calculate and display statistics
    if (!selectedDate) {
      const totalPresent = attendance.filter(
        (a) => a.batch_id === batch.id && a.is_present
      ).length;
      const totalAbsent = attendance.filter(
        (a) => a.batch_id === batch.id && !a.is_present
      ).length;
      setStats(
        <>
          All-Time: <span className="present">P: {totalPresent}</span> |{' '}
          <span className="absent">A: {totalAbsent}</span>
        </>
      );
    } else {
      const presentToday = attendanceRecords.filter((r) => r.is_present).length;
      const absentToday = attendanceRecords.length - presentToday;
      setStats(
        <>
          {selectedDate}: <span className="present">P: {presentToday}</span> |{' '}
          <span className="absent">A: {absentToday}</span>
        </>
      );
    }
  }, [selectedDate, attendanceRecords, batch.id, attendance]);

  const onAddStudent = (e) => {
    e.preventDefault();
    const trimmedName = newStudentName.trim();
    if (!trimmedName) return;

    const isDuplicate = students.some(
      (s) =>
        s.batch_id === batch.id &&
        s.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      showNotification(
        `Student "${trimmedName}" already exists in this batch.`,
        'error'
      );
      return;
    }

    handleAddStudent({ id: Date.now(), batch_id: batch.id, name: trimmedName });
    setNewStudentName('');
    studentInputRef.current?.focus(); // Re-focus the input for the next entry
  };

  const toggleAttendance = (student_id) => {
    setAttendanceRecords((prev) =>
      prev.map((rec) =>
        rec.student_id === student_id
          ? { ...rec, is_present: !rec.is_present }
          : rec
      )
    );
  };

  const onSaveChanges = () => {
    setLoading(true);
    const recordsToSave = attendanceRecords.map((rec) => ({
      ...rec,
      batch_id: batch.id,
      date: selectedDate,
    }));
    setTimeout(() => {
      handleSaveAttendance(recordsToSave);
      setLoading(false);
      showNotification('Attendance saved!', 'success');
      setSelectedDate('');
    }, 500);
  };

  return (
    <div>
      <Header
        title={batch.batch_name}
        onBack={() => onNavigate('existingBatches')}
        stats={stats}
      />
      <div className="page-container">
        <div className="details-section">
          <h3 className="details-section-title">Take Attendance</h3>
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={(date) => setSelectedDate(formatDate(date))}
          />
        </div>

        {selectedDate ? (
          <div className="details-section">
            <h3 className="details-section-title">
              Attendance for {selectedDate}
            </h3>
            {attendanceRecords.map((record) => (
              <div key={record.student_id} className="attendance-item">
                <p>{record.name}</p>
                <div
                  onClick={() => toggleAttendance(record.student_id)}
                  className={`attendance-switch ${
                    record.is_present ? 'switch-on' : 'switch-off'
                  }`}
                >
                  <span
                    className={`switch-thumb ${
                      record.is_present ? 'thumb-on' : ''
                    }`}
                  />
                </div>
              </div>
            ))}
            <Button onClick={onSaveChanges} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        ) : (
          <div className="details-section">
            <div className="details-section-header">
              <h3 className="details-section-title">Enrolled Students</h3>
              {!isAddingStudent && (
                <button
                  onClick={() => setIsAddingStudent(true)}
                  className="icon-btn"
                >
                  +
                </button>
              )}
            </div>
            {isAddingStudent && (
              <form onSubmit={onAddStudent} className="add-student-form">
                <input
                  ref={studentInputRef}
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Student's full name"
                  autoFocus
                  className="input-field"
                />
                <button type="submit" className="add-student-btn">
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingStudent(false)}
                  className="icon-btn close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </form>
            )}
            <div style={{ marginTop: '1rem' }}>
              {students
                .filter((s) => s.batch_id === batch.id)
                .map((student) => {
                  const studentAttendance = attendance.filter(
                    (a) => a.student_id === student.id
                  );
                  const presentCount = studentAttendance.filter(
                    (a) => a.is_present
                  ).length;
                  const absentCount = studentAttendance.length - presentCount;
                  return (
                    <div key={student.id} className="attendance-item">
                      <p>{student.name}</p>
                      <div className="student-stats">
                        <span className="present">P: {presentCount}</span>
                        <span className="absent">A: {absentCount}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main App Component & Router ---

export default function App() {
  const [page, setPage] = useState('existingBatches');
  const [pageProps, setPageProps] = useState({});
  const [selectedBatch, setSelectedBatch] = useState(null);

  const [batches, setBatches] = useState(MOCK_BATCHES);
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [attendance, setAttendance] = useState(MOCK_ATTENDANCE);
  const [notification, setNotification] = useState({
    message: '',
    type: '',
    key: 0,
  });
  const [todayString, setTodayString] = useState(formatDate(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      const newTodayString = formatDate(new Date());
      if (newTodayString !== todayString) {
        setTodayString(newTodayString);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [todayString]);

  const showNotification = (message, type) => {
    setNotification((prev) => ({ message, type, key: prev.key + 1 }));
  };

  const handleCreateBatch = (newBatch) =>
    setBatches((prev) => [...prev, newBatch]);
  const handleAddStudent = (newStudent) =>
    setStudents((prev) => [...prev, newStudent]);
  const handleSaveAttendance = (newRecords) => {
    setAttendance((prev) => [
      ...prev.filter(
        (rec) =>
          !(
            rec.date === newRecords[0]?.date &&
            rec.batch_id === newRecords[0]?.batch_id
          )
      ),
      ...newRecords,
    ]);
  };

  const handleNavigate = (newPage, props = {}) => {
    setPage(newPage);
    setPageProps(props);
  };

  const handleTakeAttendance = (batch) => {
    setSelectedBatch(batch);
    handleNavigate('batchDetails', { initialDate: todayString });
  };

  const renderPage = () => {
    const commonProps = {
      showNotification,
      ...pageProps,
    };

    switch (page) {
      case 'createBatch':
        return (
          <CreateBatch
            onNavigate={handleNavigate}
            batches={batches}
            handleCreateBatch={handleCreateBatch}
            {...commonProps}
          />
        );
      case 'existingBatches':
        return (
          <ExistingBatches
            onNavigate={handleNavigate}
            setSelectedBatch={setSelectedBatch}
            batches={batches}
            students={students}
            onTakeAttendance={handleTakeAttendance}
            todayString={todayString}
          />
        );
      case 'batchDetails':
        return (
          <BatchDetails
            batch={selectedBatch}
            onNavigate={handleNavigate}
            students={students}
            attendance={attendance}
            handleAddStudent={handleAddStudent}
            handleSaveAttendance={handleSaveAttendance}
            {...commonProps}
          />
        );
      default:
        return (
          <ExistingBatches
            onNavigate={handleNavigate}
            setSelectedBatch={setSelectedBatch}
            batches={batches}
            students={students}
            onTakeAttendance={handleTakeAttendance}
            todayString={todayString}
          />
        );
    }
  };

  return (
    <>
      <AppStyles />
      <Notification
        key={notification.key}
        message={notification.message}
        type={notification.type}
        onClear={() =>
          setNotification({ message: '', type: '', key: notification.key })
        }
      />
      <div className="app-container">{renderPage()}</div>
    </>
  );
}
