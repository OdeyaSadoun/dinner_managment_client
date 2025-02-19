import { useState, useEffect } from "react";
import axios from "axios";

const useParticipantsData = () => {
    const [participants, setParticipants] = useState([]);
    const [tables, setTables] = useState([]);
    const [tableMapping, setTableMapping] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const response = await axios.get("http://localhost:8000/table");
                if (response.data.status === "success" && Array.isArray(response.data.data.tables)) {
                    setTables(response.data.data.tables);
                    const mapping = response.data.data.tables.reduce((acc, table) => {
                        acc[table.table_number] = table.id;
                        return acc;
                    }, {});
                    setTableMapping(mapping);
                }
            } catch (error) {
                console.error("Error fetching tables:", error);
            }
        };

        const fetchParticipants = async () => {
            try {
                const response = await axios.get("http://localhost:8000/person");
                if (response.data.status === "success" && response.data.data.people) {
                    setParticipants(response.data.data.people);
                } else {
                    setError("Failed to fetch participants.");
                }
            } catch (err) {
                setError("An error occurred while fetching participants.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTables();
        fetchParticipants();
    }, []);
        
    return { participants, setParticipants, tables, tableMapping, loading, error };
};

export default useParticipantsData;
