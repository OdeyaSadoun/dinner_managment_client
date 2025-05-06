import axios from 'axios';

const usePrintLabel = () => {
  const handlePrintLabel = (participant) => {
    axios.post(`http://localhost:8000/print/print_sticker`, {
      full_name: participant.name,
      gender: participant.gender,
      table_number: participant.table_number,
    })
      .then((response) => {
        console.log("Printing successful:", response.data);
        alert('הפתקית הודפסה בהצלחה!');
      })
      .catch((error) => {
        console.error('Error printing label:', error);
        alert('שגיאה בהדפסה');
      });
  };

  return handlePrintLabel;
};

export default usePrintLabel;
