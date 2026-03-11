'use client';

import React from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import { Reveal } from './ui/Section';

import { useModal } from '../src/context/ModalContext';

export interface TemplateProduct {
    id: string;
    name: string;
    category: string;
    price: string;
    image: string;
    description: string;
    imageGradient: string; // CSS gradient for placeholder
    demoUrl: string;
    features: string[];
}

interface TemplateCardProps {
    template: TemplateProduct;
    index: number;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
    const { openModal } = useModal();
    return (
        <div className="group relative bg-athana-dark/50 border border-white/5 rounded-2xl overflow-hidden hover:border-athana-accent/40 hover:shadow-[0_0_40px_-10px_rgba(0,240,255,0.15)] transition-all duration-500 h-full flex flex-col">
            {/* Image / Preview Placeholder */}
            <div className={`h-48 w-full relative overflow-hidden group-hover:scale-105 transition-transform duration-700`}>
                <img
                    src={template.image}
                    alt={template.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>

            <div className="p-6 flex flex-col flex-1">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-athana-accent transition-colors">{template.name}</h3>
                    <p className="text-athana-muted text-sm line-clamp-2">{template.description}</p>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                    {template.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
                            <Zap size={14} className="text-athana-accent" />
                            {feature}
                        </li>
                    ))}
                </ul>

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5 gap-3">
                    <div className="flex flex-col">
                        <span className="text-2xl font-display font-bold text-white leading-tight">{template.price}</span>
                        <span className="text-[10px] text-athana-accent uppercase tracking-wider font-semibold">
                            Personnalisation Incluse
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <a
                            href={template.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-3 rounded-lg flex items-center gap-2 text-sm transition-all duration-300"
                        >
                            Aperçu
                            <ArrowRight size={14} className="-rotate-45" />
                        </a>
                        <button
                            onClick={() => openModal(`Template: ${template.name}`)}
                            className="bg-white text-black hover:bg-athana-accent font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm transition-all duration-300 cursor-pointer"
                        >
                            Déployer cette base
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface TemplateGalleryProps {
    templates: TemplateProduct[];
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ templates }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template, index) => (
                <Reveal key={template.id} delay={index * 100}>
                    <TemplateCard template={template} index={index} />
                </Reveal>
            ))}
        </div>
    );
};
