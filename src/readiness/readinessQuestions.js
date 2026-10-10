// Content of the readiness assessment (official questionnaire, v2): profile
// options, 6 blocks of 3 questions, the closing `openness` question and the
// simulator block. Option keys (a, b, c, d, u) are exactly what the backend
// expects in `answers`. Scores live on the server; nothing here carries points.
//
// Step counter: "NN / 18" counts only the 18 questions (TOTAL_STEPS). Profile,
// the openness question and the profit screen are not counted.

const opt = (key, es, en) => ({ key, es, en });

// "I don't know yet": 0 points on the server, flagged as `unknown` in the result.
const UNKNOWN_OPTION = { ...opt('u', 'No lo sé todavía', "I don't know yet"), unknown: true };

// Block 0: personal and business data. It is not scored.
export const PROFILE_BLOCK = {
  key: 'profile',
  title: { es: 'Tus datos', en: 'Your details' },
};

// Block 7: the profit percentage, data for the growth calculator. It is not scored.
export const SIMULATE_BLOCK = {
  key: 'simulate',
  title: { es: 'Tu ganancia', en: 'Your profit' },
};

export const BLOCKS = [
  {
    key: 'time_team',
    title: { es: 'Tu tiempo y tu equipo', en: 'Your time and your team' },
    intro: { es: 'Empecemos por lo que hoy depende de vos.', en: "Let's start with what depends on you today." },
    questionIds: ['q01', 'q02', 'q03'],
  },
  {
    key: 'work_quality',
    title: { es: 'Tus trabajos y la calidad', en: 'Your jobs and quality' },
    intro: {
      es: 'Veamos cómo atendés a tus clientes y qué pasa cuando aumenta el trabajo.',
      en: "Let's look at how you serve your clients and what happens when work grows.",
    },
    questionIds: ['q04', 'q05', 'q06'],
  },
  {
    key: 'money',
    title: { es: 'El dinero de tu negocio', en: "Your business's money" },
    intro: {
      es: 'No necesitás tener todas las cuentas resueltas para continuar. Saber qué falta también nos ayuda a intervenir.',
      en: "You don't need every number sorted to continue. Knowing what is missing also helps us step in.",
    },
    questionIds: ['q07', 'q08', 'q09'],
  },
  {
    key: 'clients_sales',
    title: { es: 'Tus clientes y tus ventas', en: 'Your clients and your sales' },
    intro: {
      es: 'Ya tenés clientes. Ahora veamos cómo llegan y cómo aprovechás las oportunidades.',
      en: "You already have clients. Now let's see how they arrive and how you make the most of opportunities.",
    },
    questionIds: ['q10', 'q11', 'q12'],
  },
  {
    key: 'information',
    title: { es: 'Tu información y tus acuerdos', en: 'Your information and your agreements' },
    intro: {
      es: 'La información del negocio debe ayudarte a trabajar y mantenerse bajo tu control.',
      en: "The business's information should help you work and stay under your control.",
    },
    questionIds: ['q13', 'q14', 'q15'],
  },
  {
    key: 'direction',
    title: { es: 'El negocio que querés construir', en: 'The business you want to build' },
    intro: {
      es: 'Pensemos en cómo llevar tu experiencia más allá de lo que podés hacer personalmente.',
      en: "Let's think about taking your experience beyond what you can do personally.",
    },
    questionIds: ['q16', 'q17', 'q18'],
  },
];

const MORE_THAN_ONE = { es: 'Podés elegir más de una', en: 'You can pick more than one' };

export const QUESTIONS = [
  {
    id: 'q01',
    block: 'time_team',
    type: 'single',
    text: { es: 'Si te ausentaras una semana, ¿qué pasaría?', en: 'If you were away for a week, what would happen?' },
    options: [
      opt('a', 'El negocio seguiría y me consultarían algunas cosas', 'The business would keep going and they would check a few things with me'),
      opt('b', 'Tendría que seguir pendiente todos los días', 'I would have to stay on top of it every day'),
      opt('c', 'Se atrasarían trabajos, decisiones o cobros', 'Jobs, decisions or collections would fall behind'),
    ],
  },
  {
    id: 'q02',
    block: 'time_team',
    type: 'single',
    text: { es: '¿Quién organiza los trabajos y resuelve los imprevistos?', en: 'Who organizes the jobs and solves the unexpected?' },
    options: [
      opt('a', 'Una persona del equipo tiene autoridad para hacerlo', 'Someone on the team has the authority to do it'),
      opt('b', 'Lo hacemos entre varias personas, pero suelen volver a mí', 'Several of us do it, but it usually comes back to me'),
      opt('c', 'Yo coordino y resuelvo casi todo', 'I coordinate and solve almost everything'),
    ],
  },
  {
    id: 'q03',
    block: 'time_team',
    type: 'single',
    text: { es: 'Cuando llega alguien nuevo, ¿cómo aprende a trabajar?', en: 'When someone new joins, how do they learn the job?' },
    options: [
      opt('a', 'Tenemos una forma de enseñarle y revisar cómo lo hace', 'We have a way to teach them and check how they do'),
      opt('b', 'Aprende acompañando a otra persona', 'They learn by shadowing someone else'),
      opt('c', 'Yo tengo que enseñarle y supervisarlo casi siempre', 'I have to teach and supervise them almost all the time'),
      opt('d', 'Todavía no incorporé a otras personas', "I haven't brought anyone else in yet"),
    ],
  },
  {
    id: 'q04',
    block: 'work_quality',
    type: 'single',
    text: { es: 'Cuando aceptás más trabajos de lo habitual, ¿qué ocurre?', en: 'When you take on more jobs than usual, what happens?' },
    options: [
      opt('a', 'Podemos atenderlos manteniendo tiempos y calidad', 'We handle them keeping timing and quality'),
      opt('b', 'Necesitamos apoyo y yo tengo que coordinar más', 'We need support and I have to coordinate more'),
      opt('c', 'Se acumulan atrasos o tengo que rechazar trabajos', 'Delays pile up or I have to turn jobs down'),
    ],
  },
  {
    id: 'q05',
    block: 'work_quality',
    type: 'single',
    text: {
      es: '¿Cómo lográs que el trabajo quede bien aunque lo haga otra persona?',
      en: 'How do you make sure the job comes out right even when someone else does it?',
    },
    options: [
      opt('a', 'Tenemos pasos claros y revisamos el resultado', 'We have clear steps and we check the result'),
      opt('b', 'Depende de la experiencia de quien lo haga', 'It depends on the experience of whoever does it'),
      opt('c', 'Tengo que revisar o corregir personalmente', 'I have to check or fix it myself'),
    ],
  },
  {
    id: 'q06',
    block: 'work_quality',
    type: 'multi',
    exclusive: 'd',
    text: { es: '¿Qué te genera más desgaste en la operación?', en: 'What wears you down most in the operation?' },
    hint: MORE_THAN_ONE,
    options: [
      opt('a', 'Coordinar personas, materiales o proveedores', 'Coordinating people, materials or suppliers'),
      opt('b', 'Corregir errores, atrasos o trabajos repetidos', 'Fixing mistakes, delays or redone work'),
      opt('c', 'Resolver cambios y solicitudes de los clientes', 'Handling changes and client requests'),
      opt('d', 'Por ahora, la operación funciona sin mayores dificultades', 'For now, the operation runs without major issues'),
    ],
  },
  {
    id: 'q07',
    block: 'money',
    type: 'single',
    text: {
      es: 'Después de pagar los costos y gastos, ¿sabés cuánto deja el negocio?',
      en: 'After paying costs and expenses, do you know what the business leaves?',
    },
    options: [
      opt('a', 'Sí, lo reviso con información actualizada', 'Yes, I review it with up-to-date information'),
      opt('b', 'Tengo una idea, pero no siempre lo puedo confirmar', "I have an idea, but I can't always confirm it"),
      opt('c', 'No lo sé con claridad o siento que trabajamos mucho y queda poco', "I don't know it clearly, or I feel we work a lot and little is left"),
      UNKNOWN_OPTION,
    ],
  },
  {
    id: 'q08',
    block: 'money',
    type: 'single',
    text: {
      es: '¿Cómo manejás el dinero del negocio y tus gastos personales?',
      en: "How do you handle the business's money and your personal expenses?",
    },
    options: [
      opt('a', 'Están separados y los movimientos quedan registrados', 'They are separate and the movements are recorded'),
      opt('b', 'Tengo cuentas separadas, pero a veces mezclo gastos', 'I have separate accounts, but sometimes I mix expenses'),
      opt('c', 'Los manejo juntos o necesito ayuda para separarlos', 'I handle them together or I need help to separate them'),
      UNKNOWN_OPTION,
    ],
  },
  {
    id: 'q09',
    block: 'money',
    type: 'multi',
    text: { es: '¿Qué te preocupa más del dinero del negocio?', en: "What worries you most about the business's money?" },
    hint: MORE_THAN_ONE,
    options: [
      opt('a', 'Cobrar a tiempo y tener efectivo para operar', 'Getting paid on time and having cash to operate'),
      opt('b', 'Saber si los precios cubren el trabajo y dejan ganancia', 'Knowing if prices cover the work and leave a profit'),
      opt('c', 'Ordenar pagos, deudas, contabilidad e impuestos', 'Getting payments, debts, accounting and taxes in order'),
      opt('d', 'Tengo control y quiero planificar el crecimiento', 'I have control and want to plan for growth'),
    ],
  },
  {
    id: 'q10',
    block: 'clients_sales',
    type: 'single',
    text: { es: '¿Cómo llegan la mayoría de tus nuevos clientes?', en: 'How do most of your new clients arrive?' },
    options: [
      opt('a', 'Recomendaciones y clientes que vuelven', 'Referrals and returning clients'),
      opt('b', 'Publicidad, redes, página web o búsqueda en internet', 'Advertising, social media, website or online search'),
      opt('c', 'Contratos, alianzas o contactos que yo mantengo', 'Contracts, partnerships or contacts that I maintain'),
      opt('d', 'No tengo identificado el canal principal', "I haven't identified the main channel"),
    ],
  },
  {
    id: 'q11',
    block: 'clients_sales',
    type: 'single',
    text: { es: 'Cuando alguien pide una cotización, ¿cómo se da seguimiento?', en: 'When someone asks for a quote, how is it followed up?' },
    options: [
      opt('a', 'Tenemos un registro y alguien se encarga hasta cerrar', 'We keep a record and someone owns it until it closes'),
      opt('b', 'Lo seguimos por mensajes o notas, con algunas omisiones', 'We follow up through messages or notes, with some gaps'),
      opt('c', 'Depende de mí y a veces se pierden oportunidades', 'It depends on me and sometimes opportunities get lost'),
    ],
  },
  {
    id: 'q12',
    block: 'clients_sales',
    type: 'multi',
    text: { es: '¿Qué te gustaría mejorar primero para vender más?', en: 'What would you improve first to sell more?' },
    hint: MORE_THAN_ONE,
    options: [
      opt('a', 'Explicar mejor nuestros servicios y diferenciarnos', 'Explaining our services better and standing out'),
      opt('b', 'Organizar cotizaciones, precios y seguimiento', 'Organizing quotes, prices and follow-up'),
      opt('c', 'Conseguir clientes y trabajos de forma más constante', 'Getting clients and jobs more consistently'),
      opt('d', 'Aprovechar mejor los clientes actuales y sus recomendaciones', 'Making better use of current clients and their referrals'),
    ],
  },
  {
    id: 'q13',
    block: 'information',
    type: 'single',
    text: { es: '¿Dónde guardás clientes, trabajos, cobros y documentos?', en: 'Where do you keep clients, jobs, collections and documents?' },
    options: [
      opt('a', 'En herramientas o carpetas organizadas y accesibles', 'In organized, accessible tools or folders'),
      opt('b', 'En varios archivos, mensajes y aplicaciones', 'In several files, messages and apps'),
      opt('c', 'Principalmente en mi teléfono, mi memoria o con otra persona', 'Mainly on my phone, in my memory or with someone else'),
      UNKNOWN_OPTION,
    ],
  },
  {
    id: 'q14',
    block: 'information',
    type: 'single',
    text: {
      es: 'Si se pierde un teléfono o se va alguien del equipo, ¿podés recuperar la información y los accesos?',
      en: 'If a phone is lost or someone leaves the team, can you recover the information and access?',
    },
    options: [
      opt('a', 'Sí, el negocio conserva accesos y respaldos', 'Yes, the business keeps access and backups'),
      opt('b', 'Podría recuperar una parte, pero tengo pendientes', 'I could recover part of it, but I have pending items'),
      opt('c', 'No estoy seguro o dependemos de esa persona o dispositivo', "I'm not sure, or we depend on that person or device"),
      UNKNOWN_OPTION,
    ],
  },
  {
    id: 'q15',
    block: 'information',
    type: 'single',
    text: {
      es: '¿Cómo llevás contratos, permisos, seguros y obligaciones del negocio?',
      en: "How do you handle the business's contracts, permits, insurance and obligations?",
    },
    options: [
      opt('a', 'Están organizados y revisamos lo que corresponde', 'They are organized and we review what applies'),
      opt('b', 'Tenemos parte resuelta y parte pendiente', 'Part is sorted and part is pending'),
      opt('c', 'Necesito ayuda para saber qué falta y ponerlo en orden', 'I need help to know what is missing and put it in order'),
      UNKNOWN_OPTION,
    ],
  },
  {
    id: 'q16',
    block: 'direction',
    type: 'single',
    text: {
      es: '¿Cómo decidís qué mejorar y comprobás si está funcionando?',
      en: 'How do you decide what to improve and check if it is working?',
    },
    options: [
      opt('a', 'Tenemos objetivos, responsables y revisiones periódicas', 'We have goals, owners and periodic reviews'),
      opt('b', 'Tengo metas, pero el día a día suele desplazar los planes', 'I have goals, but day-to-day work often displaces the plans'),
      opt('c', 'Decido según las urgencias y lo que va pasando', 'I decide based on urgencies and what comes up'),
      UNKNOWN_OPTION,
    ],
  },
  {
    id: 'q17',
    block: 'direction',
    type: 'single',
    text: {
      es: '¿Qué tan preparada está tu forma de trabajar para que otro equipo la use en una nueva ubicación?',
      en: 'How ready is your way of working for another team to use it in a new location?',
    },
    options: [
      opt('a', 'Ya hay una base que podría adaptarse y ponerse a prueba', 'There is already a base that could be adapted and tested'),
      opt('b', 'Hay cosas que funcionan, pero debemos organizarlas y enseñarlas', 'Some things work, but we need to organize and teach them'),
      opt('c', 'Hoy depende mucho de mí y habría que construir esa estructura', 'Today it depends a lot on me and that structure would need to be built'),
      UNKNOWN_OPTION,
    ],
  },
  {
    id: 'q18',
    block: 'direction',
    type: 'multi',
    text: {
      es: 'Si pudieras controlar todo lo anterior, ¿qué te gustaría lograr?',
      en: 'If you could control all of the above, what would you like to achieve?',
    },
    hint: MORE_THAN_ONE,
    options: [
      opt('a', 'Que el negocio funcione con menos dependencia de mí', 'A business that depends less on me'),
      opt('b', 'Tener más control y mejorar sus resultados', 'More control and better results'),
      opt('c', 'Prepararlo para crecer mediante la venta de franquicias', 'Preparing it to grow through franchise sales'),
      opt('d', 'Construir una empresa que pueda continuar y trascender', 'Building a company that can continue and outlast me'),
    ],
  },
];

// Closing question: it does not count in the 18 and it does not score.
export const OPENNESS_QUESTION = {
  id: 'openness',
  block: SIMULATE_BLOCK.key,
  type: 'single',
  text: {
    es: 'Antes de simular: ¿estás abierto a trabajar con SM en la transformación de tu negocio?',
    en: 'Before simulating: are you open to working with SM on transforming your business?',
  },
  options: [
    opt('a', 'Sí, quiero conocer cómo avanzar', 'Yes, I want to know how to move forward'),
    opt('b', 'Quiero conversar primero para entender el proceso', 'I want to talk first to understand the process'),
  ],
};

export const QUESTIONS_BY_ID = Object.fromEntries(
  [...QUESTIONS, OPENNESS_QUESTION].map((question) => [question.id, question]),
);

export const BLOCKS_BY_KEY = Object.fromEntries(
  [PROFILE_BLOCK, ...BLOCKS, SIMULATE_BLOCK].map((block) => [block.key, block]),
);

// Profile choice lists (values are the ones the server validates).
export const ACTIVITY_OPTIONS = [
  opt('construction', 'Construcción', 'Construction'),
  opt('remodeling', 'Remodelación', 'Remodeling'),
  opt('installations_repairs', 'Instalaciones y reparaciones', 'Installations and repairs'),
  opt('maintenance', 'Mantenimiento', 'Maintenance'),
  opt('cleaning', 'Limpieza', 'Cleaning'),
  opt('other_related', 'Otra relacionada', 'Other related'),
];

export const OTHER_ACTIVITY_KEY = 'other_related';

// Sales of the last 12 months as a range; the server derives the amount from the key.
export const REVENUE_RANGE_OPTIONS = [
  opt('lt_250k', 'Menos de 250.000', 'Under 250,000'),
  opt('250k_500k', '250.000 a 500.000', '250,000 to 500,000'),
  opt('500k_750k', '500.000 a 750.000', '500,000 to 750,000'),
  opt('750k_1m', '750.000 a 1 millón', '750,000 to 1 million'),
  opt('1m_2m', '1 a 2 millones', '1 to 2 million'),
  opt('gt_2m', 'Más de 2 millones', 'Over 2 million'),
];

export const REVENUE_CONFIDENCE_OPTIONS = [
  opt('confirmed', 'Confirmado', 'Confirmed'),
  opt('estimated', 'Estimado', 'Estimated'),
  opt('needs_review', 'Necesito revisarlo', 'I need to review it'),
];

export const HISPANIC_OPTIONS = [
  opt('yes', 'Sí', 'Yes'),
  opt('no', 'No', 'No'),
  opt('talk', 'Prefiero conversarlo', 'I prefer to talk about it'),
];

// Counter total: only the 18 questions count.
export const TOTAL_STEPS = QUESTIONS.length;
