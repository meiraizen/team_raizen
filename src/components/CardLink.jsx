import React from "react";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";

export default function CardLink({ title, description, to }) {
  const navigate = useNavigate();
  return (
    <Card sx={{ minWidth: 220, boxShadow: 3, borderRadius: 3 }}>
      <CardActionArea onClick={() => navigate(to)}>
        <CardContent>
          <Typography variant="h6" gutterBottom>{title}</Typography>
          <Typography variant="body2" color="text.secondary">{description}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
