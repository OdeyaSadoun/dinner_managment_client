import React from "react";
import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        mt: 8,
        backgroundColor: "#f5f5f5",
        textAlign: "center",
        borderTop: "1px solid #ddd",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        אודיה מימון | 054-2943408 | odeya.sadoun@gmail.com
      </Typography>
    </Box>
  );
};


