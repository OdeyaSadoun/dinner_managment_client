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
    { field: "name", headerName: "שם", flex: 1 }, 
    { field: "phone", headerName: "טלפון", flex: 1 },
    { field: "table_number", headerName: "מספר שולחן", flex: 1 }, 
    {
      field: "is_reach_the_dinner",
      headerName: "הגיע לדינר?",
      flex: 1, 
      valueGetter: (params) => {
        return params !== null && params !== undefined ? (params ? "כן" : "לא") : "N/A";
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
