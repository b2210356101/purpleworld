import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    TextField,
    IconButton,
    InputAdornment,
    Typography,
    CircularProgress,
    Paper,
    List,
    ListItem,
    Divider
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import QuickSearchResults from './QuickSearchResults';
import { searchRestaurants } from '../utils/api';
import { SearchResult } from '../types';
import { useDebounce } from '../hooks/useDebounce';

interface SearchModalProps {
    open: boolean;
    onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ open, onClose }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Debounce search text to reduce API calls
    const debouncedSearchText = useDebounce(searchText, 300);

    // Reset search when modal opens or closes
    useEffect(() => {
        if (!open) {
            // Small delay to prevent visual artifacts when closing
            const timer = setTimeout(() => {
                setSearchText('');
                setSearchResults([]);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [open]);

    // Fetch search results when debounced search text changes
    useEffect(() => {
        const fetchResults = async () => {
            if (debouncedSearchText.trim().length >= 2) {
                setIsLoading(true);
                try {
                    const results = await searchRestaurants(debouncedSearchText);
                    setSearchResults(results);
                    setShowResults(true);
                } catch (error) {
                    console.error('Error fetching search results:', error);
                    setSearchResults([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        };

        fetchResults();
    }, [debouncedSearchText]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchText.trim().length >= 2) {
            navigate(`/search?q=${encodeURIComponent(searchText.trim())}`);
            onClose();
        }
    };

    const handleSeeAllClick = () => {
        if (searchText.trim().length >= 2) {
            navigate(`/search?q=${encodeURIComponent(searchText.trim())}`);
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: { xs: '16px 16px 0 0', sm: 3 },
                    position: { xs: 'absolute', sm: 'relative' },
                    bottom: { xs: 0, sm: 'auto' },
                    m: { xs: 0, sm: 2 },
                    width: { xs: '100%', sm: '100%' },
                    maxWidth: { xs: '100%', sm: 500 },
                    height: { xs: 'calc(100% - 56px)', sm: 'auto' },
                    maxHeight: { xs: '80vh', sm: '80vh' }
                }
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    pt: 2,
                    pb: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                    {t('search.button')}
                </Typography>
                <IconButton onClick={onClose} edge="end">
                    <CloseIcon />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: 2 }}>
                <Box
                    component="form"
                    onSubmit={handleSearch}
                    sx={{ mb: 2 }}
                >
                    <TextField
                        autoFocus
                        fullWidth
                        placeholder={t('search.placeholder')}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        variant="outlined"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: isLoading ? (
                                <InputAdornment position="end">
                                    <CircularProgress size={20} color="secondary" />
                                </InputAdornment>
                            ) : searchText ? (
                                <InputAdornment position="end">
                                    <IconButton
                                        edge="end"
                                        onClick={() => setSearchText('')}
                                        size="small"
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ) : null,
                            sx: {
                                borderRadius: 2,
                                bgcolor: 'background.paper'
                            }
                        }}
                    />
                </Box>

                {searchResults.length > 0 ? (
                    <Box sx={{ position: 'relative' }}>
                        <QuickSearchResults
                            results={searchResults}
                            query={searchText}
                            isLoading={isLoading}
                            onSeeAllClick={handleSeeAllClick}
                        />
                    </Box>
                ) : !isLoading && debouncedSearchText.length >= 2 ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            textAlign: 'center',
                            bgcolor: 'background.default',
                            borderRadius: 2
                        }}
                    >
                        <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            {t('search.noResults')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('search.tryDifferent')}
                        </Typography>
                    </Paper>
                ) : debouncedSearchText.length < 2 && (
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            {t('search.popularSearches')}
                        </Typography>
                        <List sx={{ mt: 1 }}>
                            {['Pizza', 'Burger', 'Kebap', 'Döner', 'Salad'].map((term, index) => (
                                <React.Fragment key={index}>
                                    <ListItem
                                        onClick={() => {
                                            setSearchText(term);
                                        }}
                                        sx={{
                                            borderRadius: 2,
                                            py: 1.5,
                                            '&:hover': { bgcolor: 'action.hover' }
                                        }}
                                    >
                                        <SearchIcon
                                            fontSize="small"
                                            sx={{ mr: 2, color: 'text.secondary' }}
                                        />
                                        <Typography variant="body1">
                                            {term}
                                        </Typography>
                                    </ListItem>
                                    {index < 4 && <Divider component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default SearchModal;