import React, { useState } from "react";
import { TextField, Button, Container, Box, Typography, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:8000/auth/login", {
        username,
        password,
      });
      if (response.data.status === "success") {
        const { username, token } = response.data.data;

        // שמירת שם משתמש וטוקן ב-Local Storage
        localStorage.setItem("username", username);
        localStorage.setItem("token", token);

        setUser(username); // עדכון סטייט המשתמש
        navigate("/home"); // מעבר לעמוד הבית
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mt: 8,
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "#fff",
        }}
      >
        <Typography variant="h4" align="center">
          התחברות
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="שם משתמש"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="סיסמה"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleLogin}>
          התחבר
        </Button>
      </Box>
    </Container>
  );
}
