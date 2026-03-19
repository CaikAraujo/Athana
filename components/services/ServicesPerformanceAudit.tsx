import React from 'react';
import { Reveal } from '../ui/Section';

interface PerformanceCopy {
  badge: string;
  title: string;
  subtitle: string;
  leftTitle: string;
  leftCopy: string;
  bullets: string[];
  websiteLabel: string;
  websitePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  info: string;
  submitIdle: string;
  submitLoading: string;
}

interface ServicesPerformanceAuditProps {
  copy: PerformanceCopy;
  websiteUrl: string;
  setWebsiteUrl: (value: string) => void;
  auditEmail: string;
  setAuditEmail: (value: string) => void;
  isSubmittingAudit: boolean;
  auditFeedback: { type: 'success' | 'error'; message: string } | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export const ServicesPerformanceAudit: React.FC<ServicesPerformanceAuditProps> = ({
  copy,
  websiteUrl,
  setWebsiteUrl,
  auditEmail,
  setAuditEmail,
  isSubmittingAudit,
  auditFeedback,
  onSubmit,
}) => {
  return (
    <section id="performance" className="py-24 border-t border-white/5 scroll-mt-32">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-14 space-y-4">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-blue-500/10 text-blue-300 border border-blue-500/30">
              {copy.badge}
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white">{copy.title}</h2>
            <p className="text-athana-muted text-lg max-w-3xl mx-auto font-light">{copy.subtitle}</p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="rounded-2xl border border-blue-500/30 bg-athana-dark/50 p-6 md:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10">
              <div className="space-y-6">
                <h3 className="text-2xl md:text-3xl font-display font-bold text-white">{copy.leftTitle}</h3>
                <p className="text-athana-muted leading-relaxed">{copy.leftCopy}</p>
                <ul className="space-y-3 text-sm text-gray-300">
                  {copy.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-blue-300"></span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>

              <form onSubmit={onSubmit} className="space-y-5 rounded-xl border border-white/10 bg-white/[0.02] p-6">
                <div>
                  <label htmlFor="website-audit" className="block text-xs font-bold uppercase tracking-widest text-athana-accent mb-2">
                    {copy.websiteLabel}
                  </label>
                  <input
                    id="website-audit"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder={copy.websitePlaceholder}
                    className="w-full bg-white/5 border border-white/10 rounded-sm p-4 text-white focus:outline-none focus:border-blue-400"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email-audit" className="block text-xs font-bold uppercase tracking-widest text-athana-accent mb-2">
                    {copy.emailLabel}
                  </label>
                  <input
                    id="email-audit"
                    type="email"
                    value={auditEmail}
                    onChange={(e) => setAuditEmail(e.target.value)}
                    placeholder={copy.emailPlaceholder}
                    className="w-full bg-white/5 border border-white/10 rounded-sm p-4 text-white focus:outline-none focus:border-blue-400"
                    required
                  />
                </div>

                <p className="text-xs text-athana-muted leading-relaxed">{copy.info}</p>

                {auditFeedback && (
                  <p className={`text-sm ${auditFeedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {auditFeedback.message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingAudit}
                  className="w-full py-4 rounded-lg font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmittingAudit ? copy.submitLoading : copy.submitIdle}
                </button>
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
