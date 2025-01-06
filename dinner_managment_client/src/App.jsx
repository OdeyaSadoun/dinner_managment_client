import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import TablesView from "./views/TablesView";
import ParticipantsView from "./views/ParticipantsView";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Navbar from "./components/Navbar"; // ייבוא ה-Navbar
import { Box } from "@mui/material";

export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem("username") || ""); // אחזור שם משתמש מ-Local Storage

  return (
    <Router>
      <Box>
        {/* הצגת Navbar אם המשתמש מחובר */}
        {user && <Navbar user={user} setUser={setUser} />}

        <Routes>
          {/* אם המשתמש לא מחובר, העברה אוטומטית לעמוד Login */}
          <Route
            path="/home"
            element={user ? <Home user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/tables"
            element={user ? <TablesView /> : <Navigate to="/login" />}
          />
          <Route
            path="/participants"
            element={user ? <ParticipantsView /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={
              user ? <Navigate to="/home" /> : <Login setUser={setUser} />
            }
          />
          <Route
            path="*"
            element={<Navigate to={user ? "/home" : "/login"} />}
          />
        </Routes>
      </Box>
    </Router>
  );
}
