import React from 'react';
import CustomStudentTable from './CustomStudentTable';
import { studentsData } from './tempDatabase';

export default function StudentDataGrid() {
  return <CustomStudentTable data={studentsData} />;
}
