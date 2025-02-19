import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel
} from "@mui/material";

const AddEditParticipantDialog = ({ open, onClose, newParticipant, setNewParticipant, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{newParticipant.id ? "ערוך משתתף" : "הוסף משתתף"}</DialogTitle>
      <DialogContent>
        <TextField
          label="שם"
          value={newParticipant.name || ""}
          onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="טלפון"
          value={newParticipant.phone || ""}
          onChange={(e) => setNewParticipant({ ...newParticipant, phone: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="מספר שולחן"
          type="number"
          value={newParticipant.table_number || ""}
          onChange={(e) => setNewParticipant({ ...newParticipant, table_number: e.target.value })}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>מגדר</InputLabel>
          <Select
            value={newParticipant.gender || ""}
            onChange={(e) => setNewParticipant({ ...newParticipant, gender: e.target.value })}
          >
            <MenuItem value="male">זכר</MenuItem>
            <MenuItem value="female">נקבה</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="איש קשר"
          value={newParticipant.contact_person || ""}
          onChange={(e) => setNewParticipant({ ...newParticipant, contact_person: e.target.value })}
          fullWidth
          margin="normal"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={newParticipant.is_reach_the_dinner || false}
              onChange={(e) =>
                setNewParticipant({ ...newParticipant, is_reach_the_dinner: e.target.checked })
              }
            />
          }
          label="האם הגיע לדינר?"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={newParticipant.add_manual || false}
              onChange={(e) =>
                setNewParticipant({ ...newParticipant, add_manual: e.target.checked })
              }
            />
          }
          label="נוסף ידנית"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          ביטול
        </Button>
        <Button onClick={onSave} color="primary" variant="contained">
          {newParticipant.id ? "שמור" : "הוסף"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEditParticipantDialog;
