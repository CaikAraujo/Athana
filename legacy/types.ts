export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: 'code' | 'rocket' | 'palette' | 'chart';
}

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  description: string;
  features: PricingFeature[];
  highlight: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  image: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  technologies: string[];
  link?: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: 'search' | 'cpu' | 'terminal' | 'zap';
}

export interface WhyChooseUsItem {
  id: string;
  title: string;
  description: string;
  icon: 'shield' | 'rocket' | 'globe' | 'clock';
}

export enum ProjectType {
  WEB_APP = 'Application Web / SaaS',
  WEBSITE = 'Site Institutionnel',
  LANDING_PAGE = 'Landing Page',
  ECOMMERCE = 'E-commerce',
  OTHER = 'Autre'
}

export enum BudgetRange {
  LOW = 'CHF 1.000 - 3.000',
  MID = 'CHF 3.000 - 8.000',
  HIGH = 'CHF 8.000 - 15.000',
  ENTERPRISE = 'CHF 15.000+',
  UNDECIDED = 'À définir'
}

export interface ClientData {
  name: string;
  email: string;
  company?: string;
  projectType: ProjectType;
  budget?: BudgetRange;
  deadline?: string;
  description: string;
  timestamp: string;
}