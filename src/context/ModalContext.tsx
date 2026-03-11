'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { ContactModal } from '../../components/ContactModal';

interface ModalContextType {
    openModal: (context?: string) => void;
    closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [modalContext, setModalContext] = useState<string | undefined>(undefined);

    const openModal = (context?: string) => {
        setModalContext(context);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setModalContext(undefined);
    };

    return (
        <ModalContext.Provider value={{ openModal, closeModal }}>
            {children}
            <ContactModal isOpen={isOpen} onClose={closeModal} context={modalContext} />
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
