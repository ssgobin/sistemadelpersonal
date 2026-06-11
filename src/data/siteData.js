import {
  Activity,
  BarChart3,
  CalendarCheck,
  Dumbbell,
  HeartPulse,
  LineChart,
  Medal,
  Ruler,
  Smartphone,
  Target,
  TrendingUp,
  Users,
  Waves,
  Zap,
} from 'lucide-react';
import heroImage from '../assets/hero-del.svg';
import aboutImage from '../assets/about-del.svg';
import galleryTraining from '../assets/gallery-training.svg';
import galleryBio from '../assets/gallery-bio.svg';

export const images = {
  hero: heroImage,
  about: aboutImage,
  gallery: [
    { src: heroImage, alt: 'Personal trainer Del em destaque' },
    { src: galleryTraining, alt: 'Ambiente de treino funcional' },
    { src: aboutImage, alt: 'Avaliação física personalizada' },
    { src: galleryBio, alt: 'Consulta de bioimpedância' },
  ],
};

export const highlights = [
  { title: 'Atendimento personalizado', text: 'Plano criado para sua rotina, nível atual e objetivo real.', icon: Target },
  { title: 'Resultado acompanhado', text: 'Evolução monitorada com ajustes constantes e metas claras.', icon: TrendingUp },
  { title: 'Bioimpedância', text: 'Análise corporal para treinar com dados, não no chute.', icon: Activity },
  { title: 'Treino individual', text: 'Periodização segura para performance, saúde e consistência.', icon: Dumbbell },
];

export const bioMetrics = [
  { title: 'Percentual de gordura', text: 'Entenda a composição corporal além do peso na balança.', icon: Ruler },
  { title: 'Massa muscular', text: 'Acompanhe ganhos reais de massa magra ao longo do plano.', icon: BarChart3 },
  { title: 'Água corporal', text: 'Indicadores de hidratação que influenciam desempenho e saúde.', icon: Waves },
  { title: 'Metabolismo basal', text: 'Estimativa para orientar estratégia nutricional e treino.', icon: Zap },
  { title: 'Evolução física', text: 'Comparações periódicas para saber o que está funcionando.', icon: LineChart },
];

export const services = [
  {
    title: 'Consultoria de treino',
    description: 'Planejamento tecnico para treinar com autonomia e progressao.',
    icon: CalendarCheck,
  },
  {
    title: 'Avaliação física',
    description: 'Mapeamento inicial para definir metas e acompanhar desempenho.',
    icon: HeartPulse,
  },
  {
    title: 'Bioimpedância',
    description: 'Análise corporal objetiva para orientar decisões com dados.',
    icon: Activity,
  },
  {
    title: 'Acompanhamento presencial',
    description: 'Treinos conduzidos de perto, com correção e intensidade segura.',
    icon: Users,
  },
  {
    title: 'Acompanhamento online',
    description: 'Suporte remoto, ajustes de treino e acompanhamento da rotina.',
    icon: Smartphone,
  },
];

export const testimonials = [
  {
    name: 'Marina Souza',
    goal: 'Hipertrofia',
    text: 'O acompanhamento do Del mudou minha relação com o treino. Hoje tenho clareza, constância e vejo evolução nas medidas.',
  },
  {
    name: 'Rafael Lima',
    goal: 'Emagrecimento',
    text: 'A bioimpedância ajudou a entender o progresso de verdade. O plano foi direto, seguro e muito bem acompanhado.',
  },
  {
    name: 'Camila Torres',
    goal: 'Condicionamento',
    text: 'Treinos objetivos, explicação simples e ajustes semanais. Senti mais energia e disciplina desde o primeiro mês.',
  },
];

export const stats = [
  { value: '8+', label: 'anos de experiência' },
  { value: '500+', label: 'avaliações realizadas' },
  { value: '100%', label: 'treino individualizado' },
  { value: '4.9', label: 'satisfação média' },
];

export const trustBadges = [
  { label: 'Método seguro', icon: Medal },
  { label: 'Dados corporais', icon: Activity },
  { label: 'Plano personalizado', icon: Target },
];
