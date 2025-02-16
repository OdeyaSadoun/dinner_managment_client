import { styled } from "@mui/system";
import { Box } from "@mui/material";

const Chair = styled(Box, { shouldForwardProp: (prop) => prop !== "isOccupied" })(
  ({ isOccupied }) => ({
    width: 30,
    height: 30,
    backgroundColor: isOccupied ? "#ffa726" : "#d1e7dd",
    borderRadius: "50%",
    border: "1px solid #000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    cursor: isOccupied ? "pointer" : "default",
  })
);

export default Chair;
