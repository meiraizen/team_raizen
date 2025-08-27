import React, { useState, useEffect } from 'react';
import './App.css';

const sampleData = [
  {
    receiptNo: 'FEB-050',
    date: '42-20-5202',
    studentName: 'Nithyashree',
    paidFor: 'Monthly Fees',
    feePaid: '1,000',
    dueAmount: 0,
    total: '1,000',
    paidTo: 'Coach Amalesh',
    paymentMethod: 'UPI',
    batch: 'SS 5-6',
  },
  {
    receiptNo: 'FEB-049',
    date: '91-20-5202',
    studentName: 'Kaushik',
    paidFor: 'Monthly Fees',
    feePaid: '1,000',
    dueAmount: 0,
    total: '1,000',
    paidTo: 'Coach Amalesh',
    paymentMethod: 'UPI',
    batch: 'TT 6-7.30',
  },
  {
    receiptNo: 'FEB-048',
    date: '91-20-5202',
    studentName: 'Sharvesh Sai',
    paidFor: 'Monthly Fees',
    feePaid: '1,000',
    dueAmount: 0,
    total: '1,000',
    paidTo: 'Coach Bala Kumaran',
    paymentMethod: 'UPI',
    batch: 'TT 5-6',
  },
  {
    receiptNo: 'FEB-047',
    date: '71-20-5202',
    studentName: 'Tejesh',
    paidFor: 'Monthly Fees',
    feePaid: '1,000',
    dueAmount: 0,
    total: '1,000',
    paidTo: 'Coach Bala Kumaran',
    paymentMethod: 'UPI',
    batch: 'TT 5-6',
  },
  {
    receiptNo: 'FEB-046',
    date: '71-20-5202',
    studentName: 'Vihaan',
    paidFor: 'Monthly Fees',
    feePaid: '1,000',
    dueAmount: 0,
    total: '1,000',
    paidTo: 'Coach Bala Kumaran',
    paymentMethod: 'UPI',
    batch: 'TT 5-6',
  },
  {
    receiptNo: 'FEB-045',
    date: '71-20-5202',
    studentName: 'Keshwanth',
    paidFor: 'Monthly Fees',
    feePaid: '1,000',
    dueAmount: 0,
    total: '1,000',
    paidTo: 'Coach Amalesh',
    paymentMethod: 'UPI',
    batch: 'TT 6-7.30',
  },
  {
    receiptNo: 'FEB-044',
    date: '71-20-5202',
    studentName: 'Sanjeev A',
    paidFor: 'Monthly Fees',
    feePaid: '1,000',
    dueAmount: 0,
    total: '1,000',
    paidTo: 'Coach Amalesh',
    paymentMethod: 'UPI',
    batch: 'TT 6-7.30',
  },
  {
    receiptNo: 'FEB-043',
    date: '71-20-5202',
    studentName: 'Siddarth V',
    paidFor: 'Monthly Fees',
    feePaid: '1,000',
    dueAmount: 0,
    total: '1,000',
    paidTo: 'Coach Daniel Jr',
    paymentMethod: 'UPI',
    batch: 'SS 4-5',
  },
  {
    receiptNo: 'FEB-042',
    date: '61-20-5202',
    studentName: 'Prahasini',
    paidFor: 'Monthly Fees',
    feePaid: '1,000',
    dueAmount: 0,
    total: '1,000',
    paidTo: 'Coach Daniel Jr',
    paymentMethod: 'UPI',
    batch: 'SS 4-5',
  },
  {
    receiptNo: 'FEB-041',
    date: '41-20-5202',
    studentName: 'Pujesh Mahi',
    paidFor: 'Monthly Fees',
    feePaid: '2,000',
    dueAmount: 0,
    total: '2,000',
    paidTo: 'Coach Daniel Jr',
    paymentMethod: 'UPI',
    batch: 'SS 5-6',
  },
];

const ReceiptTable = () => {
  const [filters, setFilters] = useState({
    receiptNo: '',
    studentName: '',
    paidFor: '',
    batch: '',
    paidTo: '',
  });

  const [filteredData, setFilteredData] = useState(sampleData);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      receiptNo: '',
      studentName: '',
      paidFor: '',
      batch: '',
      paidTo: '',
    });
  };

  const reloadData = () => {
    // simulate fetch
    setFilteredData([...sampleData]);
  };

  useEffect(() => {
    const filtered = sampleData.filter(
      (item) =>
        item.receiptNo
          .toLowerCase()
          .includes(filters.receiptNo.toLowerCase()) &&
        item.studentName
          .toLowerCase()
          .includes(filters.studentName.toLowerCase()) &&
        (filters.paidFor === '' || item.paidFor === filters.paidFor) &&
        (filters.batch === '' || item.batch === filters.batch) &&
        (filters.paidTo === '' || item.paidTo === filters.paidTo)
    );
    setFilteredData(filtered);
  }, [filters]);

  const uniqueValues = (key) => [
    ...new Set(sampleData.map((item) => item[key])),
  ];

  return (
    <div className="receipt-container">
      <div className="filter-bar">
        <input
          type="text"
          name="receiptNo"
          value={filters.receiptNo}
          onChange={handleFilterChange}
          placeholder="Enter Receipt No"
        />
        <input
          type="text"
          name="studentName"
          value={filters.studentName}
          onChange={handleFilterChange}
          placeholder="Search by Name"
        />
        <select
          name="paidFor"
          value={filters.paidFor}
          onChange={handleFilterChange}
        >
          <option value="">Paid For</option>
          {uniqueValues('paidFor').map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
        <select
          name="batch"
          value={filters.batch}
          onChange={handleFilterChange}
        >
          <option value="">Batch</option>
          {uniqueValues('batch').map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
        <select
          name="paidTo"
          value={filters.paidTo}
          onChange={handleFilterChange}
        >
          <option value="">Paid To</option>
          {uniqueValues('paidTo').map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
        <button onClick={reloadData}>Reload</button>
        <button onClick={resetFilters}>Reset</button>
      </div>

      <div className="table-wrapper">
        <table className="receipt-table">
          <thead>
            <tr>
              <th>Receipt No</th>
              <th>Date</th>
              <th>Student Name</th>
              <th>Paid For</th>
              <th>Fee Paid</th>
              <th>Batch</th>
              <th>Remarks</th>
              <th>Paid To</th>
              <th>Payment Method</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="9">No data found</td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={index}>
                  <td>{item.receiptNo}</td>
                  <td>{item.date}</td>
                  <td>{item.studentName}</td>
                  <td>{item.paidFor}</td>
                  <td>{item.feePaid}</td>
                  <td>{item.batch}</td>
                  <td>-</td>
                  <td>{item.paidTo}</td>
                  <td>{item.paymentMethod}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReceiptTable;
