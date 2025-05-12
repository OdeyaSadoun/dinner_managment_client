import { styled } from "@mui/system";
import { Box } from "@mui/material";

const Table = styled(Box)(({ shape, gender }) => {
  let baseWidth = 140;
  let baseHeight = 80;
  let width = 100;
  let height = 100;
  let backgroundColor = gender === "male" ? "#ADD8E6" : "#FFB6C1";

  if (shape === "rectangle") {
    width = baseWidth * 2;
    height = baseHeight;
  }

  if (shape === "bima") {
    width = baseWidth * 6;
    height = baseHeight / 2;
    backgroundColor = "gold";
  }

  if (shape === "vip") {
    backgroundColor = "silver";
  }

  if (shape === "reserva") {
    backgroundColor = "lightgreen";
  }

  return {
    width,
    height,
    backgroundColor,
    borderRadius: shape === "circle" ? "50%" : "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #000",
    cursor: "grab",
    position: "absolute",
  };
});

export default Table;
