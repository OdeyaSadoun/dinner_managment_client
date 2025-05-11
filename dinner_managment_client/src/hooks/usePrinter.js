import axios from 'axios';

const usePrintLabel = (tableMapping, fetchParticipants) => {
  const handlePrintLabel = async (participant) => {
    try {
      const tableNumber = parseInt(participant.table_number);
      const tableId = tableMapping[tableNumber];

      if (!tableId) {
        alert(`❌ לא ניתן להדפיס פתקית או להושיב את המשתתף – שולחן מספר ${tableNumber} לא קיים במערכת.`);
        return;
      }

      // אם עוד לא הגיע – קודם מסמנים כהגיע
      if (!participant.is_reach_the_dinner) {
        await axios.patch(`http://localhost:8000/person/seat/${participant.id || participant._id}`, {
          table_id: tableId,
        });
      }

      // הדפסת הפתקית
      await axios.post(`http://localhost:8000/print/print_sticker`, {
        full_name: participant.name,
        gender: participant.gender,
        table_number: participant.table_number,
      });

      // רענון כל המשתתפים
      await fetchParticipants();

      alert('✅ הפתקית הודפסה בהצלחה!');
    } catch (error) {
      console.error('❌ שגיאה בהדפסה או סימון כהגיע:', error);
      alert('❌ שגיאה בהדפסה או בעדכון סטטוס הגעה.');
    }
  };

  return handlePrintLabel;
};

export default usePrintLabel;
