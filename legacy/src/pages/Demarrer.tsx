import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, Terminal } from 'lucide-react';
import { EliteFilterForm } from '../../components/EliteFilterForm';
import { DEFAULT_LOCALE, isLocale, withLocalePath } from '../i18n/routing';
import { useTranslation } from 'react-i18next';

const TOTAL_STEPS = 5;

export default function Demarrer() {
  const [currentStep, setCurrentStep] = useState(1);
  const { lang } = useParams();
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const { t } = useTranslation('demarrerPage');

  return (
    <div className="min-h-screen bg-athana-black">
      <Helmet>
        <title>{t('title')}</title>
        <meta name="description" content={t('description')} />
      </Helmet>

      {/* Header */}
      <header className="border-b border-white/10 bg-athana-black/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to={withLocalePath(locale, '/')}
            className="flex items-center gap-2 text-athana-muted hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft size={20} />
            {t('back')}
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-athana-accent/10 rounded-lg text-athana-accent">
              <Terminal size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white font-display">{t('heading')}</h1>
              <p className="text-xs text-athana-accent uppercase tracking-wider font-mono">{t('subtitle')}</p>
            </div>
          </div>
          <div className="w-20" aria-hidden="true" />
        </div>

        {/* Progress bar */}
        <div
          className="h-1 bg-white/5"
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-label={t('progressAria', { current: currentStep, total: TOTAL_STEPS })}
        >
          <div
            className="h-full bg-athana-accent transition-all duration-300"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </header>

      {/* Form content */}
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <EliteFilterForm onStepChange={setCurrentStep} />
      </main>
    </div>
  );
}
