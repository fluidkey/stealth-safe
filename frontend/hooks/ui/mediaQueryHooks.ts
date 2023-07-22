import {useMediaQuery} from "@mui/material";
import {theme} from "../../GlobalStyles";

export const useIsMobile = () => useMediaQuery(theme.breakpoints.down('sm'));
export const useIsTablet = () => useMediaQuery(theme.breakpoints.down('md'));
