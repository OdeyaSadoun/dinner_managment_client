import React from "react";
import { Box, Button, Checkbox, Typography } from "@mui/material";

const getParticipantsColumns = ({
    admin,
    handleCheckboxChange,
    handlePrintLabel,
    handleEditParticipant,
    confirmDeleteParticipant,
}) => [
        { field: "name", headerName: "שם", flex: 1.2, editable: admin }, // הרחבתי את עמודת שם
        { field: "phone", headerName: "טלפון", flex: 1.2, editable: admin }, // הרחבתי את עמודת טלפון
        { field: "table_number", headerName: "מספר שולחן", flex: 1.2, editable: admin }, // עמודת מספר שולחן באותו רוחב
        {
            field: "is_reach_the_dinner",
            headerName: "הגיע לדינר?",
            flex: 0.8, // הקטנתי את עמודת הגיע לדינר
            renderCell: (params) => (
                <Checkbox
                    checked={params.row.is_reach_the_dinner || false}
                    onChange={() => handleCheckboxChange(params.row)}
                    disabled={!admin}
                />
            ),
        },
        {
            field: "is_manual_added",
            headerName: "הוסף ידנית",
            flex: 0.8, // הקטנתי את עמודת הוסף ידנית
            renderCell: (params) => (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                    <Typography variant="body2" color={params.row.add_manual ? "primary.main" : "text.secondary"}>
                        {params.row.add_manual ? "✔" : ""}
                    </Typography>
                </Box>
            ),
        },
        {
            field: "gender",
            headerName: "מגדר",
            flex: 1,
            editable: admin,
        },
        {
            field: "contact_person",
            headerName: "איש קשר",
            flex: 1,
            editable: admin,
        },
        {
            field: "actions",
            headerName: "פעולות",
            flex: 2, // הגדלתי את עמודת פעולות
            renderCell: (params) =>
                admin ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 1,
                            height: "100%",
                        }}
                    >
                        <Button variant="outlined" color="secondary" onClick={() => handleEditParticipant(params.row)}>
                            ערוך
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => confirmDeleteParticipant(params.row.id || params.row._id)}
                        >
                            מחק
                        </Button>
                        <Button variant="outlined" color="primary" onClick={() => handlePrintLabel(params.row)}>
                            הדפס פתקית
                        </Button>
                    </Box>
                ) : null,
        },
    ];

export default getParticipantsColumns;
