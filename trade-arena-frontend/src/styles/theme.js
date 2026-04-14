import { createTheme } from '@mui/material/styles'

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2874f0',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
    },
    divider: '#e0e0e0',
    custom: {
      nav:         '#2874f0',
      surface:     '#ffffff',
      accentLight: '#eef2ff',
      red:         '#ff6161',
      yellow:      '#ffe500',
      muted:       '#999999',
    },
  },
})

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#60a5fa',
    },
    background: {
      default: '#0f1624',
      paper: '#1e2d4f',
    },
    text: {
      primary: '#e2e8f0',
      secondary: '#a0aec0',
    },
    divider: '#2a3d6a',
    custom: {
      nav:         '#1a2340',
      surface:     '#1e2d4f',
      accentLight: '#162038',
      red:         '#ff6161',
      yellow:      '#ffe500',
      muted:       '#4a6080',
    },
  },
})