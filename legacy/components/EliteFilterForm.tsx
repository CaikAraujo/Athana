'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Send, AlertCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { DEFAULT_LOCALE, isLocale, withLocalePath } from '../src/i18n/routing';
import { useTranslation } from 'react-i18next';

type EliteFilterData = {
  ambition?: 'plateforme' | 'refonte' | 'automatisation' | 'corporate';
  stage?: 'idee' | 'maquette' | 'remplacer';
  budget?: 'lt2k' | '2k-5k' | '5k+';
  vision?: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
};

const slideVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 20 : -20 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction < 0 ? 20 : -20 }),
};

interface EliteFilterFormProps {
  onStepChange?: (step: number) => void;
}

export const EliteFilterForm: React.FC<EliteFilterFormProps> = ({ onStepChange }) => {
  const { lang } = useParams();
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const { t, i18n } = useTranslation('eliteFlow');
  const getFlowObject = <T,>(key: string): T => {
    const localized = t(key, { returnObjects: true }) as T;
    const isArray = Array.isArray(localized);
    const isObject = localized && typeof localized === 'object';
    if ((isArray && (localized as unknown[]).length > 0) || (isObject && Object.keys(localized as Record<string, unknown>).length > 0)) {
      return localized;
    }
    return i18n.getResource('fr', 'eliteFlow', key) as T;
  };
  const copy = {
    validation: getFlowObject<Record<string, string>>('validation'),
    options: getFlowObject<{
      ambition: Array<{ value: EliteFilterData['ambition']; title: string; desc: string }>;
      stage: Array<{ value: EliteFilterData['stage']; title: string; desc: string }>;
      budget: Array<{ value: EliteFilterData['budget']; label: string; desc: string }>;
    }>('options'),
    success: getFlowObject<Record<string, string>>('success'),
    callback: getFlowObject<Record<string, string>>('callback'),
    steps: getFlowObject<Record<string, string>>('steps'),
    form: getFlowObject<Record<string, string>>('form'),
    nav: getFlowObject<Record<string, string>>('nav'),
    alerts: getFlowObject<Record<string, string>>('alerts'),
  };
  const eliteFilterSchema = z.object({
    ambition: z.enum(['plateforme', 'refonte', 'automatisation', 'corporate']).optional(),
    stage: z.enum(['idee', 'maquette', 'remplacer']).optional(),
    budget: z.enum(['lt2k', '2k-5k', '5k+']).optional(),
    vision: z.string().optional(),
    name: z.string().min(2, copy.validation.name),
    email: z.string().email(copy.validation.email),
    company: z.string().min(2, copy.validation.company),
    phone: z.string().optional(),
  }).refine((d) => d.ambition && d.stage && d.budget, { message: copy.validation.previousSteps, path: ['ambition'] });
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasClickedEnvoyer, setHasClickedEnvoyer] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackSent, setCallbackSent] = useState(false);
  const [callbackLoading, setCallbackLoading] = useState(false);
  const [callbackError, setCallbackError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EliteFilterData>({
    resolver: zodResolver(eliteFilterSchema),
    mode: 'onSubmit',
    defaultValues: {
      ambition: undefined,
      stage: undefined,
      budget: undefined,
      vision: '',
      name: '',
      email: '',
      company: '',
      phone: '',
    },
  });

  const ambition = watch('ambition');
  const stage = watch('stage');
  const budget = watch('budget');

  const handleCallbackSubmit = async () => {
    const trimmed = callbackPhone.trim();
    if (!trimmed || trimmed.length < 8) {
      setCallbackError(copy.validation.callbackPhone);
      return;
    }
    setCallbackError(null);
    setCallbackLoading(true);
    try {
      const response = await fetch('/api/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: trimmed }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || copy.validation.sendError);
      }
      setCallbackSent(true);
      setCallbackPhone('');
    } catch (err) {
      setCallbackError(err instanceof Error ? err.message : copy.validation.genericError);
    } finally {
      setCallbackLoading(false);
    }
  };

  React.useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  const goNext = async () => {
    if (step === 4) {
      setDirection(1);
      setStep(5);
      onStepChange?.(5);
    } else if (step === 5) {
      return;
    } else {
      setDirection(1);
      const next = step + 1;
      setStep(next);
      onStepChange?.(next);
    }
  };

  const goBack = () => {
    setDirection(-1);
    const prev = step - 1;
    setStep(prev);
    onStepChange?.(prev);
    if (step === 5) setHasClickedEnvoyer(false);
  };

  const onSubmit = async (data: EliteFilterData) => {
    console.log('EliteFilter submitted:', data);
    setSubmitError(null);
    try {
      const response = await fetch('/api/elite-filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, website: honeypot }),
      });

      if (!response.ok) {
        throw new Error(copy.alerts.submitError);
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(copy.alerts.retry);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-8"
      >
        <div className="space-y-6 text-center">
          <h3 className="text-2xl font-bold text-white font-display">{copy.success.title}</h3>
          <p className="text-athana-muted leading-relaxed">
            {copy.success.subtitle}
          </p>
          <Link
            to={withLocalePath(locale, '/')}
            className="inline-block px-6 py-3 bg-athana-accent text-black font-bold rounded hover:bg-white transition-colors cursor-pointer"
          >
            {copy.success.backHome}
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <div className="mb-8 p-6 bg-athana-accent/5 border border-athana-accent/30 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-white text-lg font-bold text-center md:text-left">{copy.callback.headline}</p>
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="tel"
              placeholder={copy.callback.placeholder}
              value={callbackPhone}
              onChange={(e) => setCallbackPhone(e.target.value)}
              disabled={callbackSent}
              className="flex-grow px-4 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:border-athana-accent focus:bg-white/10 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleCallbackSubmit}
              disabled={callbackSent || callbackLoading}
              className="px-6 py-2 bg-athana-accent text-black font-bold rounded-md hover:bg-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {callbackSent ? copy.callback.sent : callbackLoading ? copy.callback.sending : copy.callback.cta}
            </button>
          </div>
          {callbackError && <p className="text-red-400 text-sm">{callbackError}</p>}
          {callbackSent && <p className="text-athana-accent text-sm">{copy.callback.doneMessage}</p>}
        </div>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative min-h-[400px]"
        noValidate
      >
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
      <AnimatePresence mode="wait" custom={direction}>
        {step === 1 && (
          <motion.div
            key="step1"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-bold text-white font-display">{copy.steps.s1}</h3>
            <div className="grid gap-4">
              {copy.options.ambition.map((opt) => (
                <motion.button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue('ambition', opt.value)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`flex items-start gap-4 p-4 rounded-lg border text-left transition-all cursor-pointer ${
                    ambition === opt.value
                      ? 'border-athana-accent bg-athana-accent/10 ring-2 ring-athana-accent/50'
                      : 'border-white/10 bg-white/5 hover:border-athana-accent/50'
                  }`}
                >
                  <div>
                    <p className="font-medium text-white">{opt.title}</p>
                    <p className="text-sm text-athana-muted">{opt.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-bold text-white font-display">{copy.steps.s2}</h3>
            <div className="grid gap-4">
              {copy.options.stage.map((opt) => (
                <motion.button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue('stage', opt.value)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`flex items-start gap-4 p-4 rounded-lg border text-left transition-all cursor-pointer ${
                    stage === opt.value
                      ? 'border-athana-accent bg-athana-accent/10 ring-2 ring-athana-accent/50'
                      : 'border-white/10 bg-white/5 hover:border-athana-accent/50'
                  }`}
                >
                  <div>
                    <p className="font-medium text-white">{opt.title}</p>
                    <p className="text-sm text-athana-muted">{opt.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-bold text-white font-display">{copy.steps.s3}</h3>
            <div className="grid gap-4">
              {copy.options.budget.map((opt) => (
                <motion.button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue('budget', opt.value)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`flex flex-col p-4 rounded-lg border text-left transition-all cursor-pointer ${
                    budget === opt.value
                      ? 'border-athana-accent bg-athana-accent/10 ring-2 ring-athana-accent/50'
                      : 'border-white/10 bg-white/5 hover:border-athana-accent/50'
                  }`}
                >
                  <p className="font-bold text-white text-lg">{opt.label}</p>
                  <p className="text-sm text-athana-muted">{opt.desc}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-bold text-white font-display">{copy.steps.s4Title}</h3>
            <p className="text-athana-muted text-sm">{copy.steps.s4Subtitle}</p>
            <div className="space-y-2">
              <textarea
                {...register('vision')}
                rows={5}
                placeholder={copy.steps.s4Placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-athana-accent focus:bg-white/10 transition-all resize-none"
              />
              {errors.vision && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.vision.message}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div
            key="step5"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-bold text-white font-display">{copy.steps.s5}</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-athana-accent uppercase tracking-widest">{copy.form.name}</label>
                <input
                  {...register('name')}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-athana-accent focus:bg-white/10"
                  placeholder={copy.form.namePlaceholder}
                />
                {hasClickedEnvoyer && errors.name && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-athana-accent uppercase tracking-widest">{copy.form.email}</label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-athana-accent focus:bg-white/10"
                  placeholder={copy.form.emailPlaceholder}
                />
                {hasClickedEnvoyer && errors.email && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-athana-accent uppercase tracking-widest">{copy.form.company}</label>
                <input
                  {...register('company')}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-athana-accent focus:bg-white/10"
                  placeholder={copy.form.companyPlaceholder}
                />
                {hasClickedEnvoyer && errors.company && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.company.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-athana-accent uppercase tracking-widest">{copy.form.phone} <span className="text-athana-muted font-normal">{copy.form.optional}</span></label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-athana-accent focus:bg-white/10"
                  placeholder={copy.form.phonePlaceholder}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 1}
          className="flex items-center gap-2 text-athana-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ChevronLeft size={20} />
          {copy.nav.back}
        </button>
        {step < 5 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={(step === 1 && !ambition) || (step === 2 && !stage) || (step === 3 && !budget)}
            className="flex items-center gap-2 px-6 py-3 bg-athana-accent text-black font-bold rounded hover:bg-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copy.nav.next}
            <ChevronRight size={20} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={() => setHasClickedEnvoyer(true)}
            className="flex items-center gap-2 px-6 py-3 bg-athana-accent text-black font-bold rounded hover:bg-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? copy.nav.submitting : copy.nav.submit}
            <Send size={20} />
          </button>
        )}
      </div>
      {submitError && (
        <p className="mt-4 text-sm text-red-400 flex items-center gap-2">
          <AlertCircle size={14} />
          {submitError}
        </p>
      )}
    </form>
    </>
  );
};
