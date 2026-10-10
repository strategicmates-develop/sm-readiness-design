// Test fixtures shaped like the readiness contract (POST /public/assessments/readiness).

const BLOCKS_RESULT = [
  { key: 'time_team', label: 'Tu tiempo y tu equipo', label_en: 'Your time and your team', area: 'Organización y capital humano', area_en: 'Organization and human capital', points: 3, max: 6, percentage: 50.0, status: 'medium' },
  { key: 'work_quality', label: 'Tus trabajos y la calidad', label_en: 'Your jobs and quality', area: 'Operación y calidad', area_en: 'Operations and quality', points: 4, max: 4, percentage: 100.0, status: 'strong' },
  { key: 'money', label: 'El dinero de tu negocio', label_en: "Your business's money", area: 'Finanzas y administración', area_en: 'Finance and administration', points: 1, max: 6, percentage: 17.0, status: 'weak' },
  { key: 'clients_sales', label: 'Tus clientes y tus ventas', label_en: 'Your clients and your sales', area: 'Comercial y marca', area_en: 'Sales and brand', points: 2, max: 2, percentage: 100.0, status: 'strong' },
  { key: 'information', label: 'Tu información y tus acuerdos', label_en: 'Your information and your agreements', area: 'Tecnología y coordinación especializada', area_en: 'Technology and specialized coordination', points: 3, max: 6, percentage: 50.0, status: 'medium' },
  { key: 'direction', label: 'El negocio que querés construir', label_en: 'The business you want to build', area: 'Dirección y expansión', area_en: 'Direction and expansion', points: 3, max: 6, percentage: 50.0, status: 'medium' },
];

export const READINESS_RESULT_READY = {
  lang: 'es',
  form_version: '2026-10-readiness-v3',
  submitted_at: '2026-10-09T15:00:00Z',
  readiness: 'ready',
  score: 61.9,
  eligible_program: true,
  eligibility_gaps: [],
  blocks: BLOCKS_RESULT,
  strengths: [
    { question: 'q04', text: { es: 'Tu negocio atiende más trabajo sin perder tiempos ni calidad.', en: 'Your business handles more work without losing timing or quality.' } },
    { question: 'q05', text: { es: 'Tenés pasos claros y revisás el resultado del trabajo.', en: 'You have clear steps and you check the result of the work.' } },
  ],
  priorities: [
    {
      question: 'q07',
      block: 'money',
      title: { es: 'Tu dinero', en: 'Your money' },
      reading: { es: 'Hoy falta confirmar cuánto deja el negocio.', en: 'Today it is still to be confirmed what the business leaves.' },
      help: { es: 'Podemos ordenar la información y revisar costos, precios y flujo de caja.', en: 'We can organize the information and review costs, prices and cash flow.' },
    },
    {
      question: 'q01',
      block: 'time_team',
      title: { es: 'Tu tiempo', en: 'Your time' },
      reading: { es: 'Hoy necesitás seguir pendiente aunque te ausentes.', en: 'Today you need to stay on top of things even when you are away.' },
      help: { es: 'Podemos definir responsabilidades y preparar a una persona para coordinar la operación.', en: 'We can define responsibilities and prepare one person to coordinate the operation.' },
    },
    {
      question: 'q17',
      block: 'direction',
      title: { es: 'Tu expansión', en: 'Your expansion' },
      reading: { es: 'La forma de trabajar depende de vos.', en: 'Your way of working depends on you.' },
      help: { es: 'Podemos documentarla y probar su transferencia.', en: 'We can document it and test its transfer.' },
    },
  ],
  unknown: ['q14'],
  follow_up: false,
  all_strong: false,
  concerns: { operation: ['a', 'b'], money: ['a'], sales: ['a'], goals: ['a', 'c'], channel: 'a', openness: 'a' },
  next_step: {
    es: 'Estás preparado para el Método 180. Te contactamos en 48 horas para una reunión de 30 minutos.',
    en: 'You are ready for the 180 Method. We will contact you within 48 hours for a 30-minute meeting.',
  },
};

export const READINESS_RESULT_ON_TRACK = {
  ...READINESS_RESULT_READY,
  readiness: 'on_track',
  score: 41.0,
  eligible_program: false,
  eligibility_gaps: ['years_operating', 'revenue'],
  unknown: [],
  follow_up: true,
  concerns: { ...READINESS_RESULT_READY.concerns, openness: 'b' },
  next_step: {
    es: 'Ya estás en camino. Te mandamos este diagnóstico y te proponemos por dónde empezar.',
    en: 'You are on your way. We will send you this diagnosis and suggest where to start.',
  },
};

// Everything answered with the best option: no priorities.
export const READINESS_RESULT_ALL_STRONG = {
  ...READINESS_RESULT_READY,
  score: 100,
  priorities: [],
  all_strong: true,
  unknown: [],
};

// Answers of the example payload (q06 / q09 / q12 / q18 are multi).
export const CONTRACT_ANSWERS = {
  q01: 'b', q02: 'c', q03: 'a', q04: 'b', q05: 'b', q06: ['a', 'b'], q07: 'b', q08: 'b', q09: ['a', 'b'],
  q10: 'a', q11: 'c', q12: ['a'], q13: 'b', q14: 'c', q15: 'a', q16: 'b', q17: 'b', q18: ['a', 'c'],
  openness: 'a',
};

export const CONTRACT_PAYLOAD = {
  lang: 'es',
  hp_website: '',
  contact: {
    first_name: 'Daniel',
    last_name: 'Vossler',
    city: 'Orlando',
    state: 'FL',
    email: 'd@x.com',
    phone: '+1 407 555 0188',
    hispanic_owner: 'yes',
  },
  business: {
    name: 'Vossler Construction',
    activity: 'construction',
    activity_other: null,
    revenue_range: '250k_500k',
    revenue_confidence: 'confirmed',
    has_active_clients: true,
    team_size: 8,
    years_operating: 6,
  },
  answers: CONTRACT_ANSWERS,
  simulator: { jobs_count: null, profit_margin_pct: 25 },
};
