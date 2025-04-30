import React, { useState } from 'react';
import usePrintLabel from '../hooks/usePrinter';
import useParticipantActions from '../hooks/useParticipantActions';
import useParticipantsData from '../hooks/useParticipantsData';
import ParticipantsTable from '../components/tables/ParticipantsTable';
import { Container } from '@mui/material';
import AddAndEditParticipantDialog from '../components/dialogs/AddAndEditParticipantDialog';
import DeleteDialog from '../components/dialogs/DeleteDialog';

const ParticipantsView = () => {
  const {
    participants,
    setParticipants,
    tables,
    tableMapping,
    loading,
    error,
  } = useParticipantsData();

  const actions = useParticipantActions(setParticipants, tableMapping);
  const handlePrintLabel = usePrintLabel();

  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (filtered) => {
    setHasSearched(true);
    setFilteredParticipants(filtered);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 8, minHeight: '80vh' }}>
      <ParticipantsTable
        participants={participants}
        filteredParticipants={hasSearched ? filteredParticipants : participants}
        loading={loading}
        error={error}
        admin={true}
        handleSearch={handleSearch}
        handleCheckboxChange={actions.handleCheckboxChange}
        handlePrintLabel={handlePrintLabel}
        handleEditParticipant={actions.handleEditParticipant}
        confirmDeleteParticipant={actions.confirmDeleteParticipant}
        handleOpenDialog={actions.handleOpenDialog}
      />

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

      <DeleteDialog
        open={actions.deleteDialogOpen}
        onClose={() => actions.setDeleteDialogOpen(false)}
        onConfirm={actions.handleDeleteParticipant}
        title="אישור מחיקת משתתף"
        message="האם אתה בטוח שברצונך למחוק משתתף זה?"
        confirmText="מחק"
        cancelText="ביטול"
      />
    </Container>
  );
};

export default ParticipantsView;
