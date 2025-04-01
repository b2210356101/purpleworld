import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 3, 
        textAlign: 'center',
        bgcolor: 'primary.light',
      }}
    >
      <Typography color='text.secondary'>
        © {new Date().getFullYear()} Tüm Hakları Saklıdır.
      </Typography>
    </Box>
  );
};

export default Footer;