import { jwtDecode } from "jwt-decode";

// פונקציה שבודקת אם הטוקן פג תוקף
export const isTokenExpired = () => {
  const token = localStorage.getItem("token");
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000; // בשניות
    return decoded.exp < now;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

// פונקציה שבודקת אם המשתמש הוא אדמין (רק אם הטוקן לא פג)
const isAdmin = () => {
  if (isTokenExpired()) {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    return false;
  }

  const token = localStorage.getItem("token");
  try {
    const decoded = jwtDecode(token);
    return decoded.role === "admin";
  } catch (error) {
    return false;
  }
};

export default isAdmin;
