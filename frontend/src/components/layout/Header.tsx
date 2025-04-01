import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const Header = () => {
    return (
        <AppBar position="static" elevation={0}>
            <Toolbar>
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="open drawer"
                    sx={{ mr: 1 }}
                >
                    <MenuIcon />
                </IconButton>

                <Box 
                    component={Link} 
                    to="/" 
                    sx={{ display: 'flex', color:'#ffffff' }}
                >
                    <img 
                        src="src\assets\logo.svg" 
                        alt="Logo" 
                        height="30" 
                        style={{ 
                            marginRight: '10px',
                            filter: 'brightness(0) invert(1)' // white
                          }} 
                    />
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;