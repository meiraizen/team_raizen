import React from "react";
import Grid from "@mui/material/Grid";
import CardLink from "../components/CardLink.jsx";

export default function HomeCards() {
  return (
    <Grid container spacing={4} sx={{ mt: 2 }}>
      <Grid item xs={12} sm={6} md={4}>
        <CardLink title="Bill Book" description="Manage your bills." to="/billbook" />
      </Grid>
      {/* <Grid item xs={12} sm={6} md={4}>
        <CardLink title="Verify Certificate" description="Verify student certificates." to="/verify-certificate" />
      </Grid> */}
      <Grid item xs={12} sm={6} md={4}>
        <CardLink title="Students Info" description="View student information." to="/students-info" />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <CardLink title="Take Attendance" description="Mark student attendance." to="/attendance" />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <CardLink title="Chat" description="Message your teammates." to="/chat" />
      </Grid>
    </Grid>
  );
}
