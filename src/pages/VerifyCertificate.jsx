import React, { useState } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import BackButton from "../components/BackButton.jsx";
import Certificates from "../components/Certificates.jsx";
import { studentsData } from "../components/tempDatabase.js";

export default function VerifyCertificate() {
  const [searchId, setSearchId] = useState("");
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    setError("");
    setStudent(null);
    setLoading(true);
    setTimeout(() => {
      const found = studentsData.find(
        (s) => String(s.id) === String(searchId.trim())
      );
      if (found) {
        setStudent(found);
        setError("");
      } else {
        setStudent(null);
        setError("No student found with this ID.");
      }
      setLoading(false);
    }, 2000);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <BackButton />
      <Typography variant="h4" gutterBottom>
        Verify Certificate
      </Typography>
      <form
        onSubmit={handleSearch}
        style={{ display: "flex", gap: 8, marginBottom: 24 }}
      >
        <TextField
          label="Enter Student ID"
          variant="outlined"
          size="small"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          type="number"
          required
        />
        <Button type="submit" variant="contained" color="primary">
          Search
        </Button>
      </form>
      {loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 220,
            margin: "2rem 0",
            width: "100%",
          }}
        >
          <CircularProgress />
        </div>
      )}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {student && !loading && (
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <Certificates
            name={student.name}
            course={`Belt Level: ${student.belt_level}`}
            date={student.exam_records?.[student.exam_records.length - 1]?.date}
          />
        </div>
      )}
    </Container>
  );
}
