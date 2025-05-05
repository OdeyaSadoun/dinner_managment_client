import React, { useState, useEffect } from "react";

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/layouts/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import TablesView from "./views/TablesView";
import ParticipantsView from "./views/ParticipantsView";
import UsersManagement from "./views/UsersManagement";
import { Box } from "@mui/material";
import axios from "axios";
import isAdmin, { isTokenExpired } from "./utils/auth";
import Footer from "./components/layouts/Footer";

export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem("username") || "");
  const [tables, setTables] = useState([]);

  useEffect(() => {
    if (isTokenExpired()) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      setUser("");
    }
  }, []);

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
      <Box
        display="flex"
        flexDirection="column"
        minHeight="100vh"
      >
        {user && <Navbar user={user} setUser={setUser} />}

        {/* תוכן ראשי שיכול להתארך או להתכווץ */}
        <Box flex="1">
          <Routes>
            <Route path="/home" element={user ? <Home user={user} /> : <Navigate to="/login" />} />
            <Route path="/tables" element={user ? <TablesView tables={tables} setTables={setTables} updateTables={updateTables} /> : <Navigate to="/login" />} />
            <Route path="/participants" element={user ? <ParticipantsView tables={tables} setTables={setTables} updateTables={updateTables} /> : <Navigate to="/login" />} />
            <Route path="/login" element={user ? <Navigate to="/home" /> : <Login setUser={setUser} />} />
            <Route path="/users" element={isAdmin() ? <UsersManagement /> : <Navigate to="/home" />} />
            <Route path="*" element={<Navigate to={user ? "/home" : "/login"} />} />
          </Routes>
        </Box>

        <Footer /> {/* תמיד יוצמד לתחתית, ויזוז אם יש תוכן מעליו */}
      </Box>
    </Router>
  );
}
