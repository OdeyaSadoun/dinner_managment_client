import axios from "axios";


const useDragAndDrop = (tables, setTables) => {
    const handleDragStart = (event, tableId) => {
      const { clientX, clientY } = event;
      event.dataTransfer.setData(
        "text/plain",
        JSON.stringify({ tableId, offsetX: clientX, offsetY: clientY })
      );
    };
  
    const handleDrop = async (event) => {
      event.preventDefault();
      const data = JSON.parse(event.dataTransfer.getData("text/plain"));
      const { tableId, offsetX, offsetY } = data;
      const { clientX, clientY } = event;
  
      const table = tables.find((t) => t.id === tableId);
      if (!table || !table.position) {
        console.error("Invalid table or position data");
        return;
      }
  
      const newPosition = {
        x: clientX - (offsetX - table.position.x),
        y: clientY - (offsetY - table.position.y),
      };
  
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? { ...t, position: newPosition } : t))
      );
  
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token not found. Please login again.");
  
        await axios.patch(`http://localhost:8000/table/position/${tableId}`, {
          position: newPosition,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
  