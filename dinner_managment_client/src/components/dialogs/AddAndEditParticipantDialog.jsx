import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
} from "@mui/material";

const AddAndEditParticipantDialog = ({ open, onClose, newParticipant, setNewParticipant, onSave }) => {
  const [genderDialogOpen, setGenderDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  useEffect(() => {
    if (open && !newParticipant.id) {
      setNewParticipant({
        name: "",
        phone: "",
        table_number: "",
        is_reach_the_dinner: false,
        gender: "male",
        contact_person: "",
        add_manual: false,
      });
    }
  }, [open, newParticipant.id, setNewParticipant]);

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

        <TextField
          label="איש קשר"
          value={newParticipant.contact_person || ""}
          onChange={(e) => setNewParticipant({ ...newParticipant, contact_person: e.target.value })}
          fullWidth
          margin="normal"
        />

        <Typography sx={{ mt: 2 }}>בחר מגדר:</Typography>
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <Button
            variant={newParticipant.gender === "male" ? "contained" : "outlined"}
            onClick={() => setNewParticipant({ ...newParticipant, gender: "male" })}
          >
            זכר
          </Button>
          <Button
            variant={newParticipant.gender === "female" ? "contained" : "outlined"}
            onClick={() => setNewParticipant({ ...newParticipant, gender: "female" })}
          >
            נקבה
          </Button>
        </Box>

        <Typography sx={{ mt: 2 }}>האם הגיע לדינר?</Typography>
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <Button
            variant={newParticipant.is_reach_the_dinner ? "contained" : "outlined"}
            onClick={() => setNewParticipant({ ...newParticipant, is_reach_the_dinner: true })}
          >
            כן
          </Button>
          <Button
            variant={!newParticipant.is_reach_the_dinner ? "contained" : "outlined"}
            onClick={() => setNewParticipant({ ...newParticipant, is_reach_the_dinner: false })}
          >
            לא
          </Button>
        </Box>

        <Typography sx={{ mt: 2 }}>האם נוסף ידנית?</Typography>
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <Button
            variant={newParticipant.add_manual ? "contained" : "outlined"}
            onClick={() => setNewParticipant({ ...newParticipant, add_manual: true })}
          >
            כן
          </Button>
          <Button
            variant={!newParticipant.add_manual ? "contained" : "outlined"}
            onClick={() => setNewParticipant({ ...newParticipant, add_manual: false })}
          >
            לא
          </Button>
        </Box>
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

export default AddAndEditParticipantDialog;