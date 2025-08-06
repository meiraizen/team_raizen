import React from "react";
import IconButton from "@mui/material/IconButton";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <IconButton
      onClick={() => navigate(-1)}
      color="primary"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius:'50%',
        width: 44,
        height: 20,
                background: "#575757ff",color: "white",
              boxShadow: 1,
        "&:hover": { background: "#000" },
      }}
      aria-label="Go back"
    >
    <ArrowBack />
    </IconButton>
  );
}
