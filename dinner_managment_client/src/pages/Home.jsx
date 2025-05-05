import React from "react";
import { Box, Typography, Container, Paper } from "@mui/material";

export default function Home({ user }) {
  return (
    <Container maxWidth="md" sx={{ mt: 10 }}>
      <Paper
        elevation={6}
        sx={{
          p: 5,
          textAlign: "center",
          background: "linear-gradient(135deg, #f3e5f5, #e1bee7)",
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "#6a1b9a" }}>
          שלום {user}!
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 2, color: "#4a148c" }}>
          ברוכים הבאים למערכת ניהול הדינר 🎉
        </Typography>

        <Typography variant="body1" sx={{ mt: 3, color: "#4e4e4e" }}>
          מערכת זו מאפשרת לנהל את רשימת המשתתפים, השולחנות, ההושבה, וההדפסות –
          בצורה פשוטה, מסודרת ונעימה לשימוש.
        </Typography>

        <Typography variant="subtitle2" sx={{ mt: 5, fontStyle: "italic", color: "#616161" }}>
          נוצרה  על ידי אודיה מימון – 054-2943408
        </Typography>
      </Paper>
    </Container>
  );
};
