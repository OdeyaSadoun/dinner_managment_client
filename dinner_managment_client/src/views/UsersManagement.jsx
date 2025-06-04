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
import DeleteDialog from "../components/dialogs/DeleteDialog";
import isAdmin from "../utils/auth";
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { HOST } from "../config";


export default function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    password: "123456",
    role: "user",
  });

  const admin = isAdmin();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log({ token });
        console.log(isAdmin());


        const response = await axios.get(`http://${HOST}:8000/auth/get_all_users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log({ response });

        if (response.data.status === "success" && Array.isArray(response.data.data.users)) {
          const usersWithId = response.data.data.users.map(({ _id, ...rest }) => ({
            ...rest,
            id: _id,
          }));
          console.log(usersWithId);

          setUsers(usersWithId);
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
    setHasSearched(true);
    setFilteredUsers(filteredData);
  };


  const handleOpenDialog = () => {
    setNewUser({
      name: "",
      username: "",
      password: "123456",
      role: "user",
    });
    setOpen(true);
  };

  const handleCloseDialog = () => setOpen(false);

  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://${HOST}:8000/auth/register`,
        newUser,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);

      if (response.data.status === "success") {
        setUsers((prev) => [...prev, { ...newUser, id: response.data.data.inserted_id }]);
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

  const confirmDeleteUser = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`http://${HOST}:8000/auth/delete_user/${userToDelete.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers((prev) => prev.filter((user) => user.id !== userToDelete.id));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleEditUser = (user) => {
    setNewUser({
      ...user,
      id: user.id || user._id, // ← בדיקה כפולה
    });
    setOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`http://${HOST}:8000/auth/update_user/${newUser.id}`, newUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === "success") {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === newUser.id ? newUser : user
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
              onClick={() => confirmDeleteUser(params.row)}
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
      ) : hasSearched && filteredUsers.length === 0 ? (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            לא נמצאו תוצאות.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ height: "calc(100vh - 250px)" }}>
          <DataGrid
            rows={filteredUsers.length > 0 ? filteredUsers : users}
            columns={columns.map((column) => ({ ...column, align: "center" }))}
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
          <Typography sx={{ mt: 2 }}>בחר תפקיד:</Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <Button
              variant={newUser.role === "user" ? "contained" : "outlined"}
              onClick={() => setNewUser({ ...newUser, role: "user" })}
            >
              משתמש
            </Button>
            <Button
              variant={newUser.role === "admin" ? "contained" : "outlined"}
              onClick={() => setNewUser({ ...newUser, role: "admin" })}
            >
              מנהל
            </Button>
          </Box>

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
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteUser}
        title="אישור מחיקת משתמש"
        message="האם אתה בטוח שברצונך למחוק משתמש זה?"
        confirmText="מחק"
        cancelText="ביטול"
      />

    </Container>
  );
}
