import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { create } from "jss";
import { jssPreset, StylesProvider } from "@mui/styles";
import rtl from "jss-rtl";

// יצירת Theme עם תמיכה ב-RTL
const theme = createTheme({
    direction: "rtl",
    typography: {
        fontFamily: `'Arial', 'Assistant', sans-serif`, // פונטים תומכי עברית
    },
});

// יצירת JSS עם תמיכה ב-RTL
const jss = create({ plugins: [...jssPreset().plugins, rtl] });

export default function RTLProvider({ children }) {
    return (
        <StylesProvider jss={jss}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </StylesProvider>
    );
}
