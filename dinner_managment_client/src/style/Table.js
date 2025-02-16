import { styled } from "@mui/system";
import { Box } from "@mui/material";

const Table = styled(Box)(({ shape, gender }) => ({
  width: shape === "rectangle" ? 140 : shape === "square" ? 100 : 100,
  height: shape === "rectangle" ? 80 : 100,
  backgroundColor: gender === "male" ? "#ADD8E6" : "#FFB6C1",
  borderRadius: shape === "circle" ? "50%" : "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "2px solid #000",
  cursor: "grab",
  position: "absolute",
}));

export default Table;
