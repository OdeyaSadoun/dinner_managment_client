import React from "react";
import { Box, Typography, Button, CircularProgress, Alert } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchBar from "../layouts/SearchBar";
import getParticipantsColumns from "./ParticipantsColumns";
import UploadIcon from "@mui/icons-material/Upload";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";

const ParticipantsTable = ({
  participants,
  filteredParticipants,
  loading,
  error,
  handleSearch,
  handleOpenDialog,
  handleCheckboxChange,
  handlePrintLabel,
  handleEditParticipant,
  confirmDeleteParticipant,
  admin,
  allowPrint,
  allowCheckbox,
  allowEdit,
  allowDelete,
  allowAdd,
  handleDownloadManualParticipants,
  handleCSVUpload,
}) => {
  const columns = getParticipantsColumns({
    admin,
    allowPrint,
    allowCheckbox,
    allowEdit,
    allowDelete,
    handleCheckboxChange,
    handlePrintLabel,
    handleEditParticipant,
    confirmDeleteParticipant,
  });

  return (
    <>
      <Typography variant="h4" align="center" gutterBottom>
        משתתפים בדינר
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <SearchBar
          data={participants}
          onSearch={handleSearch}
          searchBy={[
            (participant) => participant.name,
            (participant) => participant.phone,
          ]}
        />

        {allowAdd && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="text"
              color="info"
              onClick={handleDownloadManualParticipants}
              sx={{ minWidth: 0, p: 1 }}
            >
              <DownloadIcon />
            </Button>

            <Button
              variant="text"
              color="success"
              onClick={handleOpenDialog}
              sx={{ minWidth: 0, p: 1 }}
            >
              <AddIcon />
            </Button>

            <Button
              variant="text"
              component="label"
              color="secondary"
              sx={{ minWidth: 0, p: 1 }}
            >
              <UploadIcon />
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={(e) => handleCSVUpload(e)}
              />
            </Button>
          </Box>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      ) : filteredParticipants.length === 0 && participants.length === 0 ? (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            לא נמצאו תוצאות.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ height: "calc(100vh - 250px)" }}>
          <DataGrid
            rows={filteredParticipants}
            columns={columns.map((column) => ({
              ...column,
              align: "center",
            }))}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            getRowId={(row) => row.id || row._id}
          />
        </Box>
      )}
    </>
  );
};

export default ParticipantsTable;
