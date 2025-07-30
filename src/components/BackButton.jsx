import React from "react";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

export default function BackButton({ to = "/home" }) {
  const navigate = useNavigate();
  return (
    <Button
      startIcon={<ArrowBackIcon />}
      variant="outlined"
      sx={{ mb: 2 }}
      onClick={() => navigate(to)}
    >
      Back
    </Button>
  );
}
