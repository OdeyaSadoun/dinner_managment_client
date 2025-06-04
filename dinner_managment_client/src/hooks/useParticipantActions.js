import { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { useSnackbar } from "notistack";
import { HOST } from "../config";

const useParticipantActions = (
  setParticipants,
  participants,
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
      .get(`http://${HOST}:8000/person`) // הנחה: זה מביא את כל האנשים
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
        `http://${HOST}:8000/person/import_csv`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.status === "success") {
        setSnackbarMessage("ייבוא המשתפים הצליח");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        await fetchParticipants();
      } else {
        setSnackbarMessage("ייבוא נכשל: " + (response.data.data?.error || ""));
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("שגיאה בייבוא:", error);
      setSnackbarMessage("שגיאה בעת ייבוא המשתתפים");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
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
        `http://${HOST}:8000/person`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === "success") {
        setSnackbarMessage("המשתתף נוסף בהצלחה");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
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
        setSnackbarMessage("הוספת המשתתף נכשלה");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error adding participant:", error);
      setSnackbarMessage("שגיאה כללית בהוספת המשתתף");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleEditParticipant = (participant) => {
    setNewParticipant({
      ...participant,
      phone: participant.phone || null,
      contact_person: participant.contact_person || null,
      add_manual: participant.add_manual ?? true,
      id: participant.id || participant._id,
      original_is_reach_the_dinner: participant.is_reach_the_dinner, // 👈 שורה חדשה
    });
    setOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      const sanitizedParticipant = {
        name: newParticipant.name,
        phone: newParticipant.phone || null,
        table_number: parseInt(newParticipant.table_number),
        is_reach_the_dinner: newParticipant.is_reach_the_dinner,
        gender: newParticipant.gender,
        contact_person: newParticipant.contact_person || null,
        add_manual: newParticipant.add_manual ?? false,
        original_is_reach_the_dinner:
          newParticipant.original_is_reach_the_dinner ?? null,
      };
      const response = await axios.put(
        `http://${HOST}:8000/person/${newParticipant.id}`,
        sanitizedParticipant,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === "success") {
        setSnackbarMessage("המשתתף עודכן בהצלחה");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        await fetchParticipants();
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error updating participant:", error);
      setSnackbarMessage("עדכון המשתתף נכשל");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
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
      const participant = participants.find(
        (p) => p.id === participantToDelete || p._id === participantToDelete
      );
      const tableNumber = participant?.table_number;
      const reachToDinner = participant?.is_reach_the_dinner;

      await axios.patch(
        `http://${HOST}:8000/person/delete/${participantToDelete}`,
        { table_number: tableNumber, is_reach_the_dinner: reachToDinner }, // 👈 שולחים את מספר השולחן
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSnackbarMessage("המשתתף נמחק בהצלחה");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
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
      setSnackbarMessage("שגיאה כללית במחיקת המשתתף");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
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
            `http://${HOST}:8000/person/seat/${participant.id}`,
            {
              table_id: tableId,
            }
          );
        } else {
          await axios.patch(
            `http://${HOST}:8000/person/unseat/${participant.id}`,
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
      setSnackbarMessage("הושבת המשתתף בשולחן בוצעה בהצלחה");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setParticipants((prev) =>
        prev.map((p) => (p.id === participant.id ? updatedParticipant : p))
      );
    } catch (error) {
      console.error("Error updating participant or table:", error);
      setSnackbarMessage("שגיאה כללית בהושבת המשתתף");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);    }
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
