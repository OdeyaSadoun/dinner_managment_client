import axios from "axios";

const useDragAndDrop = (tables, setTables) => {
  const handleDragStart = (event, tableId, scale = 1) => {
    const rect = event.target.getBoundingClientRect();

    // חישוב מרחק מהעכבר לפינה של האלמנט בקנה מידה
    const offsetX = (event.clientX - rect.left) / scale;
    const offsetY = (event.clientY - rect.top) / scale;

    // הסתרת הצל של הגרירה (ghost image)
    event.dataTransfer.setDragImage(new Image(), 0, 0);

    // שמירת המידע בקובץ ה-DataTransfer
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ tableId, offsetX, offsetY, scale })
    );
  };

  const handleDrop = async (event) => {
    event.preventDefault();

    const data = JSON.parse(event.dataTransfer.getData("text/plain"));
    const { tableId, offsetX, offsetY, scale } = data;

    const { clientX, clientY } = event;
    const container = event.currentTarget.getBoundingClientRect();

    // חישוב מיקום חדש לפי קנה מידה ומיקום בתוך המיכל
    const newPosition = {
      x: clientX - container.left - offsetX * scale,
      y: clientY - container.top - offsetY * scale,
    };

    // עדכון בסטייט
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, position: newPosition } : t
      )
    );

    // שמירה במסד הנתונים
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found. Please login again.");

      await axios.patch(
        `http://localhost:8000/table/position/${tableId}`,
        { position: newPosition },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Error updating table position:", error);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return { handleDragStart, handleDrop, handleDragOver };
};

export default useDragAndDrop;
