import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TablesView from "./views/TablesView";
import ParticipantsView from "./views/ParticipantsView";
import Home from "./pages/Home";
import Login from "./pages/Login";


export default function App() {
  const [user, setUser] = useState("");

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/home" element={<Home user={user} />} />
        <Route path="/tables" element={<TablesView />} />
        <Route path="/participants" element={<ParticipantsView />} />
      </Routes>
    </Router>
  );
}
