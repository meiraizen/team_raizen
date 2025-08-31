import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import BillbookFormHandler from '../components/billbook/BillbookFormHandler';
import BackButton from "../components/BackButton.jsx";
import { IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import table from '../assets/table.svg'


export default function Billbook() {
  return (
    <><div style={{ display: 'flex', alignItems: 'center', justifyContent:'space-between' }}> <BackButton /> <IconButton component={Link} to="/receipttable">
  <img src={table} alt="Table Icon" style={{ width: 30, height: 30 }} />
    </IconButton></div> 
    <Container maxWidth="sm" sx={{ mt: 4 }}>
     
       {/* <BackButton /> */}
      <Typography variant="body1" gutterBottom sx={{ color: 'text.secondary' }}>Manage Student bills here. Only authenticated users can access this page.</Typography>
      <BillbookFormHandler />
    </Container>
    </>
  );
}
