import React, { useEffect, useState } from "react";
import {
    Box,
    Container,
    Checkbox,
    Button
} from "@mui/material";
import axios from "axios";
import isAdmin from "../utils/auth";
import DeleteDialog from "../components/dialogs/DeleteDialog";
import AddAndEditParticipantDialog from "../components/dialogs/AddAndEditParticipantDialog";
import ParticipantsTable from "../components/tables/ParticipantsTable";


export default function ParticipantsView() {
    const [participants, setParticipants] = useState([]);
    const [tables, setTables] = useState([]);
    const [tableMapping, setTableMapping] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const [filteredParticipants, setFilteredParticipants] = useState([]);
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

    const admin = isAdmin()

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const response = await axios.get("http://localhost:8000/table");
                if (response.data.status === "success" && Array.isArray(response.data.data.tables)) {
                    setTables(response.data.data.tables);

                    const mapping = response.data.data.tables.reduce((acc, table) => {
                        acc[table.table_number] = table.id;
                        return acc;
                    }, {});
                    setTableMapping(mapping);
                }
            } catch (error) {
                console.error("Error fetching tables:", error);
            }
        };

        const fetchParticipants = async () => {
            try {
                const response = await axios.get("http://localhost:8000/person");
                if (response.data.status === "success" && response.data.data.people) {
                    setParticipants(response.data.data.people);
                } else {
                    setError("Failed to fetch participants.");
                }
            } catch (err) {
                setError("An error occurred while fetching participants.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTables();
        fetchParticipants();
    }, []);

    useEffect(() => {
        if (participants.length > 0) {
            setFilteredParticipants(participants);
            setLoading(false); // רק עכשיו מסיימים את הטעינה
        }
    }, [participants]);


    const handleCheckboxChange = async (participant) => {
        try {
            const updatedParticipant = {
                ...participant,
                is_reach_the_dinner: !participant.is_reach_the_dinner,
            };
            const tableId = tableMapping[participant.table_number];
            if (tableId) {
                if (updatedParticipant.is_reach_the_dinner) {
                    await axios.patch(`http://localhost:8000/person/seat/${participant.id}`, {
                        table_id: tableId,
                    });
                } else {
                    await axios.patch(`http://localhost:8000/person/unseat/${participant.id}`, {
                        table_id: tableId,
                    });
                }
            } else {
                console.error("Table ID not found for table number:", participant.table_number);
            }

            setParticipants((prev) =>
                prev.map((p) => (p.id === participant.id ? updatedParticipant : p))
            );
        } catch (error) {
            console.error("Error updating participant or table:", error);
            alert("Failed to update participant. Please try again.");
        }
    };

    const confirmDeleteParticipant = (id) => {
        setParticipantToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleSearch = (filteredData) => {
        setFilteredParticipants(filteredData.length > 0 ? filteredData : participants);
    };

    const handleOpenDialog = () => setOpen(true);

    const handleCloseDialog = () => setOpen(false);

    const handleAddParticipant = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "http://localhost:8000/person",
                {
                    name: newParticipant.name,
                    phone: newParticipant.phone,
                    table_number: newParticipant.table_number,
                    is_reach_the_dinner: newParticipant.is_reach_the_dinner,
                    gender: newParticipant.gender,
                    contact_person: newParticipant.contact_person,
                    add_manual: newParticipant.add_manual
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
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


    const handlePrintLabel = (participant) => {
        const printContent = `
            <div>
                <h3>${participant.name}</h3>
                <p>טלפון: ${participant.phone}</p>
                <p>מספר שולחן: ${participant.table_number}</p>
            </div>
        `;
        const printWindow = window.open("", "_blank");
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    };

    const handleDeleteParticipant = async () => {
        if (!participantToDelete) return;
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No authentication token found");
            }

            await axios.patch(`http://localhost:8000/person/delete/${participantToDelete}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setParticipants((prev) => prev.filter((participant) => participant.id !== participantToDelete));
        } catch (error) {
            console.error("Error deleting participant:", error);
            alert("Failed to delete participant. Please try again.");
        } finally {
            setDeleteDialogOpen(false);
            setParticipantToDelete(null);
        }
    };

    const handleEditParticipant = (participant) => {
        console.log(participant);

        setNewParticipant({
            ...participant,
            id: participant.id || participant._id,
        });
        setOpen(true);
    };

    const handleSaveEdit = async () => {
        try {
            const updatedParticipant = { ...newParticipant };
            console.log(updatedParticipant);

            const token = localStorage.getItem("token");
            const response = await axios.put(`http://localhost:8000/person/${updatedParticipant.id}`,
                {
                    id: updatedParticipant.id,
                    name: updatedParticipant.name,
                    phone: updatedParticipant.phone,
                    table_number: updatedParticipant.table_number,
                    is_reach_the_dinner: updatedParticipant.is_reach_the_dinner,
                    gender: updatedParticipant.gender,
                    contact_person: updatedParticipant.contact_person,
                    add_manual: updatedParticipant.add_manual
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

            if (response.data.status === "success") {
                setParticipants((prev) =>
                    prev.map((participant) =>
                        participant.id === updatedParticipant.id ? updatedParticipant : participant
                    )
                );
            }
            handleCloseDialog(); // סגירת הדיאלוג לאחר השמירה
        } catch (error) {
            console.error("Error updating participant:", error);
            alert("Failed to update participant. Please try again.");
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 8, minHeight: "80vh" }}>
            <ParticipantsTable
                participants={participants}
                filteredParticipants={filteredParticipants}
                loading={loading}
                error={error}
                handleSearch={handleSearch}
                handleOpenDialog={handleOpenDialog}
                admin={admin}
                handleCheckboxChange={handleCheckboxChange}
                handlePrintLabel={handlePrintLabel}
                handleEditParticipant={handleEditParticipant}
                confirmDeleteParticipant={confirmDeleteParticipant}
            />

            <AddAndEditParticipantDialog
                open={open}
                onClose={handleCloseDialog}
                newParticipant={newParticipant}
                setNewParticipant={setNewParticipant}
                onSave={newParticipant.id ? handleSaveEdit : handleAddParticipant}
            />

            <DeleteDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDeleteParticipant}
                title="אישור מחיקת משתתף"
                message="האם אתה בטוח שברצונך למחוק משתתף זה?"
                confirmText="מחק"
                cancelText="ביטול"
            />
        </Container>
    );
}
