import React from "react";
import { Box, Button, Checkbox } from "@mui/material";

const getParticipantsColumns = ({
  admin,
  handleCheckboxChange,
  handlePrintLabel,
  handleEditParticipant,
  confirmDeleteParticipant,
}) => [
  { field: "name", headerName: "שם", flex: 1, editable: admin },
  { field: "phone", headerName: "טלפון", flex: 1, editable: admin },
  { field: "table_number", headerName: "מספר שולחן", flex: 1, editable: admin },
  {
    field: "is_reach_the_dinner",
    headerName: "הגיע לדינר?",
    flex: 1,
    renderCell: (params) => (
      <Checkbox
        checked={params.row.is_reach_the_dinner || false}
        onChange={() => handleCheckboxChange(params.row)}
        disabled={!admin}
      />
    ),
  },
  {
    field: "print",
    headerName: "הדפס פתקית",
    flex: 1,
    renderCell: (params) => (
      <Button variant="outlined" color="primary" onClick={() => handlePrintLabel(params.row)}>
        הדפס
      </Button>
    ),
  },
  {
    field: "actions",
    headerName: "פעולות",
    flex: 1,
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
        </Box>
      ) : null,
  },
];

export default getParticipantsColumns;
