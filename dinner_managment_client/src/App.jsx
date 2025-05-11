import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/layouts/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import TablesView from "./views/TablesView";
import ParticipantsView from "./views/ParticipantsView";
import UsersManagement from "./views/UsersManagement";
import Footer from "./components/layouts/Footer";
import { Box } from "@mui/material";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export default function App() {
  const [user, setUser] = useState("");
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [authChecked, setAuthChecked] = useState(false); // חדש
  const [tables, setTables] = useState([]);

  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const decoded = jwtDecode(token);
      let exp = decoded.exp;
      if (exp > 9999999999) exp = exp / 1000; // ביטחון מול מילישניות
      const now = Date.now() / 1000;
      const skew = 60; // 60 שניות חסד
      return exp + skew < now;
    } catch (err) {
      console.error("❌ שגיאה בפענוח הטוקן:", err);
      return true;
    }
  };

  const checkIfAdmin = (token) => {
    try {
      const decoded = jwtDecode(token);
      console.log("🔓 decoded token:", decoded);
      return decoded.role === "admin";
    } catch (err) {
      console.error("❌ שגיאה בפענוח הטוקן לאדמין:", err);
      return false;
    }
  };

  useEffect(() => {
    console.log("🚀 useEffect עלה");

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (token && !isTokenExpired(token)) {
      console.log("✅ טוקן בתוקף");
      setUser(username);
      const admin = checkIfAdmin(token);
      console.log(admin);
      setIsAdminUser(admin);
    } else {
      console.warn("⚠️ טוקן חסר או פג תוקף. מתנתקים.");
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      setUser("");
      setIsAdminUser(false);
    }

    setAuthChecked(true); // סימון שהבדיקה הסתיימה
  }, []);

  const updateTables = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/table", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status === "success" && Array.isArray(response.data.data.tables)) {
        setTables(response.data.data.tables);
        console.log("📦 טבלאות עודכנו:", response.data.data.tables);
      }
    } catch (error) {
      console.error("🛑 שגיאה בעדכון טבלאות:", error);
    }
  };

  // בזמן שהבדיקה מתבצעת – לא נטען את הרואטר
  if (!authChecked) {
    return <div>⏳ טוען מידע...</div>; // אפשר לשים Loader של MUI כאן
  }

  return (
    <Router>
      <Box display="flex" flexDirection="column" minHeight="100vh">
        {user && <Navbar user={user} setUser={setUser} />}

        <Box flex="1">
          <Routes>
            <Route path="/home" element={user ? <Home user={user} /> : <Navigate to="/login" />} />
            <Route path="/tables" element={user ? <TablesView tables={tables} setTables={setTables} updateTables={updateTables} /> : <Navigate to="/login" />} />
            <Route path="/participants" element={user ? <ParticipantsView tables={tables} setTables={setTables} updateTables={updateTables} /> : <Navigate to="/login" />} />
            <Route path="/login" element={user ? <Navigate to="/home" /> : <Login setUser={setUser} />} />
            <Route path="/users" element={isAdminUser ? <UsersManagement /> : <Navigate to="/home" />} />
            <Route path="*" element={<Navigate to={user ? "/home" : "/login"} />} />
          </Routes>
        </Box>

        <Footer />
      </Box>
    </Router>
  );
}
