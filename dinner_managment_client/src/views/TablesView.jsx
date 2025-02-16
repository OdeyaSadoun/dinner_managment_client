import React, { useEffect, useState } from "react";
import { Container } from "@mui/material";
import axios from "axios";
import DeleteDialog from "../components/dialogs/DeleteDialog";
import AddTableDialog from "../components/dialogs/AddTableDialog";
import TablesLayout from "../components/layouts/TablesLayout";


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
      shape: tableShape,
      gender: tableGender, 
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

  return (
    <Container maxWidth="lg" sx={{ mt: 8, height: "80vh", position: "relative" }}>
      <TablesLayout
        tables={tables}
        handleOpenDialog={handleOpenDialog}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        confirmDeleteTable={confirmDeleteTable}
        handleChairClick={handleChairClick}
      />
      <AddTableDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onConfirm={handleAddTable}
        tableNumber={tableNumber}
        setTableNumber={setTableNumber}
        chairs={chairs}
        setChairs={setChairs}
        tableShape={tableShape}
        setTableShape={setTableShape}
        tableGender={tableGender}
        setTableGender={setTableGender}
      />
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