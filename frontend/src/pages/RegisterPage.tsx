import { Container, Tabs, Tab, Box, Paper, useTheme } from '@mui/material';
import { useState } from 'react';
import RegisterCustomer from '../components/registerTabs/RegisterCustomer';
import RegisterRestaurant from '../components/registerTabs/RegisterRestaurant';
import RegisterCourier from '../components/registerTabs/RegisterCourier';

const RegisterPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container sx={{ px: { xs: 1, md: 4 }, py: 4 }}>
      {/* Gradient Background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '360px',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #FF5E78 50%, #FEAC5E 100%)`,
          zIndex: 0
        }}
      />

      {/* Registration Content */}
      <Container
        maxWidth="sm"
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%'
        }}
      >
        {/* Tabs Section */}
        <Box
          sx={{
            backgroundColor: theme.palette.primary.main,
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            overflow: 'hidden',
            width: '100%',
            zIndex: 2
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              minHeight: 48,
              width: '100%',
              backgroundColor: theme.palette.primary.main,
              '& .MuiTabs-indicator': {
                display: 'none'
              }
            }}
          >
            {['Customer', 'Restaurant', 'Courier'].map((label, index) => (
              <Tab
                key={label}
                label={label}
                disableRipple
                sx={{
                  minHeight: 48,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  borderRight: index !== 2 ? '1px solid #fff' : 'none',
                  borderLeft: index !== 0 ? '1px solid #fff' : 'none',
                  backgroundColor:
                    activeTab === index ? '#5E3EBD' : theme.palette.primary.main,
                  color: 'white !important',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Form Section */}
        <Paper
          elevation={0}
          sx={{
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
            px: { xs: 4, md: 6 },
            py: { xs: 4, md: 6 },
            width: '100%',
            mt: '-4px',
            backgroundColor: theme.palette.background.paper
          }}
        >
          {activeTab === 0 && <RegisterCustomer />}
          {activeTab === 1 && <RegisterRestaurant />}
          {activeTab === 2 && <RegisterCourier />}
        </Paper>
      </Container>
    </Container>
  );
};

export default RegisterPage;
