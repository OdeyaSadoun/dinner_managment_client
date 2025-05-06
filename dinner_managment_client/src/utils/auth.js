import { jwtDecode } from "jwt-decode";

export const isTokenExpired = () => {
  const token = localStorage.getItem("token");
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    let exp = decoded.exp;

    // אם exp בטעות הגיע במילישניות במקום שניות
    if (exp > 9999999999) {
      exp = exp / 1000; // להמיר לשניות
    }

    const now = Date.now() / 1000;
    const expired = exp < now;

    console.log("🕒 זמן נוכחי:", now);
    console.log("📅 תוקף הטוקן:", exp);
    console.log("⏰ פג תוקף?", expired);

    return expired;
  } catch (error) {
    console.error("❌ שגיאה בפענוח הטוקן:", error);
    return true;
  }
};


// פונקציה שבודקת אם המשתמש הוא אדמין (רק אם הטוקן לא פג)
const isAdmin = () => {
  console.log(122);
  
  if (isTokenExpired()) {
    console.log("expired");
    
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    return false;
  }

  const token = localStorage.getItem("token");
  try {
    const decoded = jwtDecode(token);
    console.log({decoded});
    
    return decoded.role === "admin";
  } catch (error) {
    return false;
  }
};

export default isAdmin;