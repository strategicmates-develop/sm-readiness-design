# Readiness wizard contract

The visual design can change freely. The payload the form sends and the result shape it renders cannot.
Source of truth: `src/readiness/readinessForm.js` (`buildReadinessPayload`, `locateServerField`, `LIMITS`),
`src/readiness/readinessQuestions.js` (option keys) and `src/readiness/readinessFixtures.js` (examples).

## Endpoint

`POST /api/v1/public/assessments/readiness` (public, no auth).

- 200: `{ data: { token, result } }`. The page uses `response.result`.
- 422: `{ message, errors: { 'contact.email': ['...'], 'answers.q05': ['...'], 'simulator.profit_margin_pct': ['...'] } }`. Each path is mapped to a screen/field by `locateServerField`.
- 409: already submitted. 429: throttled. Anything else: generic error.

In this project the call is mocked in `src/api/assessments.js`. Force errors from the console with `window.__smMock = { nextError: 422 }` (or 409, 429, 500).

## Payload (exact body)

Multi-select questions (q06, q09, q12, q18) go as arrays, ordered as the options; the rest as a single key.
`a/b/c/d` are option keys and `u` means "I don't know yet". `hp_website` is a honeypot, always an empty string.
`activity_other` is null unless activity is `other_related`. `jobs_count` is always null; `profit_margin_pct` is null when the user checks "I don't know".

```js
const payload = {
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
```

Limits (`LIMITS` in readinessForm.js): team_size 1..5000, years_operating 0..100, profit_margin_pct 0..100, phone max 30, city max 120, state 2..60, names max 120, business name max 160.

## Result (what the result screen receives)

`readiness` is `ready` or `on_track`. `blocks[].status` is `strong | medium | weak`. `priorities` is empty when `all_strong` is true.
Texts that come as `{ es, en }` are picked by the current language; blocks carry `label`/`label_en` and `area`/`area_en`.

```js
const BLOCKS_RESULT = [
  { key: 'time_team', label: 'Tu tiempo y tu equipo', label_en: 'Your time and your team', area: 'OrganizaciÃ³n y capital humano', area_en: 'Organization and human capital', points: 3, max: 6, percentage: 50.0, status: 'medium' },
  { key: 'work_quality', label: 'Tus trabajos y la calidad', label_en: 'Your jobs and quality', area: 'OperaciÃ³n y calidad', area_en: 'Operations and quality', points: 4, max: 4, percentage: 100.0, status: 'strong' },
  { key: 'money', label: 'El dinero de tu negocio', label_en: "Your business's money", area: 'Finanzas y administraciÃ³n', area_en: 'Finance and administration', points: 1, max: 6, percentage: 17.0, status: 'weak' },
  { key: 'clients_sales', label: 'Tus clientes y tus ventas', label_en: 'Your clients and your sales', area: 'Comercial y marca', area_en: 'Sales and brand', points: 2, max: 2, percentage: 100.0, status: 'strong' },
  { key: 'information', label: 'Tu informaciÃ³n y tus acuerdos', label_en: 'Your information and your agreements', area: 'TecnologÃ­a y coordinaciÃ³n especializada', area_en: 'Technology and specialized coordination', points: 3, max: 6, percentage: 50.0, status: 'medium' },
  { key: 'direction', label: 'El negocio que querÃ©s construir', label_en: 'The business you want to build', area: 'DirecciÃ³n y expansiÃ³n', area_en: 'Direction and expansion', points: 3, max: 6, percentage: 50.0, status: 'medium' },
];

const result = {
  lang: 'es',
  form_version: '2026-10-readiness-v3',
  submitted_at: '2026-10-09T15:00:00Z',
  readiness: 'ready',
  score: 61.9,
  eligible_program: true,
  eligibility_gaps: [],
  blocks: BLOCKS_RESULT,
  strengths: [
    { question: 'q04', text: { es: 'Tu negocio atiende mÃ¡s trabajo sin perder tiempos ni calidad.', en: 'Your business handles more work without losing timing or quality.' } },
    { question: 'q05', text: { es: 'TenÃ©s pasos claros y revisÃ¡s el resultado del trabajo.', en: 'You have clear steps and you check the result of the work.' } },
  ],
  priorities: [
    {
      question: 'q07',
      block: 'money',
      title: { es: 'Tu dinero', en: 'Your money' },
      reading: { es: 'Hoy falta confirmar cuÃ¡nto deja el negocio.', en: 'Today it is still to be confirmed what the business leaves.' },
      help: { es: 'Podemos ordenar la informaciÃ³n y revisar costos, precios y flujo de caja.', en: 'We can organize the information and review costs, prices and cash flow.' },
    },
    {
      question: 'q01',
      block: 'time_team',
      title: { es: 'Tu tiempo', en: 'Your time' },
      reading: { es: 'Hoy necesitÃ¡s seguir pendiente aunque te ausentes.', en: 'Today you need to stay on top of things even when you are away.' },
      help: { es: 'Podemos definir responsabilidades y preparar a una persona para coordinar la operaciÃ³n.', en: 'We can define responsibilities and prepare one person to coordinate the operation.' },
    },
    {
      question: 'q17',
      block: 'direction',
      title: { es: 'Tu expansiÃ³n', en: 'Your expansion' },
      reading: { es: 'La forma de trabajar depende de vos.', en: 'Your way of working depends on you.' },
      help: { es: 'Podemos documentarla y probar su transferencia.', en: 'We can document it and test its transfer.' },
    },
  ],
  unknown: ['q14'],
  follow_up: false,
  all_strong: false,
  concerns: { operation: ['a', 'b'], money: ['a'], sales: ['a'], goals: ['a', 'c'], channel: 'a', openness: 'a' },
  next_step: {
    es: 'EstÃ¡s preparado para el MÃ©todo 180. Te contactamos en 48 horas para una reuniÃ³n de 30 minutos.',
    en: 'You are ready for the 180 Method. We will contact you within 48 hours for a 30-minute meeting.',
  },
};
```

The `on_track` variant (see `READINESS_RESULT_ON_TRACK`) overrides: `readiness: 'on_track'`, `score: 41.0`, `eligible_program: false`,
`eligibility_gaps: ['years_operating', 'revenue']`, `unknown: []`, `follow_up: true`, `concerns.openness: 'b'` and a different `next_step`.