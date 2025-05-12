// ✅ Hook לשימוש בפעולת העלאת שולחנות מ־CSV
import { useSnackbar } from "notistack";
import axios from "axios";

const useUploadTablesCsv = (setTables) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleUploadTablesCsv = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:8000/table/import_csv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      
      if (response.data?.status === "success") {
        enqueueSnackbar("השולחנות יובאו בהצלחה!", { variant: "success" });
        // רענון טבלאות מהשרת אם צריך:
        // const refreshed = await axios.get("/table"); setTables(refreshed.data);
      } else {
        enqueueSnackbar(response.data?.message || "שגיאה בייבוא", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("שגיאה כללית בעת השליחה", { variant: "error" });
      console.error(error);
    }
  };

  return { handleUploadTablesCsv };
};

export default useUploadTablesCsv;
