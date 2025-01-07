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

export default function ParticipantsView() {
    const [participants, setParticipants] = useState([]);
    const [tables, setTables] = useState([]);
    const [tableMapping, setTableMapping] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [open, setOpen] = useState(false);
    const [newParticipant, setNewParticipant] = useState({
        name: "",
        phone: "",
        table_number: "",
        is_reach_the_dinner: false
    });

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

    const columns = [
        { field: "name", headerName: "שם", flex: 1 },
        { field: "phone", headerName: "טלפון", flex: 1 },
        { field: "table_number", headerName: "מספר שולחן", flex: 1 },
        {
            field: "is_reach_the_dinner",
            headerName: "הגיע לדינר?",
            flex: 1,
            renderCell: (params) => (
                <Checkbox
                    checked={params.row.is_reach_the_dinner || false}
                    onChange={() => handleCheckboxChange(params.row)}
                />
            ),
        },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 8, minHeight: "80vh" }}>
            <Typography variant="h4" align="center" gutterBottom>
                משתתפים בדינר
            </Typography>

            <Button
                variant="contained"
                color="primary"
                onClick={handleOpenDialog}
                sx={{ mb: 2 }}
            >
                הוסף משתתף
            </Button>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 4 }}>
                    {error}
                </Alert>
            ) : (
                <Box sx={{ height: 500, mt: 4 }}>
                    <DataGrid
                        rows={participants}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5, 10, 20]}
                        getRowId={(row) => row.id || row._id}
                    />
                </Box>
            )}

            <Dialog open={open} onClose={handleCloseDialog}>
                <DialogTitle>הוסף משתתף</DialogTitle>
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
                    <Button onClick={handleAddParticipant} color="primary">
                        הוסף
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
