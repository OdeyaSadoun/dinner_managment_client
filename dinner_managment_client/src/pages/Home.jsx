import React from "react";
import { Box, Button, Typography, Container } from "@mui/material";
import { Link } from "react-router-dom";

export default function Home({ user }) {
  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Typography variant="h4">ברוך הבא, {user}</Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="contained" component={Link} to="/tables">
            תצוגת שולחנות
          </Button>
          <Button variant="contained" component={Link} to="/participants">
            משתתפים בדינר
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
