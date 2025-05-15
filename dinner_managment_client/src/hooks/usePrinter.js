import axios from 'axios';

const usePrintLabel = (
  tableMapping,
  fetchParticipants,
  setSnackbarOpen,
  setSnackbarMessage,
  setSnackbarSeverity
) => {
  const handlePrintLabel = async (participant) => {
    try {
      const tableNumber = String(participant.table_number);
      const tableId = tableMapping[tableNumber];

      if (!tableId) {
        setSnackbarMessage(`לא ניתן להדפיס פתקית או להושיב את המשתתף – שולחן מספר ${tableNumber} לא קיים במערכת.`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      if (!participant.is_reach_the_dinner) {
        await axios.patch(
          `http://localhost:8000/person/seat/${participant.id || participant._id}`,
          { table_id: tableId }
        );
      }

      await axios.post("http://localhost:8000/print/print_sticker", {
        full_name: participant.name,
        gender: participant.gender,
        table_number: participant.table_number,
      });

      await fetchParticipants();
      setSnackbarMessage("הפתקית הודפסה בהצלחה!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

    } catch (error) {
      console.error("❌ שגיאה בהדפסה או סימון כהגיע:", error);
      setSnackbarMessage("שגיאה בהדפסה או בעדכון סטטוס הגעה.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  return handlePrintLabel;
};

export default usePrintLabel;
