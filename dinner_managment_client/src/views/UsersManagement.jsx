import React, { useEffect, useState } from "react";
import { Container, Typography, Button, Box, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:8000/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === "success") {
        setUsers(response.data.data.users);
      } else {
        setError("Failed to fetch users.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (userData) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post("http://localhost:8000/users", userData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === "success") {
        setUsers((prev) => [...prev, response.data.data.user]);
      }
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleDeleteUser = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:8000/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleEditUser = async (id, updatedData) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(`http://localhost:8000/users/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === "success") {
        setUsers((prev) =>
          prev.map((user) => (user.id === id ? { ...user, ...updatedData } : user))
        );
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 150 },
    { field: "username", headerName: "שם משתמש", flex: 1 },
    { field: "role", headerName: "תפקיד", flex: 1 },
    {
      field: "actions",
      headerName: "פעולות",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setSelectedUser(params.row)}
          >
            עריכה
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleDeleteUser(params.row.id)}
          >
            מחיקה
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        ניהול משתמשים
      </Typography>

      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 2 }}
        onClick={() => setOpenDialog(true)}
      >
        הוספת משתמש חדש
      </Button>

      {loading ? (
        <Typography>טוען נתונים...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box sx={{ height: 500 }}>
          <DataGrid rows={users} columns={columns} pageSize={5} />
        </Box>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>הוספת משתמש חדש</DialogTitle>
        <DialogContent>
          <TextField
            label="שם משתמש"
            fullWidth
            margin="dense"
            onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
          />
          <TextField
            label="סיסמה"
            fullWidth
            margin="dense"
            type="password"
            onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })}
          />
          <TextField
            label="תפקיד"
            fullWidth
            margin="dense"
            onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>ביטול</Button>
          <Button
            onClick={() => {
              handleAddUser(selectedUser);
              setOpenDialog(false);
            }}
          >
            שמירה
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
