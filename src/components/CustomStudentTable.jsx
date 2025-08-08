import React, { useState, useEffect, useMemo } from 'react';
import { studentsData } from './tempDatabase';
import './CustomStudentTable.css';

const StudentDataGrid = () => {
  const [data, setData] = useState(studentsData);
  const [filteredData, setFilteredData] = useState(studentsData);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Filter and search logic
  useEffect(() => {
    let filtered = [...studentsData];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter (using belt_level as status)
    if (statusFilter !== 'All') {
      filtered = filtered.filter(student => student.belt_level === statusFilter);
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when data changes
  }, [searchTerm, statusFilter]);

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedData = sortedData.slice(startIndex, endIndex);

  const uniqueBeltLevels = [...new Set(studentsData.map(s => s.belt_level))];

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = () => {
    if (selectedRows.size === displayedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(displayedData.map(student => student.id)));
    }
  };

  const handleRowSelect = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleRowExpand = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);
      
      if (currentPage <= 3) {
        endPage = maxVisiblePages;
      }
      
      if (currentPage > totalPages - 3) {
        startPage = totalPages - maxVisiblePages + 1;
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="table-view">
      {/* Filter Section */}
      <div className="filter">
        <div className="filter-search">
          <input
            type="text"
            name="search"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>

        <div className="filter__controls">
          <div className="filter-selection">
            <div className="filter-selection__label">Belt Level</div>
            <div className={`filter-select ${isFilterOpen ? 'active' : ''}`} onClick={() => setIsFilterOpen(!isFilterOpen)}>
              <input readOnly type="text" name="status" value={statusFilter} />
              <svg className="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2"/>
              </svg>
              
              <ul className="filter-select__options">
                <li className={statusFilter === 'All' ? 'selected' : ''} onClick={() => setStatusFilter('All')}>All</li>
                {uniqueBeltLevels.map(level => (
                  <li key={level} className={statusFilter === level ? 'selected' : ''} onClick={() => setStatusFilter(level)}>
                    {level}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="filter-selection">
            <div className="filter-selection__label">Per Page</div>
            <div className="rows-per-page-select">
              <select 
                value={rowsPerPage} 
                onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="filter-export">
            <span>Export</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.7893 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table">
        <div className="table__inner">
          <div className="table__scroll">
            {/* Table Header */}
            <div className="table__head">
              <div className="table__tr">
                <div className="table__td table__th fixed">
                  <div className="table-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedRows.size === displayedData.length && displayedData.length > 0}
                        onChange={handleSelectAll}
                      />
                    </label>
                  </div>
                </div>
                <div className="table__td table__th expand-column">
                  <span>Details</span>
                </div>
                <div className="table__td table__th fixed">
                  <div className="table-control" onClick={() => handleSort('name')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>Name</span>
                  </div>
                </div>
                <div className="table__td table__th">
                  <div className="table-control" onClick={() => handleSort('age')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>Age</span>
                  </div>
                </div>
                <div className="table__td table__th">
                  <div className="table-control" onClick={() => handleSort('gender')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>Gender</span>
                  </div>
                </div>
                <div className="table__td table__th">
                  <div className="table-control" onClick={() => handleSort('belt_level')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>Belt Level</span>
                  </div>
                </div>
                <div className="table__td table__th">
                  <div className="table-control">
                    <span>Contact</span>
                  </div>
                </div>
                <div className="table__td table__th">
                  <div className="table-control">
                    <span>Email</span>
                  </div>
                </div>
                <div className="table__td table__th">
                  <div className="table-control">
                    <span>Address</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="table__body">
              {displayedData.length === 0 ? (
                <div className="table-empty">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 16S14 14 12 14 8 16 8 16" stroke="currentColor" strokeWidth="2"/>
                    <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" strokeWidth="2"/>
                    <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <div className="table-empty__data">
                    <div className="table-empty__title">No students found</div>
                    <div className="table-empty__text">Try adjusting your search or filter criteria</div>
                  </div>
                </div>
              ) : (
                displayedData.map((student, index) => (
                  <React.Fragment key={student.id}>
                    <div className="table__tr animate" style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="table__td fixed">
                        <div className="table-checkbox">
                          <label>
                            <input
                              type="checkbox"
                              checked={selectedRows.has(student.id)}
                              onChange={() => handleRowSelect(student.id)}
                            />
                          </label>
                        </div>
                      </div>
                      <div className="table__td expand-column">
                        <button 
                          className="expand-button"
                          onClick={() => handleRowExpand(student.id)}
                        >
                          <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none"
                            style={{
                              transform: expandedRows.has(student.id) ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.3s ease'
                            }}
                          >
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </button>
                      </div>
                      <div className="table__td fixed">
                        <div className="table-text student-name">{student.name}</div>
                      </div>
                      <div className="table__td">
                        <div className="table-text">{student.age}</div>
                      </div>
                      <div className="table__td">
                        <div className="table-text">{student.gender}</div>
                      </div>
                      <div className="table__td">
                        <div className={`table-status ${student.belt_level.toLowerCase().replace(' ', '-')}`}>
                          {student.belt_level}
                        </div>
                      </div>
                      <div className="table__td">
                        <div className="table-text">{student.contact_number}</div>
                      </div>
                      <div className="table__td">
                        <div className="table-text">{student.email}</div>
                      </div>
                      <div className="table__td">
                        <div className="table-text details">{student.address}</div>
                      </div>
                    </div>
                    
                    {/* Expanded Row for Fee History */}
                    {expandedRows.has(student.id) && (
                      <div className="table__tr expanded-row">
                        <div className="table__td" style={{ width: '100%', padding: '20px' }}>
                          <div className="fee-history">
                            <h4>Fee History</h4>
                            <div className="fee-history-table">
                              <div className="fee-history-header">
                                <span>Date</span>
                                <span>Amount</span>
                                <span>Method</span>
                              </div>
                              {student.fee_history && student.fee_history.length > 0 ? (
                                student.fee_history.map((fee, idx) => (
                                  <div key={idx} className="fee-history-row">
                                    <span>{fee.date}</span>
                                    <span>${fee.amount}</span>
                                    <span>{fee.method}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="no-fee-history">No fee history available</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Table Footer with Pagination */}
        <div className="table__footer">
          <div className="table-info">
            <span className="table-counter__label">Showing</span>
            <span>{startIndex + 1}-{Math.min(endIndex, sortedData.length)}</span>
            <span>of</span>
            <span>{sortedData.length}</span>
            <span>entries</span>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>

              {getPageNumbers().map(page => (
                <button
                  key={page}
                  className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}

              <button 
                className="pagination-btn" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
          )}

          <div className="table-info"></div>
        </div>
      </div>
    </div>
  );
};

export default StudentDataGrid;
