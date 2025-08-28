import React, { useState, useMemo } from 'react';

// --- SVG Icon Components ---
const TickIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', color: '#28a745' }}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
  </svg>
);

const CrossIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', color: '#dc3545' }}>
        <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" fill="currentColor"/>
    </svg>
);


/**
 * A hook to process attendance and fee history data for a single student.
 */
const useStudentMonthlyData = (student) => {
  const attendanceRecords = student.attendance || [];
  const feeHistory = student.fee_history || [];

  const attendanceByMonth = useMemo(() => {
    const map = new Map();
    attendanceRecords.forEach(record => {
      const normalizedRecord = {
        date: record.date,
        status: record.hasOwnProperty('present') ? (record.present ? 'Present' : 'Absent') : record.status
      };
      const monthKey = normalizedRecord.date.substring(0, 7);
      if (!map.has(monthKey)) {
        map.set(monthKey, []);
      }
      map.get(monthKey).push(normalizedRecord);
    });
    return map;
  }, [attendanceRecords]);

  const feeHistoryByMonth = useMemo(() => {
      const map = new Map();
      feeHistory.forEach(record => {
          const monthKey = record.date.substring(0, 7);
          map.set(monthKey, { paid: record.paid, method: record.method });
      });
      return map;
  }, [feeHistory]);

  const dateRange = useMemo(() => {
    const allDates = [...attendanceRecords.map(r => r.date), ...feeHistory.map(r => r.date)];
    if (allDates.length === 0) {
      const now = new Date();
      return { firstMonth: new Date(now.getFullYear(), now.getMonth(), 1), lastMonth: new Date(now.getFullYear(), now.getMonth(), 1) };
    }
    const sortedDates = allDates.sort((a, b) => new Date(a) - new Date(b));
    const firstDate = new Date(sortedDates[0]);
    const lastDate = new Date(sortedDates[sortedDates.length - 1]);
    return {
      firstMonth: new Date(firstDate.getFullYear(), firstDate.getMonth(), 1),
      lastMonth: new Date(lastDate.getFullYear(), lastDate.getMonth(), 1),
    };
  }, [attendanceRecords, feeHistory]);

  const overallStats = useMemo(() => {
    return attendanceRecords.reduce((acc, record) => {
      if ((record.hasOwnProperty('status') && record.status === 'Present') || record.present === true) {
        acc.present++;
      } else {
        acc.absent++;
      }
      return acc;
    }, { present: 0, absent: 0 });
  }, [attendanceRecords]);

  return { attendanceByMonth, feeHistoryByMonth, dateRange, overallStats };
};

/**
 * A sub-component to render the calendar grid for a single month.
 */
const MonthView = ({ records, monthDate, paymentInfo }) => {
  const recordsMap = useMemo(() => {
    const map = new Map();
    if (records) {
      records.forEach(record => map.set(new Date(record.date + 'T00:00:00').getDate(), record.status));
    }
    return map;
  }, [records]);

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`}></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const status = recordsMap.get(day);
    const isPresent = status === 'Present';
    const isAbsent = status === 'Absent';

    const dayStyle = {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: '50%', width: '32px', height: '32px', margin: 'auto',
      fontSize: '0.8rem', fontWeight: 500,
      color: isPresent ? '#155724' : isAbsent ? '#721c24' : '#6c757d',
      backgroundColor: isPresent ? '#d4edda' : isAbsent ? '#f8d7da' : 'transparent',
    };
    
    calendarDays.push(<div key={day} style={dayStyle}>{day}</div>);
  }

  return (
    <div style={{ flex: 1, minWidth: '240px', padding: '0 12px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#495057', margin: '0 0 16px 0', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {monthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        <span style={{ marginLeft: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {paymentInfo && paymentInfo.paid && (
                <>
                    <TickIcon />
                    <span style={{ textTransform:'uppercase',fontSize: '0.65rem', fontWeight: 500, color: '#6c757d' }}>{paymentInfo.method}</span>
                </>
            )}
            {paymentInfo && !paymentInfo.paid && <CrossIcon />}
        </span>
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
        {daysOfWeek.map((day, index) => (
          <div key={`${day}-${index}`} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6c757d', paddingBottom: '8px' }}>{day}</div>
        ))}
        {calendarDays}
      </div>
    </div>
  );
};

/**
 * Renders the attendance and payment calendar UI for a given student.
 */
const AttendanceCalendar = ({ student }) => {
  if (!student || (!student.attendance?.length && !student.fee_history?.length)) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0', color: '#6c757d', fontFamily: 'Inter, sans-serif' }}>
        No attendance or payment data available for this student.
      </div>
    );
  }
    
  const { attendanceByMonth, feeHistoryByMonth, dateRange, overallStats } = useStudentMonthlyData(student);
  const [currentDate, setCurrentDate] = useState(dateRange.firstMonth);

  const changeMonth = (offset) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate.getFullYear(), prevDate.getMonth() + offset, 1);
      if (newDate < dateRange.firstMonth || newDate > dateRange.lastMonth) {
        return prevDate;
      }
      return newDate;
    });
  };
  
  const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

  const getKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  
  const prevMonthRecords = attendanceByMonth.get(getKey(prevMonthDate)) || [];
  const currentMonthRecords = attendanceByMonth.get(getKey(currentDate)) || [];
  const nextMonthRecords = attendanceByMonth.get(getKey(nextMonthDate)) || [];

  const prevMonthPayment = feeHistoryByMonth.get(getKey(prevMonthDate));
  const currentMonthPayment = feeHistoryByMonth.get(getKey(currentDate));
  const nextMonthPayment = feeHistoryByMonth.get(getKey(nextMonthDate));

  const isPrevDisabled = currentDate <= dateRange.firstMonth;
  const isNextDisabled = currentDate >= dateRange.lastMonth;

  return (
    <>
      <style>{`
        .three-month-view { display: flex; flex-direction: row; justify-content: space-between; }
        .month-container.hide-on-mobile { display: block; }
        @media (max-width: 768px) { .month-container.hide-on-mobile { display: none; } }
      `}</style>
      <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', position: 'relative' }}>
          <button onClick={() => changeMonth(-1)} disabled={isPrevDisabled} style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', background: '#e9ecef', cursor: 'pointer', opacity: isPrevDisabled ? 0.5 : 1, position: 'absolute', left: 0 }}>
            &lt; Prev
          </button>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#343a40', margin: 0, textAlign: 'center' }}>
            Monthly Overview
          </h2>
          <button onClick={() => changeMonth(1)} disabled={isNextDisabled} style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', background: '#e9ecef', cursor: 'pointer', opacity: isNextDisabled ? 0.5 : 1, position: 'absolute', right: 0 }}>
            Next &gt;
          </button>
        </div>

        <div className="three-month-view">
          <div className="month-container hide-on-mobile">
            <MonthView records={prevMonthRecords} monthDate={prevMonthDate} paymentInfo={prevMonthPayment} />
          </div>
          <div className="month-container">
            <MonthView records={currentMonthRecords} monthDate={currentDate} paymentInfo={currentMonthPayment} />
          </div>
          <div className="month-container hide-on-mobile">
            <MonthView records={nextMonthRecords} monthDate={nextMonthDate} paymentInfo={nextMonthPayment} />
          </div>
        </div>
        
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e9ecef' }}>
          {/* <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#495057', marginBottom: '12px', textAlign: 'center' }}>Legend</h4> */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px 24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#d4edda', border: '1px solid #c3e6cb' }}></div>
              <span style={{ fontSize: '0.8rem', color: '#343a40', fontWeight: 500 }}>Present ({overallStats.present})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#f8d7da', border: '1px solid #f5c6cb' }}></div>
              <span style={{ fontSize: '0.8rem', color: '#343a40', fontWeight: 500 }}>Absent ({overallStats.absent})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TickIcon />
              <span style={{ fontSize: '0.8rem', color: '#343a40', fontWeight: 500 }}>Fee Paid</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CrossIcon />
              <span style={{ fontSize: '0.8rem', color: '#343a40', fontWeight: 500 }}>Fee Unpaid</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AttendanceCalendar;
