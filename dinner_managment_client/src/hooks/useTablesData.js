import { useState, useEffect } from "react";
import axios from "axios";
import { HOST } from "../config";

const useTablesData = () => {
  const [tables, setTables] = useState([]);

  const fetchTables = async () => {
    try {
      const response = await axios.get(`http://${HOST}:8000/table`);
      console.log(response.data);
      
      if (response.data.status === "success" && Array.isArray(response.data.data.tables)) {
        console.log(response.data.data.tables);
        setTables(response.data.data.tables);
      } else {
        setTables([]);
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
      setTables([]);
    }
  };

  useEffect(() => {
    fetchTables(); // קריאה ראשונית
  }, []);

  return { tables, setTables, fetchTables }; // ✅ החזר גם את fetchTables
};

export default useTablesData;
