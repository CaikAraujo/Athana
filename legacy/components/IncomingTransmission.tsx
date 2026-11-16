import React from 'react';
import { ClientData } from '../types';
import { Mail, MessageCircle, Calendar, DollarSign, Briefcase, ExternalLink } from 'lucide-react';

interface IncomingTransmissionProps {
    data: ClientData;
}

export const IncomingTransmission: React.FC<IncomingTransmissionProps> = ({ data }) => {
    return (
        <div className="w-full max-w-2xl transform transition-all duration-700">

            {/* Context Label */}
            <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/50 mb-3 backdrop-blur-md">
                    <div className="w-2 h-2 rounded-full bg-neon-purple animate-pulse"></div>
                    <span className="text-xs font-mono text-neon-purple tracking-wider uppercase">Visualisation de l'Email (Boîte de réception)</span>
                </div>
            </div>

            {/* The Email Card Container */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 relative">

                {/* Decorative Top Bar for Email Client feel */}
                <div className="h-2 w-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink"></div>

                {/* Email Header - Athana Brand Identity */}
                <div className="relative bg-[#050510] p-8 overflow-hidden text-center">

                    {/* Abstract Cyber Background in Header */}
                    <div className="absolute inset-0 opacity-30 pointer-events-none">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-purple blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
                        {/* Note: transparenttextures pattern ignored for simplicity unless asset added */}
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-white/10 to-transparent border border-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur shadow-lg">
                            <Mail className="text-white drop-shadow-[0_0_10px_rgba(0,243,255,0.8)]" size={32} />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-wide mb-1">
                            Nouvelle Demande
                        </h1>
                        <p className="text-neon-blue font-mono text-xs uppercase tracking-[0.2em]">
                            Système Athana • Lead Qualifié
                        </p>
                    </div>
                </div>

                {/* Email Body */}
                <div className="p-8 md:p-10 bg-white text-gray-800">

                    {/* Client Info Section */}
                    <div className="flex flex-col md:flex-row gap-6 pb-8 border-b border-gray-100 items-start md:items-center">
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Client</label>
                            <h3 className="text-2xl font-bold text-gray-900">{data.name}</h3>
                            {data.company && <p className="text-sm text-gray-500 font-medium">{data.company}</p>}
                        </div>
                        <div className="flex-1 md:text-right">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Email de Contact</label>
                            <a href={`mailto:${data.email}`} className="text-neon-purple font-medium text-lg hover:text-neon-pink transition-colors break-all">
                                {data.email}
                            </a>
                        </div>
                    </div>

                    {/* Project Details Grid */}
                    <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 hover:border-neon-blue/30 transition-colors group">
                            <div className="flex items-center gap-2 mb-2 text-neon-blue">
                                <Briefcase size={18} />
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:text-neon-blue transition-colors">Service</span>
                            </div>
                            <p className="font-bold text-gray-800 text-sm">{data.projectType}</p>
                        </div>
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 hover:border-neon-pink/30 transition-colors group">
                            <div className="flex items-center gap-2 mb-2 text-neon-pink">
                                <DollarSign size={18} />
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:text-neon-pink transition-colors">Budget</span>
                            </div>
                            <p className="font-bold text-gray-800 text-sm">{data.budget}</p>
                        </div>
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 hover:border-neon-purple/30 transition-colors group">
                            <div className="flex items-center gap-2 mb-2 text-neon-purple">
                                <Calendar size={18} />
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:text-neon-purple transition-colors">Délai</span>
                            </div>
                            <p className="font-bold text-gray-800 text-sm">{data.deadline || "N/A"}</p>
                        </div>
                    </div>

                    {/* Message Section */}
                    <div className="mb-10">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Description du Projet</label>
                        <div className="bg-[#f8f9fa] p-6 rounded-lg border-l-4 border-neon-blue text-gray-700 leading-relaxed text-lg font-light italic relative">
                            <span className="absolute top-2 left-2 text-4xl text-gray-200 font-serif leading-none">"</span>
                            {data.description}
                            <span className="absolute bottom-[-10px] right-4 text-4xl text-gray-200 font-serif leading-none">"</span>
                        </div>
                    </div>

                    {/* Footer Actions (Simulation) */}
                    <div className="flex flex-col gap-3">
                        <button className="w-full bg-[#1a1a1a] hover:bg-black text-white px-6 py-4 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-3 group cursor-pointer">
                            <Mail size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                            <span>Répondre à {data.name.split(' ')[0]}</span>
                            <ExternalLink size={14} className="opacity-50 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-4 rounded-lg font-bold shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-3 cursor-pointer">
                            <MessageCircle size={18} />
                            <span>Démarrer la conversation sur WhatsApp</span>
                        </button>
                    </div>

                    {/* Footer Meta */}
                    <div className="mt-8 pt-6 border-t border-gray-100 text-center flex justify-between items-center text-xs text-gray-400 font-mono">
                        <span>{data.timestamp}</span>
                        <span>ID: {Math.floor(Math.random() * 99999).toString().padStart(5, '0')}</span>
                    </div>

                </div>
            </div>
        </div>
    );
};
