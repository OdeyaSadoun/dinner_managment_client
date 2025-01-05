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
import axios from "axios";

// עיצוב לשולחן
const Table = styled(Box)(({ theme }) => ({
  width: 100,
  height: 100,
  backgroundColor: "#f5f5f5",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "2px solid #000",
  cursor: "grab",
  position: "absolute",
}));

// עיצוב לכיסא
const Chair = styled(Box)(({ theme, isOccupied }) => ({
  width: 30,
  height: 30,
  backgroundColor: isOccupied ? "#ffa726" : "#d1e7dd",
  borderRadius: "50%",
  border: "1px solid #000",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "absolute",
  cursor: isOccupied ? "pointer" : "default",
}));

export default function TablesView() {
  const [tables, setTables] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [chairs, setChairs] = useState(8);
  const [tableNumber, setTableNumber] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personDialogOpen, setPersonDialogOpen] = useState(false);

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
      position: { x: 50, y: 50 },
      chairs,
      people_list: [],
      table_number: tableNumber,
    };

    try {
      const response = await axios.post("http://localhost:8000/table", newTable);
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
      await axios.patch(`http://localhost:8000/table/position/${tableId}`, {
        position: newPosition,
      });
    } catch (error) {
      console.error("Error updating table position:", error);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleChairClick = async (personId) => {
    try {
        console.log({personId});
        
      const response = await axios.get(`http://localhost:8000/person/${personId}`);      
      setSelectedPerson(response.data.data.person);
      setPersonDialogOpen(true);
    } catch (error) {
      console.error("Error fetching person details:", error);
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
              draggable
              onDragStart={(e) => handleDragStart(e, table.id)}
              sx={{
                left: table.position?.x || 0,
                top: table.position?.y || 0,
              }}
            >
              שולחן {table.table_number}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>ביטול</Button>
          <Button onClick={handleAddTable} variant="contained" color="primary">
            שמור
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={personDialogOpen} onClose={handlePersonDialogClose}>
        <DialogTitle>פרטי משתתף</DialogTitle>
        <DialogContent>
          {selectedPerson ? (
            <>
              <Typography>שם: {selectedPerson.name}</Typography>
              <Typography>טלפון: {selectedPerson.phone}</Typography>
            </>
          ) : (
            <Typography>טוען נתונים...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePersonDialogClose}>סגור</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
