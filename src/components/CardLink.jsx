import React from "react";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import theme from "../themecolor";

export default function CardLink({ title, description, to }) {
  const navigate = useNavigate();

  const typoStyles = {
    color: (theme) => theme.palette.text.primary,
  }
  return (
    <Card
      sx={{
        width: 250,
        height: 150,
        boxShadow: 3,
        borderRadius: 3,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardActionArea
        onClick={() => navigate(to)}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: 'background-color 0.2s, color 0.2s',
          '&:hover': {
            backgroundColor: (theme) => theme.palette.textColor.primary,
            color: (theme) => theme.palette.textColor.white,
          },
          '&:hover .MuiTypography-root': {
            color: (theme) => theme.palette.textColor.white,
          },
        }}
      >
        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Typography   sx={typoStyles} variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={typoStyles}
          >
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
