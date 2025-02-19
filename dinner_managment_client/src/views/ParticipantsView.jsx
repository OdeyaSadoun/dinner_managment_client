import React from "react";
import { Container } from "@mui/material";
import useParticipantsData from "../hooks/useParticipantsData";
import useParticipantActions from "../hooks/useParticipantActions";
import ParticipantsTable from "../components/tables/ParticipantsTable";
import AddAndEditParticipantDialog from "../components/dialogs/AddAndEditParticipantDialog";
import DeleteDialog from "../components/dialogs/DeleteDialog";

export default function ParticipantsView() {
    const { participants, setParticipants, tables, tableMapping, loading, error } = useParticipantsData();
    const actions = useParticipantActions(setParticipants, tableMapping);

    return (
        <Container maxWidth="lg" sx={{ mt: 8, minHeight: "80vh" }}>
            <ParticipantsTable
                participants={participants}
                filteredParticipants={participants}
                loading={loading}
                error={error}
                handleSearch={() => {}}
                handleOpenDialog={actions.handleOpenDialog}
                admin={true}
                handleEditParticipant={actions.handleEditParticipant}
                confirmDeleteParticipant={actions.confirmDeleteParticipant}
            />

            <AddAndEditParticipantDialog
                open={actions.open}
                onClose={actions.handleCloseDialog}
                newParticipant={actions.newParticipant}
                setNewParticipant={actions.setNewParticipant}
                onSave={actions.newParticipant.id ? actions.handleSaveEdit : actions.handleAddParticipant}
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
}
