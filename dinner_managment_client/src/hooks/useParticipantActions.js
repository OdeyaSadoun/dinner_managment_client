import { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { useSnackbar } from "notistack";

const useParticipantActions = (
  setParticipants,
  tableMapping,
  setSnackbarOpen,
  setSnackbarMessage,
  setSnackbarSeverity,
  hasSearched,
  searchTerm,
  setFilteredParticipants,
  fetchParticipants
) => {
  const [open, setOpen] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState(null);
  const [newParticipant, setNewParticipant] = useState({
    name: "",
    phone: "",
    table_number: "",
    is_reach_the_dinner: false,
    gender: "male",
    contact_person: "",
    add_manual: true,
  });
  const { enqueueSnackbar } = useSnackbar();

  const handleDownloadAllParticipants = () => {
    console.log("⏬ התחלת הורדה של כל המשתתפים");

    axios
      .get("http://localhost:8000/person") // הנחה: זה מביא את כל האנשים
      .then((response) => {
        console.log("📦 תגובת שרת:", response.data);

        const people = response.data.data.people;
        if (!people || people.length === 0) {
          enqueueSnackbar("לא נמצאו משתתפים במערכת.", {
            variant: "info",
          });
          return;
        }

        const worksheet = XLSX.utils.json_to_sheet(
          people.map((p) => ({
            שם: p.name,
            טלפון: p.phone || "",
            "מספר שולחן": p.table_number ?? "",
            מגדר: p.gender === "male" ? "גבר" : "אישה",
            "איש קשר": p.contact_person || "",
            "הגיע לדינר?": p.is_reach_the_dinner ? "✔" : "",
            "אופן הוספה": p.add_manual ? "ידני" : "אוטומטי",
          }))
        );

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "כל המשתתפים");

        const dateStr = new Date()
          .toLocaleDateString("he-IL")
          .replace(/\//g, "-");
        const filename = `כל המשתתפים בדינר - ${dateStr}.xlsx`;

        XLSX.writeFile(workbook, filename);
        enqueueSnackbar("✅ הקובץ ירד בהצלחה!", { variant: "success" });
      })
      .catch((error) => {
        console.error("❌ שגיאה בהורדה:", error);
        enqueueSnackbar("אירעה שגיאה במהלך ההורדה", { variant: "error" });
      });
  };

  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setCsvLoading(true); // ⏳ התחלת ייבוא

    try {
      const response = await axios.post(
        "http://localhost:8000/person/import_csv",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.status === "success") {
        alert("✅ ייבוא הצליח!");
        await fetchParticipants();
      } else {
        alert("⚠️ ייבוא נכשל: " + (response.data.data?.error || ""));
      }
    } catch (error) {
      console.error("שגיאה בייבוא:", error);
      alert("❌ שגיאה בעת הייבוא");
    } finally {
      setCsvLoading(false); // ✅ סיום ייבוא
    }
  };

  const handleOpenDialog = () => {
    setNewParticipant({
      name: "",
      phone: "",
      table_number: "",
      is_reach_the_dinner: false,
      gender: "male",
      contact_person: "",
      add_manual: true,
    });
    setOpen(true);
  };

  const handleCloseDialog = () => setOpen(false);

  const handleAddParticipant = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...newParticipant,
        add_manual: true,
      };

      const response = await axios.post(
        "http://localhost:8000/person",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(response.data);
      
      if (response.data.status === "success") {
        console.log(response.data.data);

        await fetchParticipants();
        setNewParticipant({
          name: "",
          phone: "",
          table_number: "",
          is_reach_the_dinner: false,
          gender: "male",
          contact_person: "",
          add_manual: true,
        });
        handleCloseDialog();
      } else {
        alert("Failed to add participant.");
      }
    } catch (error) {
      console.error("Error adding participant:", error);
      alert("An error occurred while adding the participant.");
    }
  };

  const handleEditParticipant = (participant) => {
    setNewParticipant({
      ...participant,
      phone: participant.phone || null,
      contact_person: participant.contact_person || null,
      add_manual: participant.add_manual ?? true,
      id: participant.id || participant._id,
    });
    setOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("token");

      // מסנכרן את הפורמט לשרת לפי המודל
      const sanitizedParticipant = {
        name: newParticipant.name,
        phone: newParticipant.phone || null,
        table_number: parseInt(newParticipant.table_number),
        is_reach_the_dinner: newParticipant.is_reach_the_dinner,
        gender: newParticipant.gender,
        contact_person: newParticipant.contact_person || null,
        add_manual: newParticipant.add_manual ?? false,
      };
      console.log(sanitizedParticipant);
      console.log("🟢 newParticipant:", newParticipant);
      console.log("🧼 sanitizedParticipant:", sanitizedParticipant);
      console.log(
        "📡 URL שנשלחת:",
        `http://localhost:8000/person/${newParticipant.id}`
      );

      const response = await axios.put(
        `http://localhost:8000/person/${newParticipant.id}`,
        sanitizedParticipant,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response.data);

      if (response.data.status === "success") {
        await fetchParticipants();
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error updating participant:", error);
      alert("Failed to update participant. Please try again.");
    }
  };

  const confirmDeleteParticipant = (id) => {
    setParticipantToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteParticipant = async () => {
    if (!participantToDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:8000/person/delete/${participantToDelete}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setParticipants((prev) => {
        const updated = prev.filter((p) => p.id !== participantToDelete);
        if (hasSearched) {
          const filtered = updated.filter((p) =>
            [p.name, p.phone].some((val) =>
              val?.toLowerCase().includes(searchTerm.toLowerCase())
            )
          );
          setFilteredParticipants(filtered);
        }
        return updated;
      });
    } catch (error) {
      console.error("Error deleting participant:", error);
      alert("Failed to delete participant. Please try again.");
    } finally {
      setDeleteDialogOpen(false);
      setParticipantToDelete(null);
    }
  };

  const handleCheckboxChange = async (participant) => {
    try {
      const updatedParticipant = {
        ...participant,
        is_reach_the_dinner: !participant.is_reach_the_dinner,
      };
      console.log(participant);
      console.log(tableMapping);

      const tableId = tableMapping[participant.table_number];

      if (!tableId) {
        setSnackbarMessage(
          `שולחן מספר ${participant.table_number} לא קיים במערכת. לא ניתן להושיב את המשתתף.`
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }
      console.log(tableId);

      if (tableId) {
        if (updatedParticipant.is_reach_the_dinner) {
          await axios.patch(
            `http://localhost:8000/person/seat/${participant.id}`,
            {
              table_id: tableId,
            }
          );
        } else {
          await axios.patch(
            `http://localhost:8000/person/unseat/${participant.id}`,
            {
              table_id: tableId,
            }
          );
        }
      } else {
        console.error(
          "Table ID not found for table number:",
          participant.table_number
        );
      }

      setParticipants((prev) =>
        prev.map((p) => (p.id === participant.id ? updatedParticipant : p))
      );
    } catch (error) {
      console.error("Error updating participant or table:", error);
      alert("Failed to update participant. Please try again.");
    }
  };

  return {
    open,
    deleteDialogOpen,
    newParticipant,
    setNewParticipant,
    handleOpenDialog,
    handleCloseDialog,
    handleAddParticipant,
    handleEditParticipant,
    handleSaveEdit,
    confirmDeleteParticipant,
    handleDeleteParticipant,
    setDeleteDialogOpen,
    handleCheckboxChange,
    handleDownloadAllParticipants,
    handleCSVUpload,
    csvLoading,
  };
};

export default useParticipantActions;
