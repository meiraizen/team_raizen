import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import BackButton from "../components/BackButton.jsx";
import StudentDataGrid from "../components/StudentDataGrid.jsx";

export default function StudentsInfo() {
  return (
    <Container 
    // maxWidth="sm" 
    sx={{ mt: 4 }}>
      <BackButton />
      <Typography variant="h4" gutterBottom>Students Info</Typography>
      <Typography variant="body1">This is a placeholder for students information.</Typography>
      <StudentDataGrid />

    </Container>
  );
}
