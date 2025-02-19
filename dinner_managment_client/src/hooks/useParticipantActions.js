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
        add_manual: false
    });

    const handleOpenDialog = () => setOpen(true);
    const handleCloseDialog = () => setOpen(false);

    const handleAddParticipant = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post("http://localhost:8000/person", newParticipant, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.status === "success") {
                setParticipants((prev) => [...prev, response.data.data]);
                setNewParticipant({
                    name: "",
                    phone: "",
                    table_number: "",
                    is_reach_the_dinner: false,
                    gender: "male",
                    contact_person: "",
                    add_manual: false
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
        setNewParticipant({ ...participant, id: participant.id || participant._id });
        setOpen(true);
    };

    const handleSaveEdit = async () => {
        try {
            const token = localStorage.getItem("token");
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
            await axios.patch(`http://localhost:8000/person/delete/${participantToDelete}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setParticipants((prev) => prev.filter((p) => p.id !== participantToDelete));
        } catch (error) {
            console.error("Error deleting participant:", error);
            alert("Failed to delete participant. Please try again.");
        } finally {
            setDeleteDialogOpen(false);
            setParticipantToDelete(null);
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
        setDeleteDialogOpen
    };
};

export default useParticipantActions;
