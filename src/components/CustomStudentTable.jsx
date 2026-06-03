import React, { useState, useMemo, useCallback } from 'react';
import './CustomStudentTable.css';
import AttendanceCalendar from './AttendanceCalendar';
import { AttendanceData } from './tempDatabase';
import { updateStudent, deleteStudent } from '../services/supabase';
import ConfirmDelete from './ConfirmDelete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// Import SVG icons
import InfoIcon from '../assets/info.svg';
import EditIcon from '../assets/edit.svg';
import DeleteIcon from '../assets/delete.svg';
import ContactIcon from '../assets/contact.svg';
import LocationIcon from '../assets/location.svg';
import DateIcon from '../assets/date.svg';

const BELT_OPTIONS = ['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Purple', 'Brown', 'Black'];

function normalizeStudent(student) {
  const batchName = student.batches?.batch_name || null;
  return {
    ...student,
    name: student.full_name || 'Unknown',
    contact_number: student.phone || '—',
    emergency_contact: student.emergency_phone || '—',
    medical_conditions: student.health_condition_details || 'None',
    joining_date: student.created_at ? new Date(student.created_at).toLocaleDateString() : '—',
    guardian_name: student.guardian_name || '—',
    email: student.email || '',
    belt_level: student.belt_level || null,
    batch_time: batchName,
    batch_id: student.batch_id || null,
    fees_paid: false,
    fee_history: [],
  };
}

const CustomStudentTable = ({ data = [], batches = [], onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [beltFilter, setBeltFilter] = useState('');
  const [feesFilter, setFeesFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [editStudent, setEditStudent] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const normalizedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map(normalizeStudent);
  }, [data]);

  const attendanceMap = useMemo(() => {
    const map = new Map();
    AttendanceData.students.forEach(student => {
      map.set(student.id, student.attendance);
    });
    return map;
  }, []);

  const mergedData = useMemo(() => {
    if (normalizedData.length === 0) return [];
    return normalizedData.map(student => {
      const newAttendance = attendanceMap.get(student.id);
      return { ...student, attendance: newAttendance || [] };
    });
  }, [normalizedData, attendanceMap]);

  const getAttendanceRate = useCallback((attendance) => {
    if (!attendance || attendance.length === 0) return 0;
    const presentDays = attendance.filter(day => day.present || day.status === 'Present').length;
    return Math.round((presentDays / attendance.length) * 100);
  }, []);

  const analytics = useMemo(() => {
    if (!mergedData || mergedData.length === 0) {
      return { totalStudents: 0, feesPaid: 0, avgAttendance: 0, totalRevenue: 0 };
    }
    const totalStudents = mergedData.length;
    const feesPaid = mergedData.filter(s => s.fees_paid).length;
    const avgAttendance = Math.round(
      mergedData.reduce((sum, s) => sum + getAttendanceRate(s.attendance), 0) / totalStudents
    );
    const totalRevenue = mergedData.reduce((sum, s) =>
      sum + (s.fee_history?.reduce((feeSum, f) => feeSum + f.amount, 0) || 0), 0
    );
    return { totalStudents, feesPaid, avgAttendance, totalRevenue };
  }, [mergedData, getAttendanceRate]);

  const uniqueValues = useMemo(() => {
    if (!mergedData || mergedData.length === 0) return { genders: [], belts: [] };
    return {
      genders: [...new Set(mergedData.map(student => student.gender))],
      belts: [...new Set(mergedData.filter(s => s.belt_level).map(student => student.belt_level))],
    };
  }, [mergedData]);

  const filteredAndSortedData = useMemo(() => {
    if (!mergedData || mergedData.length === 0) return [];
    let filtered = mergedData.filter(student => {
      const matchesSearch = searchTerm === '' ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.id && student.id.toString().includes(searchTerm));
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
  }, [mergedData, searchTerm, genderFilter, beltFilter, feesFilter, sortField, sortDirection, getAttendanceRate]);

  const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSortedData, currentPage, rowsPerPage]);

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

  // ─── Edit ─────────────────────────────────────────────
  const handleEdit = (student) => {
    setEditForm({
      full_name: student.full_name || '',
      date_of_birth: student.date_of_birth || '',
      age: student.age || '',
      gender: student.gender || '',
      height_cm: student.height_cm || '',
      weight_kg: student.weight_kg || '',
      school: student.school || '',
      phone: student.phone || '',
      emergency_phone: student.emergency_phone || '',
      address: student.address || '',
      landmark: student.landmark || '',
      email: student.email || '',
      guardian_name: student.guardian_name || '',
      belt_level: student.belt_level || '',
      batch_id: student.batch_id || '',
      health_condition_details: student.health_condition_details || '',
      past_karate_details: student.past_karate_details || '',
    });
    setEditStudent(student);
  };

  const handleEditChange = (field) => (e) => {
    setEditForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleEditSave = async () => {
    if (!editStudent) return;
    setSaving(true);
    const updates = { ...editForm };
    Object.keys(updates).forEach(k => {
      if (updates[k] === '' || updates[k] === null) updates[k] = null;
    });
    if (updates.batch_id === '' || updates.batch_id === null) updates.batch_id = null;
    const { error } = await updateStudent(editStudent.id, updates);
    setSaving(false);
    if (error) {
      setSnackbar({ open: true, message: 'Failed to update student', severity: 'error' });
    } else {
      setSnackbar({ open: true, message: 'Student updated successfully', severity: 'success' });
      setEditStudent(null);
      onRefresh?.();
    }
  };

  // ─── Delete ───────────────────────────────────────────
  const handleDelete = (student) => {
    setDeleteTarget(student);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await deleteStudent(deleteTarget.id);
    if (error) {
      setSnackbar({ open: true, message: 'Failed to delete student', severity: 'error' });
    } else {
      setSnackbar({ open: true, message: `"${deleteTarget.full_name}" deleted`, severity: 'success' });
      setDeleteTarget(null);
      onRefresh?.();
    }
  };

  return (
    <div className="student-management">
      {/* Filters */}
      <div className="filters">
        <div className="filter-row">
          <input
            type="text"
            placeholder="Search by ID, Name, etc..."
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
            <button onClick={clearFilters} className="clear-btn">Clear</button>
          </div>
        </div>
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
                  <td data-label="Expand">
                    <button className="expand-btn" onClick={() => toggleRowExpansion(student.id)}>
                      {expandedRows.has(student.id) ? '−' : '+'}
                    </button>
                  </td>
                  <td data-label="Name">
                    <div className="student-info">
                      <div className="student-name">{student.name}</div>
                      <div className="student-email">{student.email}</div>
                    </div>
                  </td>
                  <td data-label="Age">
                    <span className="student-age">{student.age}</span>
                  </td>
                  <td data-label="Gender">
                    <div className="gender-icon">
                      {student.gender === 'Male' ? (
                        <span alt="Male" className="gender-svg">M</span>
                      ) : (
                        <span alt="Female" className="gender-svg female">F</span>
                      )}
                    </div>
                  </td>
                  <td data-label="Belt">
                    {student.belt_level ? (
                      <div className={`belt-icon ${student.belt_level.toLowerCase()}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-5.0 -10.0 110.0 135.0" className="belt-svg" width="20" height="20">
                          <path d="m80.555 49.262v-8.082h-19.301v0.87891l12.531 7.2031z" fill="#8b4513" stroke="#654321" strokeWidth="0.5" />
                          <path d="m41.152 41.18h-20.91v8.082h6.7422z" fill="#8b4513" stroke="#654321" strokeWidth="0.5" />
                          <path d="m44.344 49.262 5.25-3.2383-7.332-4.3789-13.352 7.6172-0.83594 0.47656-0.83594 0.48047-11.613 6.625 4.3359 6.7852 22.25-13.051 0.58594-0.35938 0.77344-0.48047z" fill="#8b4513" stroke="#654321" strokeWidth="0.5" />
                          <path d="m73.527 50.219-0.83203-0.47656-0.82812-0.47656-10.613-6.1016v8.5469c0 0.054687-0.007812 0.10547-0.023437 0.15234l19.148 11.438 3.9961-6.8477z" fill="#8b4513" stroke="#654321" strokeWidth="0.5" />
                          <path d="m49.512 36.41-0.070313-0.039062-6.8086 3.8516-0.45703 0.25781 0.37109 0.22266 0.19922 0.11719 0.46875 0.28125 0.12891 0.078126 7.1641 4.2773 2.0898-1.2891v-5.9844l-3.0469-1.75z" fill="#8b4513" stroke="#654321" strokeWidth="0.5" />
                          <path d="m50.973 46.293-0.45703 0.28125-4.3555 2.6875-0.77344 0.47656-0.77344 0.48047-1.4961 0.92188 0.011718 0.003906 5.8477 4.6367 3.6211-2.3203v-8.1719l-1.1641 0.71875z" fill="#8b4513" stroke="#654321" strokeWidth="0.5" />
                          <path d="m59.039 40.223-5.4844-2.7266v16.543l5.7031-2.2422 0.55859-0.22266 0.48047-0.19141v-10.531z" fill="#8b4513" stroke="#654321" strokeWidth="0.5" />
                        </svg>
                      </div>
                    ) : (
                      <div className="belt-icon unranked"><span style={{ fontSize: 12, color: '#999' }}>—</span></div>
                    )}
                  </td>
                  <td data-label="Batch">
                    <span className="student-batch">{student.batch_time || '—'}</span>
                  </td>
                  <td data-label="Attendance">
                    <span className={`attendance-badge ${getAttendanceRate(student.attendance) >= 80 ? 'good' :
                      getAttendanceRate(student.attendance) >= 60 ? 'average' : 'poor'
                    }`}>
                      {getAttendanceRate(student.attendance)}%
                    </span>
                  </td>
                  <td data-label="Fee Status">
                    {(() => {
                      const currentFee = student.fee_history && student.fee_history.length > 0
                        ? student.fee_history[student.fee_history.length - 1]
                        : null;
                      if (!currentFee) return <span className="status-badge">N/A</span>;
                      return (
                        <span className="status-badge"
                          style={{
                            display: 'inline-block', width: '18px', height: '18px',
                            borderRadius: '50%', background: currentFee.paid ? 'green' : 'red',
                            border: '2px solid #eee',
                          }}
                          title={currentFee.paid ? 'Paid' : 'Unpaid'}
                        ></span>
                      );
                    })()}
                  </td>
                  <td data-label="Actions">
                    <div className="actions">
                      <button onClick={() => toggleRowExpansion(student.id)} className="action-btn view">
                        <img src={InfoIcon} alt="View" className="action-icon" />
                      </button>
                      <button onClick={() => handleEdit(student)} className="action-btn edit">
                        <img src={EditIcon} alt="Edit" className="action-icon" />
                      </button>
                      <button onClick={() => handleDelete(student)} className="action-btn delete">
                        <img src={DeleteIcon} alt="Delete" className="action-icon" />
                      </button>
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
                            <div className="info-item">
                              <img src={ContactIcon} alt="Contact" className="info-icon" />
                              {student.contact_number}
                            </div>
                            <div className="info-item">
                              <img src={LocationIcon} alt="Address" className="info-icon" />
                              {student.address}
                            </div>
                            <div className="info-item">
                              <img src={ContactIcon} alt="Guardian" className="info-icon" />
                              {student.guardian_name}
                            </div>
                            <div className="info-item">
                              <img src={DateIcon} alt="Joining Date" className="info-icon" />
                              {student.joining_date}
                            </div>
                          </div>
                        </div>
                        <AttendanceCalendar student={student} />
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
          <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1} className="page-btn">Previous</button>
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] < page - 1 && <span className="page-ellipsis">...</span>}
                  <button onClick={() => setCurrentPage(page)}
                    className={`page-btn ${currentPage === page ? 'active' : ''}`}>{page}</button>
                </React.Fragment>
              ))}
          </div>
          <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages} className="page-btn">Next</button>
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={!!editStudent} onClose={() => setEditStudent(null)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
          Edit Student — {editStudent?.full_name}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField label="Full Name" fullWidth value={editForm.full_name || ''}
                onChange={handleEditChange('full_name')} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Date of Birth" type="date" fullWidth value={editForm.date_of_birth || ''}
                onChange={handleEditChange('date_of_birth')} InputLabelProps={{ shrink: true }} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Age" fullWidth value={editForm.age || ''}
                onChange={handleEditChange('age')} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Gender" select fullWidth value={editForm.gender || ''}
                onChange={handleEditChange('gender')} size="small">
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Belt Level" select fullWidth value={editForm.belt_level || ''}
                onChange={handleEditChange('belt_level')} size="small">
                <MenuItem value="">— None —</MenuItem>
                {BELT_OPTIONS.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Batch" select fullWidth value={editForm.batch_id || ''}
                onChange={handleEditChange('batch_id')} size="small">
                <MenuItem value="">— None —</MenuItem>
                {batches.map(b => <MenuItem key={b.id} value={b.id}>{b.batch_name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Email" fullWidth value={editForm.email || ''}
                onChange={handleEditChange('email')} size="small" type="email" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Phone" fullWidth value={editForm.phone || ''}
                onChange={handleEditChange('phone')} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Emergency Phone" fullWidth value={editForm.emergency_phone || ''}
                onChange={handleEditChange('emergency_phone')} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Guardian Name" fullWidth value={editForm.guardian_name || ''}
                onChange={handleEditChange('guardian_name')} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Height (cm)" fullWidth value={editForm.height_cm || ''}
                onChange={handleEditChange('height_cm')} size="small" type="number" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Weight (kg)" fullWidth value={editForm.weight_kg || ''}
                onChange={handleEditChange('weight_kg')} size="small" type="number" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="School" fullWidth value={editForm.school || ''}
                onChange={handleEditChange('school')} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Landmark" fullWidth value={editForm.landmark || ''}
                onChange={handleEditChange('landmark')} size="small" />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Address" fullWidth multiline rows={2} value={editForm.address || ''}
                onChange={handleEditChange('address')} size="small" />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Health Conditions / Notes" fullWidth multiline rows={2}
                value={editForm.health_condition_details || ''}
                onChange={handleEditChange('health_condition_details')} size="small" />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Past Karate Experience" fullWidth multiline rows={2}
                value={editForm.past_karate_details || ''}
                onChange={handleEditChange('past_karate_details')} size="small" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setEditStudent(null)} color="inherit">Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDelete
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Student"
        message={`Are you sure you want to delete "${deleteTarget?.full_name}"? This action cannot be undone.`}
        requireConfirmation={deleteTarget?.full_name}
      />

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2, boxShadow: 4 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CustomStudentTable;
