import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    setUser(""); 
    navigate("/login"); 
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#333" }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          מערכת לניהול דינר
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button color="inherit" component={Link} to="/home">
            בית
          </Button>
          <Button color="inherit" component={Link} to="/tables">
            שולחנות
          </Button>
          <Button color="inherit" component={Link} to="/participants">
            משתתפים
          </Button>
        </Box>

        <Button color="inherit" onClick={handleLogout}>
          התנתק
        </Button>
      </Toolbar>
    </AppBar>
  );
}
