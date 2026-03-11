import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, Terminal } from 'lucide-react';
import { EliteFilterForm } from '../../components/EliteFilterForm';

const TOTAL_STEPS = 5;

export default function Demarrer() {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="min-h-screen bg-athana-black">
      <Helmet>
        <title>Démarrer un Projet | ATHANA</title>
        <meta name="description" content="Consultation stratégique pour votre projet digital. Décrivez votre ambition et organisez un premier échange avec l'équipe Athana." />
      </Helmet>

      {/* Header */}
      <header className="border-b border-white/10 bg-athana-black/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-athana-muted hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft size={20} />
            Retour
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-athana-accent/10 rounded-lg text-athana-accent">
              <Terminal size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white font-display">Démarrer un Projet</h1>
              <p className="text-xs text-athana-accent uppercase tracking-wider font-mono">Consultation stratégique</p>
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
          aria-label={`Étape ${currentStep} sur ${TOTAL_STEPS}`}
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
