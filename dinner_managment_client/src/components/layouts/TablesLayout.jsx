import React, { useState } from "react";
import { Box, Typography, Button, Slider, Stack } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Chair from "../../style/Chair";
import Table from "../../style/Table";

const TablesLayout = ({
    tables,
    handleOpenDialog,
    handleDragStart,
    handleDragOver,
    handleDrop,
    confirmDeleteTable,
    handleChairClick,
    admin,
}) => {
    const MIN_SCALE = 0.5; // זה הקנה מידה שמראה את כל האולם
    const [scale, setScale] = useState(MIN_SCALE); // תצוגה מלאה במסך כברירת מחדל

    const handleScaleChange = (event, newValue) => {
        setScale(newValue);
    };

    const handleResetZoom = () => {
        setScale(MIN_SCALE); // איפוס לזום המינימלי
    };

    return (
        <Box sx={{ mt: 2, mb: 4, position: "relative", height: "calc(100vh - 180px)" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                {admin && (
                    <Button variant="contained" color="primary" onClick={handleOpenDialog}>
                        הוסף שולחן
                    </Button>
                )}

                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box width={200}>
                        <Typography variant="caption">קנה מידה:</Typography>
                        <Slider
                            value={scale}
                            min={0.5}
                            max={1.5}
                            step={0.1}
                            onChange={handleScaleChange}
                            aria-labelledby="scale-slider"
                        />
                    </Box>
                    <Button variant="outlined" size="small" onClick={handleResetZoom}>
                        איפוס זום
                    </Button>
                </Stack>
            </Box>

            <Box
                sx={{
                    width: "100%",
                    height: "100%",
                    overflow: scale >= 1 ? "auto" : "hidden",
                    backgroundColor: "#f0f0f0",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <Box
                    sx={{
                        transform: `scale(${scale})`,
                        transformOrigin: "center center",
                        transition: "transform 0.3s ease",
                        width: "1000px", // אפשר להרחיב לפי כמות שולחנות
                        height: "800px",
                        position: "relative",
                    }}
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
                                <Typography variant="subtitle2" align="center">
                                    שולחן {table.table_number}
                                </Typography>

                                {admin && (
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
                                )}

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
        </Box>
    );
};

export default TablesLayout;
