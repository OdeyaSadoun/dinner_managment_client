import React, { useEffect, useState } from "react";
import { Typography, Container, Box, Button } from "@mui/material";
import { styled } from "@mui/system";
import axios from "axios";

// עיצוב לשולחן
const Table = styled(Box)(({ theme }) => ({
  width: 100,
  height: 100,
  backgroundColor: "#f5f5f5",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "2px solid #000",
  cursor: "grab",
  position: "absolute",
}));

// עיצוב לכיסא
const Chair = styled(Box)(({ theme }) => ({
  width: 30,
  height: 30,
  backgroundColor: "#d1e7dd",
  borderRadius: "50%",
  border: "1px solid #000",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "absolute",
}));

export default function TablesView() {
  const [tables, setTables] = useState([]);

  // טעינת שולחנות מהשרת
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axios.get("http://localhost:8000/table");
        console.log("Server response:", response.data); // לוג לבדיקה
        if (
          response.data.status === "success" &&
          Array.isArray(response.data.data.tables)
        ) {
          setTables(response.data.data.tables);
        } else {
          setTables([]);
        }
      } catch (error) {
        console.error("Error fetching tables:", error);
        setTables([]);
      }
    };

    fetchTables();
  }, []);

  // הוספת שולחן חדש
  const handleAddTable = async () => {
    const newTable = {
      position: { x: 50, y: 50 },
      chairs: 8,
      people_list: [],
      table_number: tables.length + 1, // מספר שולחן
    };

    try {
      const response = await axios.post("http://localhost:8000/table", newTable);
      console.log("New table response:", response.data); // לוג לבדיקה
      if (response.data.status === "success") {
        setTables((prev) => [
          ...prev,
          { ...newTable, id: response.data.data.inserted_id },
        ]);
      }
    } catch (error) {
      console.error("Error adding new table:", error);
    }
  };

  // גרירת שולחן
  const handleDragStart = (event, tableId) => {
    const { clientX, clientY } = event;
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ tableId, offsetX: clientX, offsetY: clientY })
    );
  };

  // שחרור שולחן למיקום חדש
  const handleDrop = async (event) => {
    event.preventDefault();
    const data = JSON.parse(event.dataTransfer.getData("text/plain"));
    const { tableId, offsetX, offsetY } = data;
    const { clientX, clientY } = event;

    const table = tables.find((t) => t.id === tableId);
    if (!table || !table.position) {
      console.error("Invalid table or position data");
      return;
    }

    const newPosition = {
      x: clientX - (offsetX - table.position.x),
      y: clientY - (offsetY - table.position.y),
    };

    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, position: newPosition } : t
      )
    );

    try {
      await axios.patch(`http://localhost:8000/table/position/${tableId}`, {
        position: newPosition,
      });
    } catch (error) {
      console.error("Error updating table position:", error);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 8, height: "80vh", position: "relative" }}>
      <Typography variant="h4" align="center" gutterBottom>
        תצוגת שולחנות
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddTable}
        sx={{ mb: 2 }}
      >
        הוסף שולחן
      </Button>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          backgroundColor: "#f0f0f0",
          border: "1px solid #ccc",
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {tables.length > 0 ? (
          tables.map((table) => (
            <Table
              key={table.id} // וודא ש-id תקין
              draggable
              onDragStart={(e) => handleDragStart(e, table.id)}
              sx={{
                left: table.position?.x || 0,
                top: table.position?.y || 0,
              }}
            >
              שולחן {table.id}
              {Array.from({ length: table.chairs }).map((_, index) => {
                const angle = (360 / table.chairs) * index;
                const radius = 60;
                const chairX = Math.cos((angle * Math.PI) / 180) * radius;
                const chairY = Math.sin((angle * Math.PI) / 180) * radius;
                return (
                  <Chair
                    key={`${table.id}-chair-${index}`}
                    sx={{
                      left: `${50 + chairX}%`,
                      top: `${50 + chairY}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                );
              })}
            </Table>
          ))
        ) : (
          <Typography align="center" sx={{ mt: 4 }}>
            אין שולחנות להצגה.
          </Typography>
        )}
      </Box>
    </Container>
  );
}
