import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const useParticipantsData = () => {
  const [participants, setParticipants] = useState([]);
  const [tables, setTables] = useState([]);
  const [tableMapping, setTableMapping] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ הפונקציה מועברת ל-useCallback כדי שלא תשתנה כל הזמן
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // קריאה לטבלאות
      const tableRes = await axios.get("http://localhost:8000/table");
      if (
        tableRes.data.status === "success" &&
        Array.isArray(tableRes.data.data.tables)
      ) {
        const fetchedTables = tableRes.data.data.tables;
        setTables(fetchedTables);

        const mapping = fetchedTables.reduce((acc, table) => {
          acc[table.table_number] = table.id;
          return acc;
        }, {});
        setTableMapping(mapping);
      }

      // קריאה לאנשים
      const peopleRes = await axios.get("http://localhost:8000/person");
      if (
        peopleRes.data.status === "success" &&
        Array.isArray(peopleRes.data.data.people)
      ) {
        setParticipants(peopleRes.data.data.people);
      } else {
        setError("Failed to fetch participants.");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // הפעלת הקריאה הראשונה
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    participants,
    setParticipants,
    tables,
    tableMapping,
    loading,
    error,
    fetchParticipants: fetchData, // ✅ מחזירים את הפונקציה
  };
};

export default useParticipantsData;
