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
  const [tables, setTables] = useState([]); // שמירת רשימת השולחנות
  const [tableMapping, setTableMapping] = useState({}); // מיפוי בין table_number ל-table_id
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axios.get("http://localhost:8000/table");
        if (response.data.status === "success" && Array.isArray(response.data.data.tables)) {
          setTables(response.data.data.tables);

          // יצירת מיפוי בין table_number ל-table_id
          const mapping = response.data.data.tables.reduce((acc, table) => {
            acc[table.table_number] = table.id;
            return acc;
          }, {});
          setTableMapping(mapping); // שמירת המיפוי בסטייט
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

      // עדכון המשתתף בשרת
      await axios.put(`http://localhost:8000/person/${participant.id}`, updatedParticipant);

      // אם המשתתף הגיע, עדכון השרת להוסיפו לשולחן
      if (updatedParticipant.is_reach_the_dinner) {
        const tableId = tableMapping[participant.table_number]; // קבלת table_id מהמיפוי
        console.log(participant.id , tableId);
        
        if (tableId) {
          await axios.patch(`http://localhost:8000/table/add_person/${tableId}`, {
            person_id: participant.id,
          });
        } else {
          console.error("Table ID not found for table number:", participant.table_number);
        }
      }

      // עדכון ה-UI
      setParticipants((prev) =>
        prev.map((p) => (p.id === participant.id ? updatedParticipant : p))
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
