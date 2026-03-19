import React from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '../ui/Section';

interface ResourceCard {
  title: string;
  description: string;
}

interface ServicesResourcesGridProps {
  title: string;
  accent: string;
  subtitle: string;
  cards: ResourceCard[];
  toLocalePath: (path: string) => string;
}

export const ServicesResourcesGrid: React.FC<ServicesResourcesGridProps> = ({
  title,
  accent,
  subtitle,
  cards,
  toLocalePath,
}) => {
  return (
    <section className="py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              {title} <span className="text-athana-accent">{accent}</span>
            </h2>
            <p className="text-athana-muted max-w-2xl mx-auto">{subtitle}</p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to={toLocalePath('/services/developpement-web-sur-mesure-geneve')} className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
            <h3 className="text-white font-bold mb-2">{cards[0]?.title}</h3>
            <p className="text-sm text-athana-muted">{cards[0]?.description}</p>
          </Link>
          <Link to={toLocalePath('/services/integration-odoo-erp-geneve')} className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
            <h3 className="text-white font-bold mb-2">{cards[1]?.title}</h3>
            <p className="text-sm text-athana-muted">{cards[1]?.description}</p>
          </Link>
          <Link to={toLocalePath('/services/application-web-securisee-suisse')} className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
            <h3 className="text-white font-bold mb-2">{cards[2]?.title}</h3>
            <p className="text-sm text-athana-muted">{cards[2]?.description}</p>
          </Link>
        </div>
      </div>
    </section>
  );
};
