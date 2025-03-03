import { jwtDecode } from "jwt-decode";

const isAdmin = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    return decoded.role === "admin"; 
  } catch (error) {
    console.error("Error decoding token:", error);
    return false;
  }
};

export default isAdmin;
