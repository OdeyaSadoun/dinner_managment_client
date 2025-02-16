import { useState } from "react";
import axios from "axios";

const useTableActions = (setTables) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);
  const [tableGender, setTableGender] = useState("male");
  const [tableShape, setTableShape] = useState("circle");
  const [chairs, setChairs] = useState(8);
  const [tableNumber, setTableNumber] = useState("");

  const handleOpenDialog = () => setOpenDialog(true);
  
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
      if (!token) throw new Error("Token not found. Please login again.");

      const response = await axios.post("http://localhost:8000/table", newTable, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === "success") {
        setTables((prev) => [...prev, { ...newTable, id: response.data.data.inserted_id }]);
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error adding new table:", error);
    }
  };

  const confirmDeleteTable = (tableId) => {
    setTableToDelete(tableId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteTable = async () => {
    if (!tableToDelete) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      await axios.patch(`http://localhost:8000/table/delete/${tableToDelete}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTables((prev) => prev.filter((table) => table.id !== tableToDelete));
    } catch (error) {
      console.error("Error deleting table:", error);
      alert("Failed to delete table. Please try again.");
    } finally {
      setDeleteDialogOpen(false);
      setTableToDelete(null);
    }
  };

  return {
    openDialog,
    setOpenDialog, // מחזירים כדי שיהיה אפשר לשנות מחוץ ל-hook
    deleteDialogOpen, 
    setDeleteDialogOpen, // מחזירים כדי שיהיה אפשר לשנות מחוץ ל-hook
    tableGender,
    setTableGender,
    tableShape,
    setTableShape,
    chairs,
    setChairs,
    tableNumber,
    setTableNumber,
    handleOpenDialog,
    handleCloseDialog,
    handleAddTable,
    confirmDeleteTable,
    handleDeleteTable,
  };
};

export default useTableActions;
