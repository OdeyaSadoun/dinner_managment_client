import axios from 'axios';

const usePrintLabel = () => {
  const handlePrintLabel = (participantId) => {
    // שליחת בקשת GET לשרת עם axios כדי להדפיס את התווית עבור משתתף
    axios.get(`http://localhost:8000/print/print_sticker`)
      .then((response) => {
        // במקרה של הצלחה
        console.log("Printing successful:", response.data);
        alert('הפתקית הודפסה בהצלחה!');
      })
      .catch((error) => {
        // במקרה של שגיאה
        console.error('Error printing label:', error);
        alert('שגיאה בהדפסה');
      });
  };

  return handlePrintLabel;
};

export default usePrintLabel;

