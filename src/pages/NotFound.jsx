import React from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.jsx";

export default function NotFound() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  return (
    <Box sx={{ textAlign: "center", py: 8 }}>
      <Typography variant="h3" color="error" gutterBottom>
        404 - Page Not Found
      </Typography>
      <Typography variant="body1" gutterBottom>
        The page you are looking for does not exist.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate(user ? "/home" : "/login")}
        sx={{ mt: 2 }}
      >
        {user ? "Go to Home" : "Go to Login"}
      </Button>
    </Box>
  );
}
