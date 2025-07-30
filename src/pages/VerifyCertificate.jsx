import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import BackButton from "../components/BackButton.jsx";

export default function VerifyCertificate() {
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <BackButton />
      <Typography variant="h4" gutterBottom>Verify Certificate</Typography>
      <Typography variant="body1">This is a placeholder for certificate verification.</Typography>
    </Container>
  );
}
