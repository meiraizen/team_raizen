import React from 'react';
import CustomTable from './CustomTable';
import { studentsData } from './tempDatabase';

export default function StudentDataGrid() {
  return <CustomTable data={studentsData} />;
}
