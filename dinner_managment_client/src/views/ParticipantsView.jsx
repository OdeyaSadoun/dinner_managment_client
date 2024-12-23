import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Container,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";

export default function ParticipantsView() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    fetchParticipants();
  }, []);

  const columns = [
    { field: "id", headerName: "ID", width: 250 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "phone", headerName: "Phone", width: 150 },
    { field: "table_number", headerName: "Table Number", width: 130 },
    {
      field: "is_reach_the_dinner",
      headerName: "Reached Dinner",
      width: 130,
      valueGetter: (params) => {
        const value = params.row?.is_reach_the_dinner;
        return value !== undefined ? (value ? "Yes" : "No") : "N/A";
      },
    },
    { field: "is_active", headerName: "Active", width: 100 },
    {
      field: "date_created",
      headerName: "Created At",
      width: 200,
      valueGetter: (params) => {
        const value = params.row?.date_created;
        return value ? new Date(value).toLocaleString() : "N/A";
      },
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
