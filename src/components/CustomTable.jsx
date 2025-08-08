import React, { useState, useMemo, useCallback } from 'react';
import './CustomTable.css';

const CustomTable = ({ data = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [beltFilter, setBeltFilter] = useState('');
  const [feesFilter, setFeesFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Utility functions
  const getAttendanceRate = useCallback((attendance) => {
    if (!attendance || attendance.length === 0) return 0;
    const presentDays = attendance.filter(day => day.present).length;
    return Math.round((presentDays / attendance.length) * 100);
  }, []);

  // Analytics
  const analytics = useMemo(() => {
    if (!data || data.length === 0) {
      return { totalStudents: 0, feesPaid: 0, avgAttendance: 0, totalRevenue: 0 };
    }

    const totalStudents = data.length;
    const feesPaid = data.filter(s => s.fees_paid).length;
    const avgAttendance = Math.round(
      data.reduce((sum, s) => sum + getAttendanceRate(s.attendance), 0) / totalStudents
    );
    const totalRevenue = data.reduce((sum, s) => 
      sum + (s.fee_history?.reduce((feeSum, f) => feeSum + f.amount, 0) || 0), 0
    );
    
    return { totalStudents, feesPaid, avgAttendance, totalRevenue };
  }, [data, getAttendanceRate]);

  // Filter options
  const uniqueValues = useMemo(() => {
    if (!data || data.length === 0) return { genders: [], belts: [] };
    return {
      genders: [...new Set(data.map(student => student.gender))],
      belts: [...new Set(data.map(student => student.belt_level))],
    };
  }, [data]);

  // Filtered and sorted data
  const filteredAndSortedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    let filtered = data.filter(student => {
      const matchesSearch = searchTerm === '' || 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.id && student.id.toString().includes(searchTerm)) ||
        (student.student_id && student.student_id.toString().includes(searchTerm)) ||
        (student.roll_number && student.roll_number.toString().includes(searchTerm));

      const matchesGender = genderFilter === '' || student.gender === genderFilter;
      const matchesBelt = beltFilter === '' || student.belt_level === beltFilter;
      const matchesFees = feesFilter === '' ||
        (feesFilter === 'paid' && student.fees_paid) ||
        (feesFilter === 'unpaid' && !student.fees_paid);

      return matchesSearch && matchesGender && matchesBelt && matchesFees;
    });

    if (sortField) {
      filtered.sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        
        if (sortField === 'attendance') {
          aVal = getAttendanceRate(a.attendance);
          bVal = getAttendanceRate(b.attendance);
        }
        
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        
        return sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
      });
    }

    return filtered;
  }, [data, searchTerm, genderFilter, beltFilter, feesFilter, sortField, sortDirection, getAttendanceRate]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSortedData, currentPage, rowsPerPage]);

  // Event handlers
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setGenderFilter('');
    setBeltFilter('');
    setFeesFilter('');
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  const toggleRowExpansion = useCallback((id) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }, []);

  return (
    <div className="student-management">
      {/* Header */}
      {/* <div className="header">
        <h1 className="title">Student Management System</h1>
        <div className="stats">
          <div className="stat-card">
            <div className="stat-number">{analytics.totalStudents}</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">₹{analytics.totalRevenue.toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{analytics.avgAttendance}%</div>
            <div className="stat-label">Avg Attendance</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{analytics.feesPaid}</div>
            <div className="stat-label">Fees Paid</div>
          </div>
        </div>
      </div> */}

      {/* Filters */}
      <div className="filters">
        <div className="filter-row">
          <input
            type="text"
            placeholder="Search by ID, Student ID, Roll Number, or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <div className="filter-controls">
            <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
              <option value="">All Genders</option>
              {uniqueValues.genders.map(gender => (
                <option key={gender} value={gender}>{gender}</option>
              ))}
            </select>

            <select value={beltFilter} onChange={(e) => setBeltFilter(e.target.value)}>
              <option value="">All Belts</option>
              {uniqueValues.belts.map(belt => (
                <option key={belt} value={belt}>{belt}</option>
              ))}
            </select>

            <select value={feesFilter} onChange={(e) => setFeesFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>

            <button onClick={clearFilters} className="clear-btn">
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="results-info">
        Showing {paginatedData.length} of {filteredAndSortedData.length} students
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th width="40"></th>
              <th className="sortable" onClick={() => handleSort('name')}>
                Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="sortable" onClick={() => handleSort('age')}>
                Age {sortField === 'age' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Gender</th>
              <th>Belt</th>
              <th>Batch</th>
              <th className="sortable" onClick={() => handleSort('attendance')}>
                Attendance {sortField === 'attendance' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Fee Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((student) => (
              <React.Fragment key={student.id}>
                <tr className="student-row">
                  <td>
                    <button 
                      className="expand-btn"
                      onClick={() => toggleRowExpansion(student.id)}
                    >
                      {expandedRows.has(student.id) ? '−' : '+'}
                    </button>
                  </td>
                  <td>
                    <div className="student-info">
                      <div className="student-name">{student.name}</div>
                      <div className="student-email">{student.email}</div>
                    </div>
                  </td>
                  <td>
                    <span className="student-age">{student.age}</span>
                  </td>
                  <td>
                    <span className="student-gender">{student.gender}</span>
                  </td>
                  <td>
                    <span className="belt-badge">{student.belt_level}</span>
                  </td>
                  <td>
                    <span className="student-batch">{student.batch_time}</span>
                  </td>
                  <td>
                    <span className={`attendance-badge ${
                      getAttendanceRate(student.attendance) >= 80 ? 'good' : 
                      getAttendanceRate(student.attendance) >= 60 ? 'average' : 'poor'
                    }`}>
                      {getAttendanceRate(student.attendance)}%
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${student.fees_paid ? 'paid' : 'unpaid'}`}>
                      {student.fees_paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="action-btn view">View</button>
                      <button className="action-btn edit">Edit</button>
                      <button className="action-btn delete">Delete</button>
                    </div>
                  </td>
                </tr>
                
                {expandedRows.has(student.id) && (
                  <tr className="expanded-row">
                    <td colSpan="9">
                      <div className="expanded-content">
                        <div className="info-section">
                          <h4>Personal Information</h4>
                          <div className="info-grid">
                            <div><strong>Contact:</strong> {student.contact_number}</div>
                            <div><strong>Address:</strong> {student.address}</div>
                            <div><strong>Guardian:</strong> {student.guardian_name}</div>
                            <div><strong>Joining Date:</strong> {student.joining_date}</div>
                          </div>
                        </div>
                        
                        {student.fee_history && student.fee_history.length > 0 && (
                          <div className="info-section">
                            <h4>Payment History</h4>
                            <div className="payment-history">
                              {student.fee_history.slice(0, 3).map((fee, index) => (
                                <div key={index} className="payment-item">
                                  <span>{fee.date}</span>
                                  <span>₹{fee.amount}</span>
                                  <span>{fee.method}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="page-btn"
          >
            Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => 
                page === 1 || 
                page === totalPages || 
                Math.abs(page - currentPage) <= 1
              )
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] < page - 1 && (
                    <span className="page-ellipsis">...</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`page-btn ${currentPage === page ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))
            }
          </div>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomTable;