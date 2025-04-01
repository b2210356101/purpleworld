import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <Box sx={{ textAlign: 'center', my: 4 }}>
      <Typography variant="h2">
        404
      </Typography>
    </Box>
  );
};

export default NotFoundPage;