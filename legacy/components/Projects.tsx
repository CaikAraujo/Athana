import React from 'react';
import { Reveal } from './ui/Section';
import { useTranslation } from 'react-i18next';

export const Projects: React.FC = () => {
  const { t, i18n } = useTranslation('projectsPage');
  const localizedProjectsRaw = t('items', { returnObjects: true }) as Array<{
    id: string;
    title: string;
    category: string;
    description: string;
    image: string;
    technologies: string[];
  }>;
  const fallbackProjects = i18n.getResource('fr', 'projectsPage', 'items') as typeof localizedProjectsRaw;
  const localizedProjects = Array.isArray(localizedProjectsRaw) && localizedProjectsRaw.length > 0 ? localizedProjectsRaw : fallbackProjects;

  return (
    <section id="projects" className="py-20 bg-athana-black relative">
      <div className="max-w-7xl mx-auto px-6">


        <div className="space-y-32">
          {localizedProjects.map((project, index) => (
            <Reveal key={project.id} delay={index * 100} className="group">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                {/* Image Section - Left side (or alternating if preferred, but sticking to request for now) */}
                <div className="w-full md:w-1/2 aspect-video relative overflow-hidden rounded-sm border border-white/10 group-hover:border-athana-accent/50 transition-colors duration-500">
                  <div className="absolute inset-0 bg-athana-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 mix-blend-overlay" />
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 filter grayscale group-hover:grayscale-0"
                  />
                </div>

                {/* Content Section - Right side */}
                <div className="w-full md:w-1/2 space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-athana-accent text-sm font-mono font-bold uppercase tracking-wider">
                      {project.category}
                    </span>
                    <div className="h-px bg-white/10 flex-grow" />
                  </div>

                  <h3 className="text-3xl md:text-5xl font-display font-bold text-white leading-tight">
                    {project.title}
                  </h3>

                  <p className="text-athana-muted text-lg leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-athana-text/80"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>


                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};