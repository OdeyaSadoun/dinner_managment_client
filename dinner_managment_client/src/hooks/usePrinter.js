import { useCallback } from 'react';

const usePrintLabel = () => {
  const handlePrintLabel = useCallback((participant) => {
    const printContent = `
        <div>
            <h3>${participant.name}</h3>
            <p>טלפון: ${participant.phone}</p>
            <p>מספר שולחן: ${participant.table_number}</p>
        </div>
    `;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  }, []);

  return handlePrintLabel;
};

export default usePrintLabel;
