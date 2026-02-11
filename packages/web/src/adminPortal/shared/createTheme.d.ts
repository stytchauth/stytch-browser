import { AdminPortalStyleConfig } from '../AdminPortalStyleConfig';

declare module '@mui/material/styles/createTheme' {
  interface Theme {
    styleConfig: AdminPortalStyleConfig;
  }
  interface ThemeOptions {
    styleConfig: AdminPortalStyleConfig;
  }
}
