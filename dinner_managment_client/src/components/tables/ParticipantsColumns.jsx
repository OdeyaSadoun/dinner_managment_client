import { Box, Button, Checkbox, Typography } from "@mui/material";

const getParticipantsColumns = ({
  allowEdit,
  allowDelete,
  allowPrint,
  allowCheckbox,
  handleCheckboxChange,
  handlePrintLabel,
  handleEditParticipant,
  confirmDeleteParticipant,
}) => [
  { field: "name", headerName: "שם", flex: 1.2, editable: allowEdit },
  { field: "phone", headerName: "טלפון", flex: 1.2, editable: allowEdit },
  { field: "table_number", headerName: "מספר שולחן", flex: 1.2, editable: allowEdit },
  {
    field: "is_reach_the_dinner",
    headerName: "הגיע לדינר?",
    flex: 0.8,
    renderCell: (params) => (
      <Checkbox
        checked={params.row.is_reach_the_dinner || false}
        onChange={() => handleCheckboxChange(params.row)}
        disabled={!allowCheckbox}
      />
    ),
  },
  {
    field: "is_manual_added",
    headerName: "הוסף ידנית",
    flex: 0.8,
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
    renderCell: (params) => (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <Typography variant="body2">
          {params.row.gender === "male" ? "גברים" : params.row.gender === "female" ? "נשים" : ""}
        </Typography>
      </Box>
    ),
    editable: allowEdit,
  },
  {
    field: "contact_person",
    headerName: "איש קשר",
    flex: 1,
    editable: allowEdit,
  },
  {
    field: "actions",
    headerName: "פעולות",
    flex: 2,
    renderCell: (params) => {
      const buttons = [];

      if (allowEdit) {
        buttons.push(
          <Button key="edit" variant="outlined" color="secondary" onClick={() => handleEditParticipant(params.row)}>
            ערוך
          </Button>
        );
      }

      if (allowDelete) {
        buttons.push(
          <Button
            key="delete"
            variant="outlined"
            color="error"
            onClick={() => confirmDeleteParticipant(params.row.id || params.row._id)}
          >
            מחק
          </Button>
        );
      }

      if (allowPrint) {
        buttons.push(
          <Button key="print" variant="outlined" color="primary" onClick={() => handlePrintLabel(params.row)}>
            הדפס פתקית
          </Button>
        );
      }

      return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1, height: "100%" }}>
          {buttons}
        </Box>
      );
    },
  },
];

export default getParticipantsColumns;
