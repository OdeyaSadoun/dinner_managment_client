import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Container,
    Checkbox,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import SearchBar from "../components/SearchBar";
import isAdmin from "../utils/auth";

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
        is_reach_the_dinner: false
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
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.status === "success") {
                setParticipants((prev) => [...prev, response.data.data]);
                setNewParticipant({ name: "", phone: "", table_number: "" });
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
        setNewParticipant({
            ...participant,
            id: participant.id || participant._id,
        });
        setOpen(true);
    };

    const handleSaveEdit = async () => {
        try {
            const updatedParticipant = { ...newParticipant };
            console.log({ updatedParticipant });

            const token = localStorage.getItem("token");
            const response = await axios.put(`http://localhost:8000/person/${updatedParticipant.id}`,
                {
                    id: updatedParticipant.id,
                    name: updatedParticipant.name,
                    phone: updatedParticipant.phone,
                    table_number: updatedParticipant.table_number,
                    is_reach_the_dinner: updatedParticipant.is_reach_the_dinner,
                    date_created: updatedParticipant.date_created,
                    is_active: updatedParticipant.is_active
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

    const columns = [

        { field: "name", headerName: "שם", flex: 1, editable: admin },
        { field: "phone", headerName: "טלפון", flex: 1, editable: admin },
        { field: "table_number", headerName: "מספר שולחן", flex: 1, editable: admin },
        {
            field: "is_reach_the_dinner",
            headerName: "הגיע לדינר?",
            flex: 1,
            renderCell: (params) => (
                <Checkbox
                    checked={params.row.is_reach_the_dinner || false}
                    onChange={() => handleCheckboxChange(params.row)}
                    disabled={!isAdmin}
                />
            ),
        },
        {
            field: "print",
            headerName: "הדפס פתקית",
            flex: 1,
            renderCell: (params) => (
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handlePrintLabel(params.row)}
                >
                    הדפס
                </Button>
            ),
        },
        {
            field: "actions",
            headerName: "פעולות",
            flex: 1,
            renderCell: (params) =>
                admin ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center", // מרכז את הכפתורים אופקית
                            alignItems: "center", // מרכז את הכפתורים אנכית
                            gap: 1, // מרווח בין הכפתורים
                            height: "100%", // מוודא התאמה מלאה לגובה התא
                        }}
                    >
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => handleEditParticipant(params.row)}
                        >
                            ערוך
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => confirmDeleteParticipant(params.row.id || params.row._id)} // שינוי כאן
                        >
                            מחק
                        </Button>
                    </Box>
                ) : null,
        },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 8, minHeight: "80vh" }}>
            <Typography variant="h4" align="center" gutterBottom>
                משתתפים בדינר
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <SearchBar
                    data={participants}
                    onSearch={handleSearch}
                    searchBy={[
                        (participant) => participant.name,
                        (participant) => participant.phone,
                    ]}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenDialog}
                    sx={{
                        alignSelf: "flex-end",
                    }}
                >
                    הוסף משתתף
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 4 }}>
                    {error}
                </Alert>
            ) : filteredParticipants.length === 0 && participants.length === 0 ? ( // שינוי התנאי כאן
                <Box sx={{ mt: 4, textAlign: "center" }}>
                    <Typography variant="h6" color="text.secondary">
                        לא נמצאו תוצאות.
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ height: "calc(100vh - 250px)" }}>
                    <DataGrid
                        rows={filteredParticipants}
                        columns={columns.map((column) => ({
                            ...column,
                            align: "center",
                        }))}
                        pageSize={10}
                        rowsPerPageOptions={[10, 20, 50]}
                        getRowId={(row) => row.id || row._id}
                    />
                </Box>
            )}


            <Dialog open={open} onClose={handleCloseDialog}>
                <DialogTitle>{newParticipant.id ? "ערוך משתתף" : "הוסף משתתף"}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="שם"
                        value={newParticipant.name}
                        onChange={(e) =>
                            setNewParticipant({ ...newParticipant, name: e.target.value })
                        }
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="טלפון"
                        value={newParticipant.phone}
                        onChange={(e) =>
                            setNewParticipant({ ...newParticipant, phone: e.target.value })
                        }
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="מספר שולחן"
                        value={newParticipant.table_number}
                        onChange={(e) =>
                            setNewParticipant({ ...newParticipant, table_number: e.target.value })
                        }
                        fullWidth
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">
                        ביטול
                    </Button>
                    <Button
                        onClick={newParticipant.id ? handleSaveEdit : handleAddParticipant}
                        color="primary"
                    >
                        {newParticipant.id ? "שמור" : "הוסף"}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>אישור מחיקת משתתף</DialogTitle>
                <DialogContent>
                    <Typography>האם אתה בטוח שברצונך למחוק משתתף זה?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} color="secondary">
                        ביטול
                    </Button>
                    <Button onClick={handleDeleteParticipant} color="error" variant="contained">
                        מחק
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
