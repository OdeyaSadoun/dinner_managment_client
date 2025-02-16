import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, TextField } from "@mui/material";

const AddTableDialog = ({
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
}) => {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="add-table-dialog-title" aria-describedby="add-table-dialog-description">
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
          <Button variant={tableShape === "circle" ? "contained" : "outlined"} onClick={() => setTableShape("circle")}>
            עיגול
          </Button>
          <Button variant={tableShape === "square" ? "contained" : "outlined"} onClick={() => setTableShape("square")}>
            ריבוע
          </Button>
          <Button variant={tableShape === "rectangle" ? "contained" : "outlined"} onClick={() => setTableShape("rectangle")}>
            מלבן
          </Button>
        </Box>
        <Typography sx={{ mt: 2 }}>בחר מגדר:</Typography>
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <Button variant={tableGender === "male" ? "contained" : "outlined"} onClick={() => setTableGender("male")}>
            גברים
          </Button>
          <Button variant={tableGender === "female" ? "contained" : "outlined"} onClick={() => setTableGender("female")}>
            נשים
          </Button>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>ביטול</Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
          שמור
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTableDialog;
