'use client';

import React, { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LOCALE } from '../src/i18n/routing';

interface ContactFormProps {
    className?: string;
    onSubmit?: (e: React.FormEvent) => void;
    context?: string;
}

type FormData = {
    name: string;
    company: string;
    source: string;
    email: string;
    phone: string;
    message: string;
};

export const ContactForm: React.FC<ContactFormProps> = ({ className = '', onSubmit }) => {
    const { i18n } = useTranslation();
    const locale = (i18n.resolvedLanguage || DEFAULT_LOCALE).slice(0, 2);
    const copyByLocale: Record<string, Record<string, string>> = {
        fr: {
            name: 'Nom',
            company: 'Entreprise',
            source: 'Comment vous nous avez connus ?',
            email: 'Email',
            phone: 'Téléphone',
            message: 'Message',
            select: 'Sélectionnez...',
            referral: 'Recommandation',
            other: 'Autre',
            namePlaceholder: 'Votre nom',
            companyPlaceholder: 'Votre entreprise',
            emailPlaceholder: 'votre@email.com',
            phonePlaceholder: '+41 79 000 00 00',
            messagePlaceholder: 'Décrivez votre projet...',
            submitting: 'Initialisation...',
            submit: 'Initier le Projet',
            success: 'Formulaire envoyé avec succès !',
            error: 'Une erreur est survenue, veuillez réessayer.',
            submitError: "Erreur lors de l'envoi du formulaire",
            nameErr: 'Le nom doit comporter au moins 2 caractères',
            companyErr: "L'entreprise doit comporter au moins 2 caractères",
            sourceErr: 'Veuillez sélectionner une option',
            emailErr: 'Email invalide',
            phoneErr: 'Numéro de téléphone trop court',
            messageErr: 'Le message doit comporter au moins 10 caractères',
        },
        en: {
            name: 'Name',
            company: 'Company',
            source: 'How did you hear about us?',
            email: 'Email',
            phone: 'Phone',
            message: 'Message',
            select: 'Select...',
            referral: 'Referral',
            other: 'Other',
            namePlaceholder: 'Your name',
            companyPlaceholder: 'Your company',
            emailPlaceholder: 'you@email.com',
            phonePlaceholder: '+41 79 000 00 00',
            messagePlaceholder: 'Describe your project...',
            submitting: 'Sending...',
            submit: 'Start the Project',
            success: 'Form submitted successfully!',
            error: 'An error occurred, please try again.',
            submitError: 'Error while sending form',
            nameErr: 'Name must be at least 2 characters',
            companyErr: 'Company must be at least 2 characters',
            sourceErr: 'Please select an option',
            emailErr: 'Invalid email',
            phoneErr: 'Phone number is too short',
            messageErr: 'Message must be at least 10 characters',
        },
        de: {
            name: 'Name',
            company: 'Unternehmen',
            source: 'Wie haben Sie uns gefunden?',
            email: 'E-Mail',
            phone: 'Telefon',
            message: 'Nachricht',
            select: 'Auswählen...',
            referral: 'Empfehlung',
            other: 'Andere',
            namePlaceholder: 'Ihr Name',
            companyPlaceholder: 'Ihr Unternehmen',
            emailPlaceholder: 'sie@email.com',
            phonePlaceholder: '+41 79 000 00 00',
            messagePlaceholder: 'Beschreiben Sie Ihr Projekt...',
            submitting: 'Wird gesendet...',
            submit: 'Projekt starten',
            success: 'Formular erfolgreich gesendet!',
            error: 'Ein Fehler ist aufgetreten. Bitte erneut versuchen.',
            submitError: 'Fehler beim Senden',
            nameErr: 'Name muss mindestens 2 Zeichen haben',
            companyErr: 'Unternehmen muss mindestens 2 Zeichen haben',
            sourceErr: 'Bitte wählen Sie eine Option',
            emailErr: 'Ungültige E-Mail',
            phoneErr: 'Telefonnummer ist zu kurz',
            messageErr: 'Nachricht muss mindestens 10 Zeichen haben',
        },
        it: {
            name: 'Nome',
            company: 'Azienda',
            source: 'Come ci hai conosciuti?',
            email: 'Email',
            phone: 'Telefono',
            message: 'Messaggio',
            select: 'Seleziona...',
            referral: 'Segnalazione',
            other: 'Altro',
            namePlaceholder: 'Il tuo nome',
            companyPlaceholder: 'La tua azienda',
            emailPlaceholder: 'tu@email.com',
            phonePlaceholder: '+41 79 000 00 00',
            messagePlaceholder: 'Descrivi il tuo progetto...',
            submitting: 'Invio...',
            submit: 'Avvia il progetto',
            success: 'Modulo inviato con successo!',
            error: 'Si è verificato un errore, riprova.',
            submitError: "Errore durante l'invio",
            nameErr: 'Il nome deve avere almeno 2 caratteri',
            companyErr: "L'azienda deve avere almeno 2 caratteri",
            sourceErr: 'Seleziona un’opzione',
            emailErr: 'Email non valida',
            phoneErr: 'Numero di telefono troppo corto',
            messageErr: 'Il messaggio deve avere almeno 10 caratteri',
        },
    };
    const copy = copyByLocale[locale] || copyByLocale.fr;

    const formSchema = z.object({
        name: z.string().min(2, copy.nameErr),
        company: z.string().min(2, copy.companyErr),
        source: z.string().min(1, copy.sourceErr),
        email: z.string().email(copy.emailErr),
        phone: z.string().min(10, copy.phoneErr),
        message: z.string().min(10, copy.messageErr),
    });

    const [formData, setFormData] = useState<FormData>({
        name: '',
        company: '',
        source: '',
        email: '',
        phone: '',
        message: ''
    });
    const [honeypot, setHoneypot] = useState('');

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitFeedback, setSubmitFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        // Clear error when user types
        if (errors[id]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[id];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitFeedback(null);

        const result = formSchema.safeParse(formData);
        const newErrors: Record<string, string> = {};

        if (!result.success) {
            result.error.issues.forEach(issue => {
                newErrors[String(issue.path[0])] = issue.message;
            });
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, website: honeypot }),
            });

            if (!response.ok) {
                throw new Error(copy.submitError);
            }

            if (onSubmit) onSubmit(e);
            setSubmitFeedback({ type: 'success', message: copy.success });
        } catch (error) {
            console.error('Submission error:', error);
            setSubmitFeedback({ type: 'error', message: copy.error });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getInputClass = (fieldName: string) => `
        w-full bg-white/5 border rounded-sm p-4 text-white focus:outline-none transition-all
        ${errors[fieldName]
            ? 'border-red-500/50 focus:border-red-500 bg-red-500/5'
            : 'border-white/10 focus:border-athana-accent focus:bg-white/10'
        }
    `;

    return (
        <form className={`space-y-6 relative z-10 ${className}`} onSubmit={handleSubmit}>
            {/* Honeypot field - invisible to humans, bots will fill it */}
            <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-xs font-bold text-athana-accent uppercase tracking-widest">{copy.name}</label>
                    <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className={getInputClass('name')}
                        placeholder={copy.namePlaceholder}
                    />
                    {errors.name && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.name}</p>}
                </div>
                <div className="space-y-2">
                    <label htmlFor="company" className="text-xs font-bold text-athana-accent uppercase tracking-widest">{copy.company}</label>
                    <input
                        id="company"
                        type="text"
                        value={formData.company}
                        onChange={handleChange}
                        className={getInputClass('company')}
                        placeholder={copy.companyPlaceholder}
                    />
                    {errors.company && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.company}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="source" className="text-xs font-bold text-athana-accent uppercase tracking-widest">{copy.source}</label>
                <select
                    id="source"
                    value={formData.source}
                    onChange={handleChange}
                    className={`${getInputClass('source')} appearance-none cursor-pointer`}
                >
                    <option value="" className="bg-athana-dark text-gray-400">{copy.select}</option>
                    <option value="linkedin" className="bg-athana-dark text-white">LinkedIn</option>
                    <option value="google" className="bg-athana-dark text-white">Google</option>
                    <option value="referral" className="bg-athana-dark text-white">{copy.referral}</option>
                    <option value="other" className="bg-athana-dark text-white">{copy.other}</option>
                </select>
                {errors.source && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.source}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="email" className="text-xs font-bold text-athana-accent uppercase tracking-widest">{copy.email}</label>
                    <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={getInputClass('email')}
                        placeholder={copy.emailPlaceholder}
                    />
                    {errors.email && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.email}</p>}
                </div>
                <div className="space-y-2">
                    <label htmlFor="phone" className="text-xs font-bold text-athana-accent uppercase tracking-widest">{copy.phone}</label>
                    <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className={getInputClass('phone')}
                        placeholder={copy.phonePlaceholder}
                    />
                    {errors.phone && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.phone}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="message" className="text-xs font-bold text-athana-accent uppercase tracking-widest">{copy.message}</label>
                <textarea
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className={getInputClass('message')}
                    placeholder={copy.messagePlaceholder}
                ></textarea>
                {errors.message && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.message}</p>}
            </div>

            <button
                disabled={isSubmitting}
                className="w-full bg-athana-accent text-black font-bold text-lg py-4 rounded-sm hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? copy.submitting : copy.submit}
                {!isSubmitting && <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
            {submitFeedback && (
                <p className={`text-sm ${submitFeedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {submitFeedback.message}
                </p>
            )}
        </form>
    );
};
