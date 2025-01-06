import React, { useState } from "react";
import {
    Box,
    TextField,
    Button,
    Typography,
    Container,
    Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login({ setUser }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // פונקציה לטיפול בהתחברות
    const handleLogin = async () => {
        setError(""); // איפוס הודעות שגיאה
        try {
            const response = await axios.post("http://localhost:8000/auth/login", {
                username,
                password,
            });

            if (response.data.status === "error") {
                setError(response.data.data["ERROR: "] || "Login failed");
            } else {
                const { data } = response.data;

                // שמירת שם המשתמש ב-state וב-Local Storage
                setUser(data.username);
                localStorage.setItem("username", data.username);
                localStorage.setItem("token", data.token)

                // ניווט לעמוד הבית
                navigate("/home");
            }
        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred. Please try again.");
        }
    };

    React.useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            setUser(storedUsername);
            navigate("/home");
        }
    }, [navigate, setUser]);

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Box
                component="form"
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    backgroundColor: "#f9f9f9",
                    p: 4,
                    borderRadius: 2,
                    boxShadow: 3,
                }}
            >
                <Typography variant="h4" align="center" gutterBottom>
                    התחברות
                </Typography>

                {error && (
                    <Alert severity="error" onClose={() => setError("")}>
                        {error}
                    </Alert>
                )}

                <TextField
                    label="שם משתמש"
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                <TextField
                    label="סיסמה"
                    type="password"
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleLogin}
                    fullWidth
                >
                    התחבר
                </Button>
            </Box>
        </Container>
    );
}
