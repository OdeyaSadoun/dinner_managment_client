import React, { useEffect, useState } from "react";
import {
  Typography,
  Container,
  Box,
  Button,
  Dialog,
  TextField,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { styled } from "@mui/system";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import Table from "../style/Table";
import Chair from "../style/Chair";
import DeleteDialog from "../components/dialogs/DeleteDialog";


export default function TablesView() {
  const [tables, setTables] = useState([]);
  const [tableGender, setTableGender] = useState("male"); // ברירת מחדל: זכר
  const [openDialog, setOpenDialog] = useState(false);
  const [chairs, setChairs] = useState(8);
  const [tableShape, setTableShape] = useState("circle"); // ברירת מחדל: עיגול
  const [tableNumber, setTableNumber] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);
  const [personDialogOpen, setPersonDialogOpen] = useState(false);

  // טעינת שולחנות מהשרת
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axios.get("http://localhost:8000/table");
        if (
          response.data.status === "success" &&
          Array.isArray(response.data.data.tables)
        ) {
          setTables(response.data.data.tables);
        } else {
          setTables([]);
        }
      } catch (error) {
        console.error("Error fetching tables:", error);
        setTables([]);
      }
    };

    fetchTables();
  }, []);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const confirmDeleteTable = (tableId) => {
    setTableToDelete(tableId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setChairs(8);
    setTableNumber("");
  };

  const handleAddTable = async () => {
    if (!tableNumber) {
      alert("יש להזין מספר שולחן.");
      return;
    }

    const newTable = {
      people_list: [],
      position: { x: 50, y: 50 },
      chairs,
      table_number: tableNumber,
      shape: tableShape, // הוספת סוג השולחן
      gender: tableGender, // הוספת מגדר
    };


    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found. Please login again.");
      }

      const response = await axios.post("http://localhost:8000/table", newTable, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === "success") {
        setTables((prev) => [
          ...prev,
          { ...newTable, id: response.data.data.inserted_id },
        ]);
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error adding new table:", error);
    }
  };

  const handleDragStart = (event, tableId) => {
    const { clientX, clientY } = event;
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ tableId, offsetX: clientX, offsetY: clientY })
    );
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const data = JSON.parse(event.dataTransfer.getData("text/plain"));
    const { tableId, offsetX, offsetY } = data;
    const { clientX, clientY } = event;

    const table = tables.find((t) => t.id === tableId);
    if (!table || !table.position) {
      console.error("Invalid table or position data");
      return;
    }

    const newPosition = {
      x: clientX - (offsetX - table.position.x),
      y: clientY - (offsetY - table.position.y),
    };

    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, position: newPosition } : t
      )
    );

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found. Please login again.");
      } await axios.patch(`http://localhost:8000/table/position/${tableId}`, {
        position: newPosition,
      },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error updating table position:", error);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleChairClick = async (personId) => {
    try {
      const response = await axios.get(`http://localhost:8000/person/${personId}`);
      setSelectedPerson(response.data.data.person);
      setPersonDialogOpen(true);
    } catch (error) {
      console.error("Error fetching person details:", error);
    }
  };

  const handleDeleteTable = async () => {
    if (!tableToDelete) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      await axios.patch(`http://localhost:8000/table/delete/${tableToDelete}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTables((prev) => prev.filter((table) => table.id !== tableToDelete));

      alert("השולחן נמחק בהצלחה!"); // התראה על מחיקה מוצלחת
    } catch (error) {
      console.error("Error deleting table:", error);
      alert("Failed to delete table. Please try again.");
    } finally {
      setDeleteDialogOpen(false);
      setTableToDelete(null);
    }
  };

  const handlePersonDialogClose = () => {
    setPersonDialogOpen(false);
    setSelectedPerson(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 8, height: "80vh", position: "relative" }}>
      <Typography variant="h4" align="center" gutterBottom>
        תצוגת שולחנות
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenDialog}
        sx={{ mb: 2 }}
      >
        הוסף שולחן
      </Button>

      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          backgroundColor: "#f0f0f0",
          border: "1px solid #ccc",
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {tables.length > 0 ? (
          tables.map((table) => (
            <Table
              key={table.id}
              shape={table.shape}
              gender={table.gender} // הוספת פרמטר gender כדי לשנות את הצבע
              draggable
              onDragStart={(e) => handleDragStart(e, table.id)}
              sx={{
                left: table.position?.x || 0,
                top: table.position?.y || 0,
                position: "absolute",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h6" align="center">
                שולחן {table.table_number}
              </Typography>
              <DeleteIcon
                onClick={() => confirmDeleteTable(table.id)} // שינוי הפונקציה לפתיחת הדיאלוג במקום למחוק מיד
                sx={{
                  position: "absolute",
                  top: "-20px",
                  right: "-20px",
                  backgroundColor: "white",
                  borderRadius: "50%",
                  padding: "4px",
                  color: "red",
                  fontSize: 28,
                  cursor: "pointer",
                  zIndex: 10,
                  "&:hover": {
                    color: "darkred",
                  },
                }}
              />


              {/* כיסאות מסביב לשולחן */}
              {Array.from({ length: table.chairs }).map((_, index) => {
                const person = table.people_list[index];
                const angle = (360 / table.chairs) * index;
                const radius = 60;
                const chairX = Math.cos((angle * Math.PI) / 180) * radius;
                const chairY = Math.sin((angle * Math.PI) / 180) * radius;

                return (
                  <Chair
                    key={`${table.id}-chair-${index}`}
                    isOccupied={!!person}
                    sx={{
                      left: `${50 + chairX}%`,
                      top: `${50 + chairY}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    onClick={() => person && handleChairClick(person)}
                  />
                );
              })}
            </Table>

          ))
        ) : (
          <Typography align="center" sx={{ mt: 4 }}>
            אין שולחנות להצגה.
          </Typography>
        )}
      </Box>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="add-table-dialog-title"
        aria-describedby="add-table-dialog-description"
      >
        <DialogTitle id="add-table-dialog-title">הוסף שולחן חדש</DialogTitle>
        <DialogContent id="add-table-dialog-description">
          <TextField
            autoFocus
            margin="dense"
            label="מספר שולחן"
            type="number"
            fullWidth
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          />
          <TextField
            margin="dense"
            label="כמות כיסאות"
            type="number"
            fullWidth
            value={chairs}
            onChange={(e) => setChairs(Number(e.target.value))}
          />
          <Typography sx={{ mt: 2 }}>בחר סוג שולחן:</Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <Button
              variant={tableShape === "circle" ? "contained" : "outlined"}
              onClick={() => setTableShape("circle")}
            >
              עיגול
            </Button>
            <Button
              variant={tableShape === "square" ? "contained" : "outlined"}
              onClick={() => setTableShape("square")}
            >
              ריבוע
            </Button>
            <Button
              variant={tableShape === "rectangle" ? "contained" : "outlined"}
              onClick={() => setTableShape("rectangle")}
            >
              מלבן
            </Button>
          </Box>
          <Typography sx={{ mt: 2 }}>בחר מגדר:</Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <Button
              variant={tableGender === "male" ? "contained" : "outlined"}
              onClick={() => setTableGender("male")}
            >
              גברים
            </Button>
            <Button
              variant={tableGender === "female" ? "contained" : "outlined"}
              onClick={() => setTableGender("female")}
            >
              נשים
            </Button>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>ביטול</Button>
          <Button onClick={handleAddTable} variant="contained" color="primary">
            שמור
          </Button>
        </DialogActions>
      </Dialog>

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteTable}
        title="אישור מחיקת שולחן"
        message="האם אתה בטוח שברצונך למחוק את השולחן?"
        confirmText="מחק"
        cancelText="ביטול"
      />
    </Container>
  );
}