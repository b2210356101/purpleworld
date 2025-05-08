import React from 'react';
import Lottie from 'react-lottie';
import { Box, Typography } from '@mui/material';
import loadingAnimation from '../assets/loading.json';
import { useTranslation } from 'react-i18next';

interface LoadingProps {
    size?: number;
    showText?: boolean;
    text?: string;
}

const Loading: React.FC<LoadingProps> = ({
    size = 60,
    showText = true,
    text = "Loading..."
}) => {
    const { t } = useTranslation();
    text = t('util.loading')

    const defaultOptions = {
        animationData: loadingAnimation,
        loop: true,
        autoplay: true,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
        >
            <Lottie
                options={defaultOptions}
                height={size}
                width={size}
            />
            {showText && (
                <Typography
                    color="textSecondary"
                    sx={{
                        fontWeight: 500,
                        color: "primary.main"
                    }}
                >
                    {text}
                </Typography>
            )}
        </Box>
    );
};

export default Loading;