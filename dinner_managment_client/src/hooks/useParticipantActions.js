import { useState } from "react";
import axios from "axios";

const useParticipantActions = (setParticipants, tableMapping) => {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState(null);
  const [newParticipant, setNewParticipant] = useState({
    name: "",
    phone: "",
    table_number: "",
    is_reach_the_dinner: false,
    gender: "male",
    contact_person: "",
    add_manual: false,
  });

  const handleOpenDialog = () => {
    setNewParticipant({
      name: "",
      phone: "",
      table_number: "",
      is_reach_the_dinner: false,
      gender: "male",
      contact_person: "",
      add_manual: true,
    });
    setOpen(true);
  };

  const handleCloseDialog = () => setOpen(false);

  const handleAddParticipant = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8000/person",
        newParticipant,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === "success") {
        setParticipants((prev) => [...prev, response.data.data]);
        setNewParticipant({
          name: "",
          phone: "",
          table_number: "",
          is_reach_the_dinner: false,
          gender: "male",
          contact_person: "",
          add_manual: true,
        });
        handleCloseDialog();
      } else {
        alert("Failed to add participant.");
      }
    } catch (error) {
      console.error("Error adding participant:", error);
      alert("An error occurred while adding the participant.");
    }
  };

  const handleEditParticipant = (participant) => {
    setNewParticipant({
      ...participant,
      id: participant.id || participant._id,
    });
    setOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log(newParticipant);

      const response = await axios.put(
        `http://localhost:8000/person/${newParticipant.id}`,
        newParticipant,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === "success") {
        setParticipants((prev) =>
          prev.map((participant) =>
            participant.id === newParticipant.id ? newParticipant : participant
          )
        );
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error updating participant:", error);
      alert("Failed to update participant. Please try again.");
    }
  };

  const confirmDeleteParticipant = (id) => {
    setParticipantToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteParticipant = async () => {
    if (!participantToDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:8000/person/delete/${participantToDelete}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setParticipants((prev) =>
        prev.filter((p) => p.id !== participantToDelete)
      );
    } catch (error) {
      console.error("Error deleting participant:", error);
      alert("Failed to delete participant. Please try again.");
    } finally {
      setDeleteDialogOpen(false);
      setParticipantToDelete(null);
    }
  };

  const handleCheckboxChange = async (participant) => {
    try {
      const updatedParticipant = {
        ...participant,
        is_reach_the_dinner: !participant.is_reach_the_dinner,
      };
      const tableId = tableMapping[participant.table_number];
      console.log(tableId);

      if (tableId) {
        if (updatedParticipant.is_reach_the_dinner) {
          await axios.patch(
            `http://localhost:8000/person/seat/${participant.id}`,
            {
              table_id: tableId,
            }
          );
        } else {
          await axios.patch(
            `http://localhost:8000/person/unseat/${participant.id}`,
            {
              table_id: tableId,
            }
          );
        }
      } else {
        console.error(
          "Table ID not found for table number:",
          participant.table_number
        );
      }

      setParticipants((prev) =>
        prev.map((p) => (p.id === participant.id ? updatedParticipant : p))
      );
    } catch (error) {
      console.error("Error updating participant or table:", error);
      alert("Failed to update participant. Please try again.");
    }
  };

  return {
    open,
    deleteDialogOpen,
    newParticipant,
    setNewParticipant,
    handleOpenDialog,
    handleCloseDialog,
    handleAddParticipant,
    handleEditParticipant,
    handleSaveEdit,
    confirmDeleteParticipant,
    handleDeleteParticipant,
    setDeleteDialogOpen,
    handleCheckboxChange,
  };
};

export default useParticipantActions;
