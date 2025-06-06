import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, Button, Slider, Stack, Tooltip, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RotateRightIcon from '@mui/icons-material/RotateRight';
import Chair from "../../style/Chair";
import Table from "../../style/Table";
import axios from "axios";
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap'; // איקון לאיפוס זום
import { HOST } from "../../config";


const TablesLayout = ({
    tables,
    handleOpenDialog,
    handleDragStart,
    handleDragOver,
    handleDrop,
    confirmDeleteTable,
    handleChairClick,
    admin,
    setTables,
    onTableClick,
    handleUploadTablesCsv,
}) => {
    console.log(tables);

    const MIN_SCALE = 0.4;
    const isClickRef = useRef(true);
    const [scale, setScale] = useState(MIN_SCALE);
    const scrollContainerRef = useRef(null);

    const handleScaleChange = (event, newValue) => {
        setScale(newValue);
    };

    const handleRotateTable = async (table) => {
        const newRotation = ((table.rotation || 0) + 15) % 360;

        const updatedTable = {
            table_number: table.table_number,
            chairs: table.chairs,
            shape: table.shape,
            gender: table.gender,
            position: table.position,
            people_list: table.people_list,
            is_active: table.is_active,
            rotation: newRotation,
        };

        setTables((prev) =>
            prev.map((t) =>
                t.id === table.id ? { ...t, rotation: newRotation } : t
            )
        );

        try {
            const token = localStorage.getItem("token"); // או מאיפה שאת שומרת אותו

            // שליחה לשרת
            const response = await axios.put(`http://${HOST}:8000/table/${table.id}`, updatedTable, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            console.log(response.data);

        } catch (error) {
            console.error("❌ שגיאה בעדכון rotation לשרת:", error);
        }
    };

    const scrollToTopLeftSmooth = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: 0,
                left: 0,
                behavior: "smooth",
            });
        }
    };

    const handleResetZoom = () => {
        setScale(MIN_SCALE);
        setTimeout(scrollToTopLeftSmooth, 0);
    };

    useEffect(() => {
        if (scale === MIN_SCALE) {
            setTimeout(scrollToTopLeftSmooth, 0);
        }
    }, [scale]);

    return (
        <Box sx={{ mt: 2, mb: 4, position: "relative", height: "calc(100vh - 180px)" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                {admin && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                        <Tooltip title="הוסף שולחן חדש">
                            <IconButton onClick={handleOpenDialog} sx={{ color: 'green.main' }}>
                                <AddIcon />
                            </IconButton>
                        </Tooltip>

                        <label htmlFor="upload-tables-csv">
                            <input
                                id="upload-tables-csv"
                                type="file"
                                accept=".csv"
                                style={{ display: "none" }}
                                onChange={handleUploadTablesCsv}
                            />
                            <Tooltip title="ייבוא CSV">
                                <IconButton component="span">
                                    <UploadFileIcon />
                                </IconButton>
                            </Tooltip>

                        </label>
                    </div>
                )}

                <Stack direction="row" alignItems="center" spacing={2}>
                    <Tooltip title="הגדל">
                        <span>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setScale((prev) => Math.min(prev + 0.1, 1.5))}
                                disabled={scale >= 1.5}
                            >
                                +
                            </Button>
                        </span>
                    </Tooltip>

                    <Box width={200}>
                        <Typography variant="caption">קנה מידה:</Typography>
                        <Slider
                            value={scale}
                            min={MIN_SCALE}
                            max={1.5}
                            step={0.1}
                            onChange={handleScaleChange}
                            aria-labelledby="scale-slider"
                        />
                    </Box>

                    <Tooltip title="הקטן">
                        <span>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setScale((prev) => Math.max(prev - 0.1, MIN_SCALE))}
                                disabled={scale <= MIN_SCALE}
                            >
                                −
                            </Button>
                        </span>
                    </Tooltip>
                    <Tooltip title="איפוס קנה מידה">
                        <IconButton onClick={handleResetZoom} color="primary">
                            <ZoomOutMapIcon />
                        </IconButton>
                    </Tooltip>

                </Stack>
            </Box>

            <Box
                ref={scrollContainerRef}
                sx={{
                    width: "100%",
                    height: "100%",
                    overflowX: scale === MIN_SCALE ? "hidden" : "auto",
                    overflowY: scale === MIN_SCALE ? "hidden" : "auto",
                    backgroundColor: "#f0f0f0",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    position: "relative",
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <Box
                    sx={{
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                        transition: "transform 0.3s ease",
                        width: `${1000 + 2 * 100}px`, // מוסיפים את הפדינג לרוחב האזור
                        height: `${800 + 2 * 100}px`,
                        padding: "100px",
                        boxSizing: "border-box", // חיוני שהפדינג ייכנס לתוך ה-width
                        position: "relative",
                        backgroundColor: "#eee", // זמני לבדיקה
                    }}
                >

                    {tables.length > 0 ? (
                        tables.map((table) => (
                            <Box
                                key={table.id}
                                sx={{
                                    position: "absolute",
                                    left: table.position?.x || 0,
                                    top: table.position?.y || 0,
                                    transform: `rotate(${table.rotation || 0}deg)`,
                                    transformOrigin: "center center",
                                }}
                            >

                                <Table
                                    shape={table.shape}
                                    gender={table.gender}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, table.id, scale)}
                                    onMouseDown={() => { isClickRef.current = true; }}
                                    onMouseMove={() => { isClickRef.current = false; }}
                                    onDoubleClick={() => {
                                        if (onTableClick) {
                                            onTableClick(table);
                                        }
                                    }}
                                >
                                    <Typography align="center" sx={{ fontSize: 30 }}>
                                        {table.table_number}
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

                                    {admin && (<RotateRightIcon
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRotateTable(table);
                                        }}
                                        sx={{
                                            position: "absolute",
                                            bottom: "-20px",
                                            right: "-20px",
                                            backgroundColor: "#fff",
                                            borderRadius: "50%",
                                            padding: "4px",
                                            fontSize: 24,
                                            cursor: "pointer",
                                            color: "#555",
                                            zIndex: 10,
                                            "&:hover": {
                                                color: "#000",
                                            },
                                        }}
                                    />
                                    )},

                                    {(() => {
                                        const shape = table.shape;
                                        const chairs = [];
                                        if (shape === "bima") {
                                            const width = 140 * 6;
                                            const height = 80 / 2;
                                            const padding = 10;
                                            const people = Array.isArray(table.people_list) ? table.people_list : [];

                                            for (let i = 0; i < table.chairs; i++) {
                                                const person = people[i];
                                                chairs.push(
                                                    <Chair
                                                        key={`${table.id}-chair-${i}`}
                                                        isOccupied={!!person}
                                                        sx={{
                                                            top: height + padding,
                                                            left: ((i + 1) * width) / (table.chairs + 1),
                                                            position: "absolute",
                                                            transform: "translate(-50%, -50%)",
                                                        }}
                                                        onClick={() => person && handleChairClick(person)}
                                                    />
                                                );
                                            }
                                        }

                                        else if (shape === "circle") {
                                            const radius = 60;
                                            for (let i = 0; i < table.chairs; i++) {
                                                const angle = (360 / table.chairs) * i;
                                                const chairX = Math.cos((angle * Math.PI) / 180) * radius;
                                                const chairY = Math.sin((angle * Math.PI) / 180) * radius;
                                                const person = table.people_list[i];

                                                chairs.push(
                                                    <Chair
                                                        key={`${table.id}-chair-${i}`}
                                                        isOccupied={!!person}
                                                        sx={{
                                                            left: `${50 + chairX}px`,
                                                            top: `${50 + chairY}px`,
                                                            transform: "translate(-50%, -50%)",
                                                        }}
                                                        onClick={() => person && handleChairClick(person)}
                                                    />
                                                );
                                            }
                                        } if (shape === "rectangle") {
                                            const baseWidth = 140;
                                            const width = baseWidth * 2;
                                            const height = 80;
                                            const padding = 10;
                                            const people = Array.isArray(table.people_list) ? table.people_list : [];

                                            const shortSideChairs = 2;
                                            const remaining = table.chairs - shortSideChairs * 2;
                                            const topChairs = Math.ceil(remaining / 2);
                                            const bottomChairs = Math.floor(remaining / 2);
                                            let index = 0;

                                            // Left
                                            for (let i = 0; i < shortSideChairs; i++, index++) {
                                                const person = people[index];
                                                chairs.push(
                                                    <Chair
                                                        key={`${table.id}-chair-left-${i}`}
                                                        isOccupied={!!person}
                                                        sx={{
                                                            top: ((i + 1) * height) / (shortSideChairs + 1),
                                                            left: -padding,
                                                            position: "absolute",
                                                            transform: "translate(-50%, -50%)",
                                                        }}
                                                        onClick={() => person && handleChairClick(person)}
                                                    />
                                                );
                                            }

                                            // Right
                                            for (let i = 0; i < shortSideChairs; i++, index++) {
                                                const person = people[index];
                                                chairs.push(
                                                    <Chair
                                                        key={`${table.id}-chair-right-${i}`}
                                                        isOccupied={!!person}
                                                        sx={{
                                                            top: ((i + 1) * height) / (shortSideChairs + 1),
                                                            left: width + padding,
                                                            position: "absolute",
                                                            transform: "translate(-50%, -50%)",
                                                        }}
                                                        onClick={() => person && handleChairClick(person)}
                                                    />
                                                );
                                            }

                                            // Top
                                            for (let i = 0; i < topChairs; i++, index++) {
                                                const person = people[index];
                                                chairs.push(
                                                    <Chair
                                                        key={`${table.id}-chair-top-${i}`}
                                                        isOccupied={!!person}
                                                        sx={{
                                                            top: -padding,
                                                            left: ((i + 1) * width) / (topChairs + 1),
                                                            position: "absolute",
                                                            transform: "translate(-50%, -50%)",
                                                        }}
                                                        onClick={() => person && handleChairClick(person)}
                                                    />
                                                );
                                            }

                                            // Bottom
                                            for (let i = 0; i < bottomChairs; i++, index++) {
                                                const person = people[index];
                                                chairs.push(
                                                    <Chair
                                                        key={`${table.id}-chair-bottom-${i}`}
                                                        isOccupied={!!person}
                                                        sx={{
                                                            top: height + padding,
                                                            left: ((i + 1) * width) / (bottomChairs + 1),
                                                            position: "absolute",
                                                            transform: "translate(-50%, -50%)",
                                                        }}
                                                        onClick={() => person && handleChairClick(person)}
                                                    />
                                                );
                                            }
                                        }
                                        else if (shape === "square" || shape === "vip" || shape === "reserva") {
                                            const width = 100;
                                            const height = 100;
                                            const sides = 4;
                                            const perSide = Math.ceil(table.chairs / sides);
                                            const padding = 10;

                                            for (let i = 0; i < table.chairs; i++) {
                                                const person = table.people_list[i];
                                                const side = Math.floor(i / perSide);
                                                const indexOnSide = i % perSide;
                                                let chairStyle = {};
                                                const spacing = (side % 2 === 0 ? width : height) / (perSide + 1);

                                                switch (side) {
                                                    case 0:
                                                        chairStyle = { top: -padding, left: spacing * (indexOnSide + 1) };
                                                        break;
                                                    case 1:
                                                        chairStyle = { top: spacing * (indexOnSide + 1), left: width + padding };
                                                        break;
                                                    case 2:
                                                        chairStyle = { top: height + padding, left: spacing * (indexOnSide + 1) };
                                                        break;
                                                    case 3:
                                                        chairStyle = { top: spacing * (indexOnSide + 1), left: -padding };
                                                        break;
                                                    default:
                                                        break;
                                                }

                                                chairs.push(
                                                    <Chair
                                                        key={`${table.id}-chair-${i}`}
                                                        isOccupied={!!person}
                                                        sx={{
                                                            ...chairStyle,
                                                            position: "absolute",
                                                            transform: "translate(-50%, -50%)",
                                                        }}
                                                        onClick={() => person && handleChairClick(person)}
                                                    />
                                                );
                                            }
                                        }
                                        return chairs;
                                    })()}
                                </Table>
                            </Box>
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