export const serviceOptions = [
  'Bioimpedância',
  'Avaliação física',
  'Consultoria de treino',
  'Treino presencial',
  'Treino online',
];

const phoneRegex = /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/;

export function sanitizeText(value) {
  return String(value || '')
    .replace(/[<>]/g, '')
    .trim();
}

export function isValidPhone(phone) {
  return phoneRegex.test(phone.replace(/\s+/g, ' ').trim());
}

export function isPastDate(date) {
  if (!date) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(`${date}T00:00:00`);
  return selected < today;
}

export function validateAppointment(form) {
  const errors = {};

  if (!sanitizeText(form.name)) errors.name = 'Informe seu nome completo.';
  if (!sanitizeText(form.phone)) errors.phone = 'Informe seu WhatsApp.';
  if (form.phone && !isValidPhone(form.phone)) errors.phone = 'Informe um telefone valido com DDD.';
  if (!serviceOptions.includes(form.service)) errors.service = 'Selecione um serviço.';
  if (!form.date) errors.date = 'Escolha uma data.';
  if (form.date && isPastDate(form.date)) errors.date = 'Escolha uma data de hoje em diante.';
  if (!form.time) errors.time = 'Escolha um horário.';
  if (!sanitizeText(form.email)) errors.email = 'Informe seu e-mail.';
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Informe um e-mail válido.';
  }
  return errors;
}
