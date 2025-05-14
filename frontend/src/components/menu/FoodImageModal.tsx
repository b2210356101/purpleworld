import { Modal, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';

interface FoodImageModalProps {
    open: boolean;
    onClose: () => void;
    imageUrl: string;
    foodName: string;
}

const FoodImageModal: React.FC<FoodImageModalProps> = ({ open, onClose, imageUrl, foodName }) => {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby={`${foodName}-image-modal`}
            aria-describedby={`Enlarged image of ${foodName}`}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    outline: 'none',
                    maxWidth: '98vw',
                    maxHeight: '98vh',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24,
                    overflow: 'hidden',
                }}
            >
                {/* Close button */}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        zIndex: 1,
                        '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                        },
                    }}
                >
                    <CloseIcon />
                </IconButton>

                {/* Loading skeleton while image loads */}
                {isLoading && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                border: '3px solid #845EC2',
                                borderTopColor: 'transparent',
                                animation: 'spin 1s linear infinite',
                                '@keyframes spin': {
                                    '0%': {
                                        transform: 'rotate(0deg)',
                                    },
                                    '100%': {
                                        transform: 'rotate(360deg)',
                                    },
                                },
                            }}
                        />
                    </Box>
                )}

                {/* The image */}
                <Box
                    component="img"
                    src={imageUrl}
                    alt={foodName}
                    onLoad={() => setIsLoading(false)}
                    sx={{
                        width: '100%',
                        height: '100%',
                        maxWidth: { xs: '100%', sm: 500, md: 700 },
                        maxHeight: { xs: 300, sm: 400, md: 500 },
                        objectFit: 'contain',
                        display: isLoading ? 'none' : 'block',
                    }}
                />
            </Box>
        </Modal>
    );
};

export default FoodImageModal;