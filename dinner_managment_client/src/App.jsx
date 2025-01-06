import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar"; // Navbar שמיובא
import Home from "./pages/Home"; // עמוד הבית
import Login from "./pages/Login"; // עמוד ההתחברות
import TablesView from "./views/TablesView"; // תצוגת השולחנות
import ParticipantsView from "./views/ParticipantsView"; // תצוגת המשתתפים
import { Box } from "@mui/material";
import axios from "axios"; // נדרשת לשימוש ב-updateTables
import isAdmin from "./utils/auth";
import UsersManagement from "./views/UsersManagement";

export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem("username") || ""); // אחזור שם משתמש מ-Local Storage
  const [tables, setTables] = useState([]); // הגדרת ה-state לשולחנות

  const updateTables = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/table", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status === "success" && Array.isArray(response.data.data.tables)) {
        setTables(response.data.data.tables);
      }
    } catch (error) {
      console.error("Error updating tables:", error);
    }
  };

  return (
    <Router>
      <Box>
        {user && <Navbar user={user} setUser={setUser} />}

        <Routes>
          <Route
            path="/home"
            element={user ? <Home user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/tables"
            element={
              user ? (
                <TablesView tables={tables} setTables={setTables} updateTables={updateTables} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/participants"
            element={
              user ? (
                <ParticipantsView
                  tables={tables}
                  setTables={setTables}
                  updateTables={updateTables}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/login"
            element={
              user ? <Navigate to="/home" /> : <Login setUser={setUser} />
            }
          />
          <Route
            path="/users"
            element={isAdmin() ? <UsersManagement /> : <Navigate to="/home" />}
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
