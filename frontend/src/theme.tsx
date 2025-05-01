import { createTheme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

export const createAppTheme = (mode: PaletteMode) => {
    return createTheme({
        palette: {
            mode,
            ...(mode === 'light'
                ? {
                    // Light mode
                    primary: {
                        main: '#845EC2',
                        light: '#F6F0FF',
                    },
                    secondary: {
                        main: '#FF1744',
                    },
                    text: {
                        primary: '#212121',
                        secondary: '#666666',
                    },
                }
                : {
                    // Dark mode
                    primary: {
                        main: '#845EC2',
                        light: '#310233',
                    },
                    secondary: {
                        main: '#FF1744',
                    },
                    text: {
                        primary: '#fefefe',
                        secondary: '#aaaaaa',
                    },
                    background: {
                        default: '#0f1214',
                        paper: '#1b031c',
                    }
                }),
        },
        typography: {
            allVariants: {
                fontFamily: "'Montserrat', sans-serif",
                textTransform: "none",
            }
        },
        components: {
            MuiPaper: {
                styleOverrides: {
                    root: {
                        boxShadow: '0px 0px 10px rgba(132, 94, 194, 0.2)', // Purple shadow
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: '50px', // oval
                        padding: '4px 16px',
                    },
                },
            },
        },
    });
};

const theme = createAppTheme('light');
export default theme;