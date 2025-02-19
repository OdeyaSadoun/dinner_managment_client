import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Container,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import SearchBar from "../components/layouts/SearchBar";
import isAdmin from "../utils/auth";

export default function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    role: "",
  });

  const admin = isAdmin();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log({token});
        console.log(isAdmin());
        
        
        const response = await axios.get("http://localhost:8000/auth/get_all_users", {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log({response});
        
        if (response.data.status === "success" && Array.isArray(response.data.data.users)) {
          setUsers(response.data.data.users);
        } else {
          setError("Failed to fetch users.");
        }
      } catch (err) {
        setError("An error occurred while fetching users.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = (filteredData) => {
    setFilteredUsers(filteredData);
  };

  const handleOpenDialog = () => setOpen(true);

  const handleCloseDialog = () => setOpen(false);

  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8000/auth/register",
        {
          name: newUser.name,
          username: newUser.username,
          role: newUser.role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        setUsers((prev) => [...prev, response.data.data]);
        setNewUser({ name: "", username: "", role: "" });
        handleCloseDialog();
      } else {
        alert("Failed to add user.");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      alert("An error occurred while adding the user.");
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      await axios.delete(`http://localhost:8000/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  const handleEditUser = (user) => {
    setNewUser({
      ...user,
      id: user.id,
    });
    setOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const updatedUser = { ...newUser };

      const token = localStorage.getItem("token");
      const response = await axios.put(`http://localhost:8000/users/${updatedUser.id}`, updatedUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === "success") {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === updatedUser.id ? updatedUser : user
          )
        );
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user. Please try again.");
    }
  };

  const columns = [
    { field: "name", headerName: "שם", flex: 1, editable: admin },
    { field: "username", headerName: "שם משתמש", flex: 1, editable: admin },
    { field: "role", headerName: "תפקיד", flex: 1, editable: admin },
    {
      field: "actions",
      headerName: "פעולות",
      flex: 1,
      renderCell: (params) =>
        admin ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              height: "100%",
            }}
          >
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => handleEditUser(params.row)}
            >
              ערוך
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleDeleteUser(params.row.id)}
            >
              מחק
            </Button>
          </Box>
        ) : null,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 8, minHeight: "80vh" }}>
      <Typography variant="h4" align="center" gutterBottom>
        משתמשים
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <SearchBar
          data={users}
          onSearch={handleSearch}
          searchBy={[
            (user) => user.name,
            (user) => user.username,
          ]}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenDialog}
          sx={{
            alignSelf: "flex-end",
          }}
        >
          הוסף משתמש
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      ) : filteredUsers.length === 0 && users.length > 0 ? (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            לא נמצאו תוצאות.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            height: "calc(100vh - 250px)",
          }}
        >
          <DataGrid
            rows={filteredUsers.length > 0 ? filteredUsers : users}
            columns={columns.map((column) => ({
              ...column,
              align: "center",
            }))}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            getRowId={(row) => row.id}
          />
        </Box>
      )}

      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>{newUser.id ? "ערוך משתמש" : "הוסף משתמש"}</DialogTitle>
        <DialogContent>
          <TextField
            label="שם"
            value={newUser.name}
            onChange={(e) =>
              setNewUser({ ...newUser, name: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="שם משתמש"
            value={newUser.username}
            onChange={(e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="תפקיד"
            value={newUser.role}
            onChange={(e) =>
              setNewUser({ ...newUser, role: e.target.value })
            }
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            ביטול
          </Button>
          <Button
            onClick={newUser.id ? handleSaveEdit : handleAddUser}
            color="primary"
          >
            {newUser.id ? "שמור" : "הוסף"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
