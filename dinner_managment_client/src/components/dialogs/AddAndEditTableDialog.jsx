import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
} from "@mui/material";

const AddAndEditTableDialog = ({
  open,
  onClose,
  onConfirm,
  tableNumber,
  setTableNumber,
  chairs,
  setChairs,
  tableShape,
  setTableShape,
  tableGender,
  setTableGender,
  isEditMode,
  selectedTable,
  setIsEditMode,
}) => {
  const isViewOnly = selectedTable && !isEditMode;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="table-dialog-title"
      aria-describedby="table-dialog-description"
    >
      <DialogTitle id="table-dialog-title">
        {selectedTable ? (isEditMode ? "ערוך שולחן" : "פרטי שולחן") : "הוסף שולחן חדש"}
      </DialogTitle>

      <DialogContent id="table-dialog-description">
        {isViewOnly ? (
          <Box>
            <Typography><strong>מספר שולחן:</strong> {tableNumber}</Typography>
            <Typography><strong>כמות כיסאות:</strong> {chairs}</Typography>
            <Typography><strong>סוג שולחן:</strong> {tableShape === "circle" ? "עיגול" : tableShape === "square" ? "ריבוע" : "מלבן"}</Typography>
            <Typography><strong>מגדר:</strong> {tableGender === "male" ? "גברים" : "נשים"}</Typography>
          </Box>
        ) : (
          <>
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
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>סגור</Button>

        {isViewOnly ? (
          <Button onClick={() => setIsEditMode(true)} variant="contained" color="primary">
            ערוך
          </Button>
        ) : (
          <Button onClick={onConfirm} variant="contained" color="primary">
            {selectedTable ? "שמור שינויים" : "הוסף שולחן"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AddAndEditTableDialog;
