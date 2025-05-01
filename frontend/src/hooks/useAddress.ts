import { useState, useEffect, useCallback, useRef } from 'react';
import { Address } from '../types';
import { getCustomerAddresses, getCurrentAddress, saveAddress, updateAddress, setCurrentAddress, deleteAddress } from '../utils/api';

interface ApiAddress {
    addressId: number;
    name: string;
    city: string;
    district: string;
    neighborhood: string;
    street: string | null;
    buildingNumber: string;
    floor: string;
    apartmentNumber: string;
    fullAddress: string;
    phoneNumber: string;
}

export const useAddress = () => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
    const [isNewAddressDialogOpen, setIsNewAddressDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [onConfirmProceed, setOnConfirmProceed] = useState<(() => void) | null>(null);

    // Keep track of if the hook is mounted to prevent state updates on unmounted component
    const isMounted = useRef(true);

    // Flag to track if initial data has been fetched
    const initialFetchRef = useRef(false);

    // Memoize the fetch addresses function
    const fetchAddresses = useCallback(async () => {
        if (!isMounted.current) return;

        try {
            // Use Promise.all to fetch both APIs in parallel
            const [addressesData, currentAddressData] = await Promise.all([
                getCustomerAddresses(),
                getCurrentAddress()
            ]);

            // Initialize addresses as empty array by default
            let formattedAddresses: Address[] = [];

            if (addressesData && addressesData.addresses &&
                Array.isArray(addressesData.addresses) &&
                addressesData.addresses.length > 0) {

                formattedAddresses = addressesData.addresses.map((addr: ApiAddress) => ({
                    addressId: addr.addressId,
                    name: addr.name,
                    fullAddress: addr.fullAddress,
                    phoneNumber: addr.phoneNumber,
                    neighborhood: addr.neighborhood,
                    buildingNumber: addr.buildingNumber,
                    floor: addr.floor,
                    apartmentNumber: addr.apartmentNumber,
                    city: addr.city,
                    district: addr.district,
                    street: addr.street || '',
                }));
            }

            if (isMounted.current) {
                setAddresses(formattedAddresses);

                if (currentAddressData) {
                    setSelectedAddress(currentAddressData.addressId);
                } else {
                    setSelectedAddress(null);
                }
            }
        } catch (err) {
            console.error('Error fetching addresses:', err);
            if (isMounted.current) {
                setError('Failed to load addresses. Please try again later.');
            }
        }
    }, []);

    // Memoize dialog handlers
    const handleDialogOpen = useCallback(() => setIsAddressDialogOpen(true), []);
    const handleDialogClose = useCallback(() => setIsAddressDialogOpen(false), []);

    // Memoize address action handlers
    const handleAddNewAddress = useCallback(() => {
        setIsEditMode(false);
        setAddressToEdit(null);
        setIsNewAddressDialogOpen(true);
    }, []);

    const handleEditAddress = useCallback((address: Address) => {
        setIsEditMode(true);
        setAddressToEdit(address);
        setIsNewAddressDialogOpen(true);
    }, []);

    const handleSaveNewAddress = useCallback(async (address: Omit<Address, 'id'>, location: { lat: number, lng: number } | null) => {
        try {
            await saveAddress(address, location);
            await fetchAddresses();
            setIsNewAddressDialogOpen(false);
        } catch (error) {
            console.error('Error saving address:', error);
        }
    }, [fetchAddresses]);

    const handleUpdateAddress = useCallback(async (address: Address, location: { lat: number, lng: number } | null) => {
        const proceedWithUpdate = async () => {
            try {
                await updateAddress(address, location);
                await fetchAddresses();
                window.dispatchEvent(new CustomEvent("cart-updated"));
                setIsNewAddressDialogOpen(false);
                setIsEditMode(false);
                setAddressToEdit(null);
            } catch (error) {
                console.error('Error updating address:', error);
            }
        };

        setOnConfirmProceed(() => proceedWithUpdate);
        setIsConfirmDialogOpen(true);
    }, [fetchAddresses]);

    const proceedWithAddressChange = useCallback(async () => {
        if (!selectedAddress) return;

        try {
            await setCurrentAddress(selectedAddress);
            handleDialogClose();
            window.dispatchEvent(new CustomEvent("cart-updated"));
        } catch (error) {
            setError('Failed to set current address. Please try again.');
        }
    }, [selectedAddress, handleDialogClose]);

    const handleSaveAddresses = useCallback(async () => {
        if (!selectedAddress) {
            setError('Please select an address first');
            return;
        }

        const cartCount = Number(localStorage.getItem("cartCount") || "0");

        if (cartCount > 0) {
            setOnConfirmProceed(() => proceedWithAddressChange);
            setIsConfirmDialogOpen(true);
            return;
        }

        await proceedWithAddressChange();
    }, [selectedAddress, proceedWithAddressChange]);

    const handleAddressChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedAddress(Number(event.target.value));
    }, []);

    const handleDeleteAddress = useCallback((addressId: number) => {
        const proceedWithDelete = async () => {
            try {
                await deleteAddress(addressId);
                await fetchAddresses();
                window.dispatchEvent(new CustomEvent("cart-updated"));
            } catch (error) {
                console.error('Failed to delete address:', error);
                alert('Failed to delete address. Please try again.');
            }
        };

        setOnConfirmProceed(() => proceedWithDelete);
        setIsConfirmDialogOpen(true);
    }, [fetchAddresses]);

    // Fetch addresses on mount, but only once
    useEffect(() => {
        isMounted.current = true;

        if (!initialFetchRef.current) {
            initialFetchRef.current = true;
            fetchAddresses();
        }

        return () => {
            isMounted.current = false;
        };
    }, [fetchAddresses]);

    return {
        addresses,
        selectedAddress,
        isAddressDialogOpen,
        isNewAddressDialogOpen,
        isEditMode,
        addressToEdit,
        error,
        isConfirmDialogOpen,
        onConfirmProceed,
        fetchAddresses,
        handleDialogOpen,
        handleDialogClose,
        handleAddNewAddress,
        handleEditAddress,
        handleSaveNewAddress,
        handleUpdateAddress,
        handleSaveAddresses,
        handleAddressChange,
        handleDeleteAddress,
        setIsConfirmDialogOpen,
        setIsNewAddressDialogOpen,
        setAddressToEdit,
    };
};