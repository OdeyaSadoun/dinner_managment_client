import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Container,
    Checkbox,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";

export default function ParticipantsView() {
    const [participants, setParticipants] = useState([]);
    const [tables, setTables] = useState([]); 
    const [tableMapping, setTableMapping] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const updateTables = async () => {
        try {
            const response = await axios.get("http://localhost:8000/table");
            if (response.data.status === "success" && Array.isArray(response.data.data.tables)) {
                setTables(response.data.data.tables);
            } else {
                console.error("Failed to update tables. Response status not successful.");
            }
        } catch (error) {
            console.error("Error updating tables:", error);
        }
    };

    const handleCheckboxChange = async (participant) => {
        try {
            const updatedParticipant = {
                ...participant,
                is_reach_the_dinner: !participant.is_reach_the_dinner,
            };
    
            const tableId = tableMapping[participant.table_number];
    
            if (!tableId) {
                console.error("Table ID not found for table number:", participant.table_number);
                alert("Failed to find table ID. Please try again.");
                return;
            }
    
            // שליחת בקשה לשרת
            if (updatedParticipant.is_reach_the_dinner) {
                await axios.patch(`http://localhost:8000/person/seat/${participant.id}`, {
                    table_id: tableId,
                });
            } else {
                await axios.patch(`http://localhost:8000/person/unseat/${participant.id}`, {
                    table_id: tableId,
                });
            }
    
            // עדכון סטייט של המשתתפים
            setParticipants((prev) =>
                prev.map((p) => (p.id === participant.id ? updatedParticipant : p))
            );
    
            // עדכון סטייט של השולחנות
            setTables((prev) =>
                prev.map((table) =>
                    table.id === tableId
                        ? {
                              ...table,
                              people_list: updatedParticipant.is_reach_the_dinner
                                  ? [...table.people_list, participant]
                                  : table.people_list.filter((p) => p.id !== participant.id),
                          }
                        : table
                )
            );
        } catch (error) {
            console.error("Error updating participant or table:", error);
            alert("Failed to update participant. Please try again.");
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
                        getRowId={(row) => row.id}
                    />
                </Box>
            )}
        </Container>
    );
}
