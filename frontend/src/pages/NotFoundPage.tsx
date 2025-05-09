import { Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
    const { t } = useTranslation();

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    py: 8,
                }}
            >
                <Typography
                    variant="h1"
                    component="h1"
                    sx={{
                        fontSize: { xs: '5rem', md: '8rem' },
                        fontWeight: 700,
                        color: "primary.main",
                        mb: 2,
                    }}
                >
                    {t('notFound.code')}
                </Typography>

                <Typography
                    variant="h4"
                    component="h2"
                    sx={{
                        fontWeight: 600,
                        color: "text.primary",
                        mb: 2,
                    }}
                >
                    {t('notFound.title')}
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        color: "text.secondary",
                        mb: 4,
                    }}
                >
                    {t('notFound.description')}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        component={RouterLink}
                        to="/"
                        sx={{
                            py: 1.5,
                            px: 4,
                            fontWeight: 600,
                        }}
                    >
                        {t('notFound.buttonText')}
                    </Button>
                </Box>
            </Box>
        </>
    );
};

export default NotFoundPage;