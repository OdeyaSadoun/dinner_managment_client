import React from "react";
import { Container } from "@mui/material";
import useTablesData from "../hooks/useTablesData";
import useDragAndDrop from "../hooks/useDragAndDrop";
import useTableActions from "../hooks/useTableActions";
import DeleteDialog from "../components/dialogs/DeleteDialog";
import AddTableDialog from "../components/dialogs/AddTableDialog";
import TablesLayout from "../components/layouts/TablesLayout";
import isAdmin from "../utils/auth";


export default function TablesView() {
  const { tables, setTables } = useTablesData();
  const { handleDragStart, handleDrop, handleDragOver } = useDragAndDrop(tables, setTables);
  const tableActions = useTableActions(setTables);
  const admin = isAdmin();
  console.log(admin);
  
  return (
    <Container maxWidth="lg" sx={{ mt: 8, height: "80vh", position: "relative" }}>
      <TablesLayout
        tables={tables}
        handleOpenDialog={admin ? tableActions.handleOpenDialog : undefined}
        handleDragStart={admin ? handleDragStart : undefined}
        handleDragOver={admin ? handleDragOver : undefined}
        handleDrop={admin ? handleDrop : undefined}
        confirmDeleteTable={admin ? tableActions.confirmDeleteTable : undefined}
        handleChairClick={tableActions.handleChairClick}
        admin={admin}
      />
      {admin && (
        <AddTableDialog
          open={tableActions.openDialog}
          onClose={tableActions.handleCloseDialog}
          onConfirm={tableActions.handleAddTable}
          tableNumber={tableActions.tableNumber}
          setTableNumber={tableActions.setTableNumber}
          chairs={tableActions.chairs}
          setChairs={tableActions.setChairs}
          tableShape={tableActions.tableShape}
          setTableShape={tableActions.setTableShape}
          tableGender={tableActions.tableGender}
          setTableGender={tableActions.setTableGender}
        />
      )}

      {admin && (
        <DeleteDialog
          open={tableActions.deleteDialogOpen}
          onClose={() => tableActions.setDeleteDialogOpen(false)}
          onConfirm={tableActions.handleDeleteTable}
          title="אישור מחיקת שולחן"
          message="האם אתה בטוח שברצונך למחוק את השולחן?"
          confirmText="מחק"
          cancelText="ביטול"
        />
      )}
    </Container>
  );
}
