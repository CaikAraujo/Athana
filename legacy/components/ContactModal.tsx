'use client';

import React, { useEffect } from 'react';
import { X, Terminal } from 'lucide-react';
import { ContactForm } from './ContactForm';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    context?: string; // e.g., "Plan: Premium", "Template: Nexus"
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, context }) => {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-athana-black border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-athana-accent/10 rounded-lg text-athana-accent">
                            <Terminal size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white font-display">Démarrer un Projet</h3>
                            {context && <p className="text-xs text-athana-accent uppercase tracking-wider font-mono">{context}</p>}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <ContactForm
                        context={context}
                        onSubmit={() => {
                            // In a real app, logic to handle submission
                            // For now, we presume the user wants to close after submit or show a success message
                            // e.target.reset(); // optional
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
