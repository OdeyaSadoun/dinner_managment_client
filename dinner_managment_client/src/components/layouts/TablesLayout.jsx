import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, Button, Slider, Stack } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Chair from "../../style/Chair";
import Table from "../../style/Table";
import { Tooltip } from "@mui/material";


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
    const MIN_SCALE = 0.5;
    const [scale, setScale] = useState(MIN_SCALE);
    const scrollContainerRef = useRef(null);

    const handleScaleChange = (event, newValue) => {
        setScale(newValue);
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
                    <Button variant="contained" color="primary" onClick={handleOpenDialog}>
                        הוסף שולחן
                    </Button>
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

                    <Button variant="outlined" size="small" onClick={handleResetZoom}>
                        איפוס זום
                    </Button>
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
                        width: `${1000 / scale}px`, // 🟢 חישוב דינמי של רוחב פיזי
                        height: `${800 / scale}px`, // 🟢 חישוב דינמי של גובה פיזי
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
                                onDragStart={(e) => handleDragStart(e, table.id, scale)}
                                style={{ cursor: "grab" }}
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

                                {(() => {
                                    const shape = table.shape;
                                    const chairs = [];

                                    if (shape === "circle") {
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
                                    }

                                    else if (shape === "rectangle") {
                                        const width = 140;
                                        const height = 80;
                                        const padding = 10;

                                        const shortSideChairs = 2; // בכל צד קצר
                                        const remaining = table.chairs - shortSideChairs * 2;
                                        const topChairs = Math.ceil(remaining / 2);
                                        const bottomChairs = Math.floor(remaining / 2);

                                        let index = 0;

                                        // LEFT
                                        for (let i = 0; i < shortSideChairs; i++, index++) {
                                            const person = table.people_list[index];
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

                                        // RIGHT
                                        for (let i = 0; i < shortSideChairs; i++, index++) {
                                            const person = table.people_list[index];
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

                                        // TOP
                                        for (let i = 0; i < topChairs; i++, index++) {
                                            const person = table.people_list[index];
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

                                        // BOTTOM
                                        for (let i = 0; i < bottomChairs; i++, index++) {
                                            const person = table.people_list[index];
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

                                        return chairs;
                                    }


                                    else if (shape === "square") {
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
                                                    chairStyle = {
                                                        top: -padding,
                                                        left: spacing * (indexOnSide + 1),
                                                    };
                                                    break;
                                                case 1:
                                                    chairStyle = {
                                                        top: spacing * (indexOnSide + 1),
                                                        left: width + padding,
                                                    };
                                                    break;
                                                case 2:
                                                    chairStyle = {
                                                        top: height + padding,
                                                        left: spacing * (indexOnSide + 1),
                                                    };
                                                    break;
                                                case 3:
                                                    chairStyle = {
                                                        top: spacing * (indexOnSide + 1),
                                                        left: -padding,
                                                    };
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
