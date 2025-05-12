import axios from "axios";
import React, { useState } from "react";

const useTableActions = (setTables) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);
  const [tableGender, setTableGender] = useState("male");
  const [tableShape, setTableShape] = useState("circle");
  const [chairs, setChairs] = useState(8);
  const [tableNumber, setTableNumber] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error"); // 'success' | 'error' | 'warning' | 'info'
  const [selectedTable, setSelectedTable] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleOpenDialog = () => setOpenDialog(true);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setChairs(8);
    setTableNumber("");
  };

  const handleTableClick = (table) => {
    console.log("📌 שולחן נלחץ לעריכה:", table);
    setSelectedTable(table);
    setTableNumber(table.table_number);
    setChairs(table.chairs);
    setTableShape(table.shape);
    setTableGender(table.gender);
    setIsEditMode(false); // ❗ חשוב מאוד שיהיה false
    setOpenDialog(true);
  };  

  const handleUpdateTable = async () => {
    if (!selectedTable) return;
  
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found");
  
      const updatedTable = {
        table_number: Number(tableNumber),
        chairs: Number(chairs),
        shape: tableShape,
        gender: tableGender,
        people_list: selectedTable.people_list, // לשמור על הקיים
        position: selectedTable.position,       // לשמור על הקיים
      };
      console.log("📦 updatedTable:", updatedTable);

      const response = await axios.put(
        `http://localhost:8000/table/${selectedTable.id}`,
        updatedTable,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      if (response.data.status === "success") {
        setTables((prev) =>
          prev.map((t) =>
            t.id === selectedTable.id ? { ...t, ...updatedTable } : t
          )
        );
        setSnackbarMessage("השולחן עודכן בהצלחה");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Update error:", error);
      setSnackbarMessage("שגיאה בעדכון שולחן");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };
  

  const handleAddTable = async () => {
    if (!tableNumber) {
      setSnackbarMessage("יש להזין מספר שולחן.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    const newTable = {
      people_list: [],
      position: { x: 0, y: 0 },
      chairs,
      table_number: tableNumber,
      shape: tableShape,
      gender: tableGender,
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found. Please login again.");

      const response = await axios.post(
        "http://localhost:8000/table",
        newTable,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === "success") {
        const insertedId = response.data.data?.inserted_id;
        if (insertedId) {
          setTables((prev) => [...prev, { ...newTable, id: insertedId }]);
          handleCloseDialog();
          setSnackbarMessage("השולחן נוסף בהצלחה!");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
        } else {
          setSnackbarMessage("שגיאה בהוספת שולחן - מזהה חסר.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        }
      } else {
        const serverMessage =
          response.data?.data?.error_message ||
          "שולחן לא נוסף - ייתכן שכבר קיים.";
        setSnackbarMessage(serverMessage);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error adding new table:", error);
      setSnackbarMessage("אירעה שגיאה כללית בהוספת שולחן.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
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

      await axios.patch(
        `http://localhost:8000/table/delete/${tableToDelete}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
    snackbarOpen,
    setSnackbarOpen,
    snackbarMessage,
    setSnackbarMessage,
    snackbarSeverity,
    setSnackbarSeverity,
    handleTableClick,
    selectedTable,
    setSelectedTable,
    isEditMode,
    setIsEditMode,
    handleUpdateTable
  };
};

export default useTableActions;
