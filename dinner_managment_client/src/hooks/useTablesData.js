import { useState, useEffect } from "react";
import axios from "axios";

const useTablesData = () => {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axios.get("http://localhost:8000/table");
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

    fetchTables();
  }, []);
  
  return { tables, setTables };
};

export default useTablesData;
