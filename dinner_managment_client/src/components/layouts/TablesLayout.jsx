import React from "react";
import { Box, Typography, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Chair from "../../style/Chair";
import Table from "../../style/Table";

const TablesLayout = ({ tables, handleOpenDialog, handleDragStart, handleDragOver, handleDrop, confirmDeleteTable, handleChairClick }) => {
    return (
        <Box sx={{ mt: 8, height: "80vh", position: "relative" }}>
            <Typography variant="h4" align="center" gutterBottom>
                תצוגת שולחנות
            </Typography>
            <Button variant="contained" color="primary" onClick={handleOpenDialog} sx={{ mb: 2 }}>
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
                            key={table.id}
                            shape={table.shape}
                            gender={table.gender}
                            draggable
                            onDragStart={(e) => handleDragStart(e, table.id)}
                            sx={{
                                left: table.position?.x || 0,
                                top: table.position?.y || 0,
                                position: "absolute",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Typography variant="h6" align="center">
                                שולחן {table.table_number}
                            </Typography>
                            <DeleteIcon
                                onClick={() => confirmDeleteTable(table.id)}
                                sx={{
                                    position: "absolute",
                                    top: "-20px",
                                    right: "-20px",
                                    backgroundColor: "white",
                                    borderRadius: "50%",
                                    padding: "4px",
                                    color: "red",
                                    fontSize: 28,
                                    cursor: "pointer",
                                    zIndex: 10,
                                    "&:hover": {
                                        color: "darkred",
                                    },
                                }}
                            />
                            {Array.from({ length: table.chairs }).map((_, index) => {
                                const person = table.people_list[index];
                                const angle = (360 / table.chairs) * index;
                                const radius = 60;
                                const chairX = Math.cos((angle * Math.PI) / 180) * radius;
                                const chairY = Math.sin((angle * Math.PI) / 180) * radius;

                                return (
                                    <Chair
                                        key={`${table.id}-chair-${index}`}
                                        isOccupied={!!person}
                                        sx={{
                                            left: `${50 + chairX}%`,
                                            top: `${50 + chairY}%`,
                                            transform: "translate(-50%, -50%)",
                                        }}
                                        onClick={() => person && handleChairClick(person)}
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
        </Box>
    );
};

export default TablesLayout;
