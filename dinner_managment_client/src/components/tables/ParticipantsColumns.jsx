import { Box, Button, Checkbox, Typography, Tooltip } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';

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
            <Tooltip title="ערוך" key="edit">
              <Button
                variant="text"
                onClick={() => handleEditParticipant(params.row)}
                sx={{ minWidth: 0, p: 1, color: '#FFA500' }} // כתום
              >
                <EditIcon />
              </Button>
            </Tooltip>
          );
        }

        if (allowDelete) {
          buttons.push(
            <Tooltip title="מחק" key="delete">
              <Button
                variant="text"
                color="error"
                onClick={() => confirmDeleteParticipant(params.row.id || params.row._id)}
                sx={{ minWidth: 0, p: 1 }}
              >
                <DeleteIcon />
              </Button>
            </Tooltip>
          );
        }

        if (allowPrint) {
          buttons.push(
            <Tooltip title="הדפס פתקית" key="print">
              <Button
                variant="text"
                onClick={() => handlePrintLabel(params.row)}
                sx={{ minWidth: 0, p: 1, color: 'hotpink' }} // אפור
              >
                <PrintIcon />
              </Button>
            </Tooltip>
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
