import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import RTLProvider from "./theme/RTLProvider";

createRoot(document.getElementById("root")).render(
  <RTLProvider>
    <App />
  </RTLProvider>
);
