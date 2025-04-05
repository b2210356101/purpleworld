import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    cssVariables: true,
    colorSchemes: {
        light: {
            palette: {
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
            },
        },
        // dark: {
        //     palette: {
        //         primary: {
        //             main: '#845EC2',
        //             light: '#19111d',
        //         },
        //         secondary: {
        //             main: '#FF1744',
        //         },
        //         text: {
        //             primary: '#fefefe',
        //             secondary: '#aaaaaa',
        //         },
        //         background: {
        //             default: '#0f1214',
        //         }
        //     },
        // },
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

export default theme;
