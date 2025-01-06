import React, { useState } from "react";
import { Tabs, Tab, AppBar, Toolbar, Button } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

export default function Navbar({ user, setUser }) {
  const location = useLocation(); // לקבלת הנתיב הנוכחי
  const [value, setValue] = useState(() => {
    // הגדר ערך התחלתי על בסיס הנתיב
    switch (location.pathname) {
      case "/home":
        return 0;
      case "/tables":
        return 1;
      case "/participants":
        return 2;
      default:
        return 0;
    }
  });

  // שינוי הטאב הפעיל
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          textColor="inherit"
          indicatorColor="secondary"
        >
          <Tab label="עמוד הבית" component={Link} to="/home" />
          <Tab label="שולחנות" component={Link} to="/tables" />
          <Tab label="משתתפים" component={Link} to="/participants" />
        </Tabs>
        <Button
          color="inherit"
          onClick={() => {
            setUser(""); // איפוס שם המשתמש
            localStorage.removeItem("username"); // מחיקת שם המשתמש מ-Local Storage
            localStorage.removeItem("token"); // מחיקת שם המשתמש מ-Local Storage
          }}
        >
          התנתק
        </Button>
      </Toolbar>
    </AppBar>
  );
}
