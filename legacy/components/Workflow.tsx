'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Search, Cpu, Terminal, Zap } from 'lucide-react';
import { WORKFLOW_STEPS } from '../constants';
import { Reveal } from './ui/Section';

const iconMap = {
    search: Search,
    cpu: Cpu,
    terminal: Terminal,
    zap: Zap,
};

export const Workflow: React.FC = () => {
    const [activeStep, setActiveStep] = useState(0); // 0 = nenhum, 1 = primeiro, etc.
    const [progressWidth, setProgressWidth] = useState(0);
    const sectionRef = useRef<HTMLDivElement>(null);
    const [hasStarted, setHasStarted] = useState(false);

    // Ref para guardar os timeouts e limpar se o componente desmontar
    const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

    // Limpa timeouts ao desmontar
    useEffect(() => {
        return () => {
            timeoutsRef.current.forEach(clearTimeout);
        };
    }, []);

    const startAnimationLoop = () => {
        // Garante que não há timeouts antigos rodando
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];

        // Definição dos passos da animação
        // delay: tempo absoluto desde o início do loop
        const steps = [
            { width: 14, stepIndex: 1, delay: 100 },
            { width: 40, stepIndex: 2, delay: 1300 },
            { width: 66, stepIndex: 3, delay: 2500 },
            { width: 92, stepIndex: 4, delay: 3700 },
            { width: 100, stepIndex: 5, delay: 4900 }
        ];

        // Agenda os movimentos da linha e ativação dos nós
        steps.forEach(({ width, stepIndex, delay }) => {
            // Movimento da Linha
            const t1 = setTimeout(() => {
                setProgressWidth(width);
            }, delay);
            timeoutsRef.current.push(t1);

            // Ativação do Nó (sync visual quando a linha chega)
            const t2 = setTimeout(() => {
                if (stepIndex <= 4) setActiveStep(stepIndex);
            }, delay + 800);
            timeoutsRef.current.push(t2);
        });

        // Agenda o Reset e Reinício
        // O último passo ocorre em 4900ms. A transição CSS demora 1000ms.
        // Total animação ~ 6000ms.
        // Pausa de 5000ms solicitada.
        // Tempo total antes do reset = 6000 + 5000 = 11000ms.

        const cycleEndTime = 11000;

        const tReset = setTimeout(() => {
            // Reseta tudo para 0
            setActiveStep(0);
            setProgressWidth(0);
        }, cycleEndTime);
        timeoutsRef.current.push(tReset);

        const tRestart = setTimeout(() => {
            // Reinicia o loop (tempo para a transição de reset terminar + pequena margem)
            startAnimationLoop();
        }, cycleEndTime + 1200);
        timeoutsRef.current.push(tRestart);
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasStarted) {
                    setHasStarted(true);
                    startAnimationLoop();
                }
            },
            { threshold: 0.3 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, [hasStarted]);

    return (
        <section ref={sectionRef} className="py-32 bg-athana-black relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.05] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <Reveal className="mb-24 text-center">
                    <span className="text-athana-accent font-mono text-sm tracking-[0.2em] uppercase block mb-4">
                        Processus
                    </span>
                    <h2 className="font-display text-4xl md:text-6xl font-bold text-white">
                        Processus <span className="text-athana-accent">Athana.</span>
                    </h2>
                </Reveal>

                <div className="relative mt-20">
                    {/* Main Connecting Line Container (Desktop) */}
                    <div className="hidden md:block absolute top-[60px] left-0 w-full h-[1px] bg-white/10 z-0">
                        {/* Animated Progress Line */}
                        <div
                            className="h-full bg-athana-accent shadow-[0_0_15px_rgba(0,240,255,0.8)] transition-all ease-in-out"
                            style={{
                                width: `${progressWidth}%`,
                                transitionDuration: '1000ms'
                            }}
                        ></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                        {WORKFLOW_STEPS.map((step, index) => {
                            const Icon = iconMap[step.icon as keyof typeof iconMap];
                            const stepNumber = index + 1;
                            const isActive = activeStep >= stepNumber;

                            return (
                                <Reveal key={step.id} delay={index * 200} className="relative group">
                                    <div className="flex flex-col items-center text-center">

                                        {/* The Node Container */}
                                        <div className="relative mb-8 cursor-pointer">
                                            {/* Glow Effect behind circle */}
                                            <div className={`absolute inset-0 bg-athana-accent/20 rounded-full blur-xl transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>

                                            {/* Main Circle */}
                                            <div className={`w-[120px] h-[120px] bg-athana-black rounded-full border flex items-center justify-center relative z-10 transition-all duration-500
                        ${isActive
                                                    ? 'border-athana-accent scale-110 shadow-[0_0_30px_rgba(0,240,255,0.2)]'
                                                    : 'border-white/10 group-hover:border-athana-accent group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,240,255,0.2)]'
                                                }`}>

                                                {/* Inner Ring (Decorative) */}
                                                <div className={`absolute inset-2 rounded-full border border-dashed transition-all duration-700
                          ${isActive
                                                        ? 'border-athana-accent/30 rotate-90'
                                                        : 'border-white/5 group-hover:border-athana-accent/30 group-hover:rotate-90'
                                                    }`}></div>

                                                <Icon
                                                    className={`w-10 h-10 transition-colors duration-300 ${isActive ? 'text-athana-accent' : 'text-white group-hover:text-athana-accent'}`}
                                                    strokeWidth={1.5}
                                                />
                                            </div>

                                            {/* Orbiting Number Badge */}
                                            <div className={`absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-10 h-10 rounded-full border flex items-center justify-center z-20 transition-all duration-300
                        ${isActive
                                                    ? 'bg-athana-accent border-athana-accent text-black'
                                                    : 'bg-athana-dark border-white/10 text-athana-muted group-hover:border-athana-accent group-hover:bg-athana-accent group-hover:text-black'
                                                }`}>
                                                <span className="font-mono text-xs font-bold">{step.id}</span>
                                            </div>
                                        </div>

                                        {/* Text Content */}
                                        <div className="px-4">
                                            <h3 className={`font-display text-xl font-bold mb-3 transition-colors duration-300 ${isActive ? 'text-athana-accent' : 'text-white group-hover:text-athana-accent'}`}>
                                                {step.title}
                                            </h3>
                                            <p className="text-sm text-athana-muted leading-relaxed font-light">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};
