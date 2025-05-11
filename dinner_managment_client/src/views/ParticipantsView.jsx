import React, { useState } from 'react';
import usePrintLabel from '../hooks/usePrinter';
import useParticipantActions from '../hooks/useParticipantActions';
import useParticipantsData from '../hooks/useParticipantsData';
import ParticipantsTable from '../components/tables/ParticipantsTable';
import { Container, Snackbar, Alert } from '@mui/material';
import AddAndEditParticipantDialog from '../components/dialogs/AddAndEditParticipantDialog';
import DeleteDialog from '../components/dialogs/DeleteDialog';
import isAdmin from '../utils/auth';

const ParticipantsView = () => {
  const {
    participants,
    setParticipants,
    tables,
    tableMapping,
    loading,
    error,
    fetchParticipants
  } = useParticipantsData();
  const admin = isAdmin();

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  const handleSearch = (results, term) => {
    setFilteredParticipants(results);
    setSearchTerm(term);
    setHasSearched(term !== "");
  };

  const {
    handleCSVUpload,
    csvLoading, // ✅ כאן תוסיפי
    ...actions // שאר הפונקציות והסטייטים
  } = useParticipantActions(
    setParticipants,
    tableMapping,
    setSnackbarOpen,
    setSnackbarMessage,
    setSnackbarSeverity,
    hasSearched,
    searchTerm,
    setFilteredParticipants,
    fetchParticipants
  );
  const handlePrintLabel = usePrintLabel();

  return (
    <Container maxWidth="lg" sx={{ mt: 8, minHeight: '80vh' }}>
      <ParticipantsTable
        participants={participants}
        filteredParticipants={hasSearched ? filteredParticipants : participants}
        loading={loading}
        csvLoading={csvLoading}
        error={error}
        admin={admin}
        allowPrint={true}
        allowCheckbox={true}
        allowEdit={admin}
        allowDelete={admin}
        allowAdd={admin}
        handleSearch={handleSearch}
        handleCheckboxChange={actions.handleCheckboxChange}
        handlePrintLabel={handlePrintLabel}
        handleEditParticipant={admin ? actions.handleEditParticipant : undefined}
        confirmDeleteParticipant={admin ? actions.confirmDeleteParticipant : undefined}
        handleOpenDialog={admin ? actions.handleOpenDialog : undefined}
        handleDownloadAllParticipants={actions.handleDownloadAllParticipants}
        handleCSVUpload={handleCSVUpload}
      />

      {admin && (
        <AddAndEditParticipantDialog
          open={actions.open}
          onClose={actions.handleCloseDialog}
          newParticipant={actions.newParticipant}
          setNewParticipant={actions.setNewParticipant}
          onSave={
            actions.newParticipant.id
              ? actions.handleSaveEdit
              : actions.handleAddParticipant
          }
        />
      )}

      {admin && (
        <DeleteDialog
          open={actions.deleteDialogOpen}
          onClose={() => actions.setDeleteDialogOpen(false)}
          onConfirm={actions.handleDeleteParticipant}
          title="אישור מחיקת משתתף"
          message="האם אתה בטוח שברצונך למחוק משתתף זה?"
          confirmText="מחק"
          cancelText="ביטול"
        />
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ParticipantsView;
