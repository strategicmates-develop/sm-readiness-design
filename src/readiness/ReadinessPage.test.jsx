/**
 * @vitest-environment jsdom
 *
 * Readiness wizard: intro, profile validation, one question per screen with
 * counter, exclusive q06 option, draft, profit screen with "I don't know", submission with the exact contract payload and server
 * failures (422 / 409 / 429). The API module is mocked.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('../api/assessments', () => ({ assessmentsApi: { submitReadiness: vi.fn() } }));

import { assessmentsApi } from '../api/assessments';
import ReadinessPage from './ReadinessPage';
import { OPENNESS_QUESTION, QUESTIONS, QUESTIONS_BY_ID } from './readinessQuestions';
import { FLOW } from './readinessForm';
import { CONTRACT_ANSWERS, CONTRACT_PAYLOAD, READINESS_RESULT_READY } from './readinessFixtures';
import { httpError } from '../shared/testFixtures';

// A full walk crosses 19 auto-advancing questions (300 ms each).
vi.setConfig({ testTimeout: 30000 });

const SIMULATE_TITLE = 'Tu ganancia';
const click = (name) => fireEvent.click(screen.getByRole('button', { name }));
const field = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const counter = () => screen.getByTestId('step-counter').textContent;
const questionTitle = (id, lang = 'es') => QUESTIONS_BY_ID[id].text[lang];
const optionLabel = (id, key, lang = 'es') => QUESTIONS_BY_ID[id].options.find((option) => option.key === key)[lang];
const headingOf = (screenId) => (screenId === 'simulate' ? SIMULATE_TITLE : questionTitle(screenId));

// The city is picked from the search suggestions ("Orlando, FL"), which also sets the state.
async function pickCity(search = 'Orl', suggestion = 'Orlando, FL') {
  field('Ciudad', search);
  fireEvent.click(await screen.findByRole('option', { name: suggestion }));
}

async function fillContact(overrides = {}) {
  const values = { first: 'Daniel', last: 'Vossler', business: 'Vossler Construction', email: 'd@x.com', phone: '+1 407 555 0188', ...overrides };
  field('Nombre', values.first);
  field('Apellido', values.last);
  field('Nombre del negocio', values.business);
  await pickCity();
  field('Email', values.email);
  field('Teléfono', values.phone);
  fireEvent.click(screen.getByRole('radio', { name: 'Sí' }));
}

function fillBusiness() {
  field('Actividad principal', 'construction');
  fireEvent.click(screen.getByRole('radio', { name: '250.000 a 500.000' }));
  fireEvent.click(screen.getByRole('radio', { name: 'Confirmado' }));
  fireEvent.click(screen.getByRole('radio', { name: 'Sí' }));
  field(/Personas que trabajan/, '8');
  field(/Hace cuántos años/, '6');
}

// Answers one screen of the flow and waits for the one that follows.
async function answerQuestion(id, keys) {
  const question = QUESTIONS_BY_ID[id];
  [].concat(keys).forEach((key) => {
    fireEvent.click(screen.getByRole(question.type === 'multi' ? 'checkbox' : 'radio', { name: optionLabel(id, key) }));
  });
  if (question.type === 'multi') click(/Continuar/);

  await screen.findByRole('heading', { name: headingOf(FLOW[FLOW.indexOf(id) + 1]) });
}

async function goToQuestions() {
  click('Conocer las posibilidades de mi negocio');
  await fillContact();
  click(/Continuar/);
  fillBusiness();
  click(/Continuar/);
  await screen.findByRole('heading', { name: questionTitle('q01') });
}

async function goToSimulator() {
  await goToQuestions();
  for (const question of [...QUESTIONS, OPENNESS_QUESTION]) {
    await answerQuestion(question.id, CONTRACT_ANSWERS[question.id]);
  }
}

function fillSimulator() {
  field(/porcentaje/, '25');
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  window.scrollTo = vi.fn();
});

describe('ReadinessPage intro and profile', () => {
  it('shows the intro in Spanish by default and switches language', () => {
    render(<ReadinessPage />);

    expect(screen.getByRole('heading', { name: 'Descubrí cómo puede crecer tu negocio' })).toBeInTheDocument();
    expect(screen.getByText('Ahora vas a responder 18 preguntas cortas, organizadas en seis bloques.')).toBeInTheDocument();
    click('EN');
    expect(screen.getByRole('heading', { name: 'Discover how your business can grow' })).toBeInTheDocument();
    expect(localStorage.getItem('sm_assessment_lang')).toBe('en');
  });

  it('blocks the contact screen until every field is valid, without a counter or a state input', async () => {
    render(<ReadinessPage />);
    click('Conocer las posibilidades de mi negocio');

    expect(screen.queryByTestId('step-counter')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Estado')).not.toBeInTheDocument();
    expect(screen.getByText('Datos de ciudades: GeoNames (CC BY 4.0)')).toBeInTheDocument();
    click(/Continuar/);
    expect(screen.getAllByText('Completá este dato.').length).toBe(6);
    expect(screen.getByText('Elegí una opción.')).toBeInTheDocument();

    await fillContact({ email: 'not-an-email' });
    click(/Continuar/);
    expect(screen.getByText('Revisá el formato del email.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Empecemos por conocerte' })).toBeInTheDocument();
  });

  it('offers yes, no and "prefer to talk" for the Hispanic owner question', () => {
    render(<ReadinessPage />);
    click('Conocer las posibilidades de mi negocio');

    ['Sí', 'No', 'Prefiero conversarlo'].forEach((name) => expect(screen.getByRole('radio', { name })).toBeInTheDocument());
  });

  it('asks for the state only when the typed city is not in the list', async () => {
    render(<ReadinessPage />);
    click('Conocer las posibilidades de mi negocio');
    field('Nombre', 'Ana');
    field('Ciudad', 'Zzyzx');
    fireEvent.click(await screen.findByRole('option', { name: /Usar «Zzyzx»/ }));
    expect(screen.getByLabelText('Estado')).toBeInTheDocument();
    click(/Continuar/);
    expect(screen.getByText('Elegí el estado.')).toBeInTheDocument();
  });

  it('asks for the activity detail only when the activity is other_related', async () => {
    render(<ReadinessPage />);
    click('Conocer las posibilidades de mi negocio');
    await fillContact();
    click(/Continuar/);

    expect(screen.queryByLabelText('¿Cuál es tu actividad?')).not.toBeInTheDocument();
    field('Actividad principal', 'other_related');
    expect(screen.getByLabelText('¿Cuál es tu actividad?')).toBeInTheDocument();
    click(/Continuar/);
    expect(screen.getByText('Completá este dato.')).toBeInTheDocument();
  });

  it('offers "I need to review it" as revenue confidence and validates the team size', async () => {
    render(<ReadinessPage />);
    click('Conocer las posibilidades de mi negocio');
    await fillContact();
    click(/Continuar/);

    expect(screen.getByRole('radio', { name: 'Necesito revisarlo' })).toBeInTheDocument();
    click(/Continuar/);
    expect(screen.getByText('Ingresá un número entero entre 1 y 5.000.')).toBeInTheDocument();
  });

  it('goes back from the first profile screen to the intro', () => {
    render(<ReadinessPage />);
    click('Conocer las posibilidades de mi negocio');
    click(/Atrás/);
    expect(screen.getByRole('heading', { name: 'Descubrí cómo puede crecer tu negocio' })).toBeInTheDocument();
  });
});

describe('ReadinessPage questions', () => {
  it('advances a single question by itself, counts only the questions and names the block', async () => {
    render(<ReadinessPage />);
    await goToQuestions();

    expect(counter()).toBe('01 / 18');
    expect(screen.getByText('Tu tiempo y tu equipo · Pregunta 1 de 3')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: optionLabel('q01', 'b') }));
    expect(screen.getByRole('radio', { name: optionLabel('q01', 'b') })).toHaveAttribute('aria-checked', 'true');
    await screen.findByRole('heading', { name: questionTitle('q02') });
    expect(counter()).toBe('02 / 18');
    expect(screen.getByText('Tu tiempo y tu equipo · Pregunta 2 de 3')).toBeInTheDocument();
  });

  it('goes straight from the last question of a block to the first of the next, with no help screen', async () => {
    render(<ReadinessPage />);
    await goToQuestions();
    await answerQuestion('q01', 'a');
    await answerQuestion('q02', 'a');
    fireEvent.click(screen.getByRole('radio', { name: optionLabel('q03', 'a') }));

    await screen.findByRole('heading', { name: questionTitle('q04') });
    expect(screen.queryByText('Cómo podemos ayudarte')).not.toBeInTheDocument();
    expect(counter()).toBe('04 / 18');
    expect(screen.getByText('Tus trabajos y la calidad · Pregunta 1 de 3')).toBeInTheDocument();
  });

  it('keeps multi questions until Continue, and requires one option', async () => {
    render(<ReadinessPage />);
    await goToQuestions();
    for (const id of ['q01', 'q02', 'q03', 'q04', 'q05']) {
      await answerQuestion(id, CONTRACT_ANSWERS[id]);
    }

    expect(counter()).toBe('06 / 18');
    click(/Continuar/);
    expect(screen.getByText('Elegí al menos una opción para continuar.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: optionLabel('q06', 'a') }));
    fireEvent.click(screen.getByRole('checkbox', { name: optionLabel('q06', 'b') }));
    expect(screen.getByRole('heading', { name: questionTitle('q06') })).toBeInTheDocument();
    click(/Continuar/);
    await screen.findByRole('heading', { name: questionTitle('q07') });
  });

  it('makes q06 option d exclusive', async () => {
    render(<ReadinessPage />);
    await goToQuestions();
    for (const id of ['q01', 'q02', 'q03', 'q04', 'q05']) {
      await answerQuestion(id, CONTRACT_ANSWERS[id]);
    }
    const checkbox = (key) => screen.getByRole('checkbox', { name: optionLabel('q06', key) });

    fireEvent.click(checkbox('a'));
    fireEvent.click(checkbox('b'));
    fireEvent.click(checkbox('d'));
    expect(checkbox('d')).toHaveAttribute('aria-checked', 'true');
    expect(checkbox('a')).toHaveAttribute('aria-checked', 'false');
    expect(checkbox('b')).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(checkbox('c'));
    expect(checkbox('d')).toHaveAttribute('aria-checked', 'false');
    expect(checkbox('c')).toHaveAttribute('aria-checked', 'true');
  });

  it('shows "I don\'t know yet" last in the questions that accept it, and not in the others', async () => {
    render(<ReadinessPage />);
    await goToQuestions();
    expect(screen.queryByRole('radio', { name: 'No lo sé todavía' })).not.toBeInTheDocument();
    for (const id of ['q01', 'q02', 'q03', 'q04', 'q05', 'q06']) {
      await answerQuestion(id, CONTRACT_ANSWERS[id]);
    }

    const radios = screen.getAllByRole('radio');
    expect(radios.at(-1)).toHaveAccessibleName('No lo sé todavía');
  });

  it('goes back keeping the previous answer selected', async () => {
    render(<ReadinessPage />);
    await goToQuestions();
    await answerQuestion('q01', 'b');

    click(/Atrás/);
    expect(screen.getByRole('heading', { name: questionTitle('q01') })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: optionLabel('q01', 'b') })).toHaveAttribute('aria-checked', 'true');
  });

  it('supports the keyboard: number keys choose, Enter continues and ArrowLeft goes back', async () => {
    render(<ReadinessPage />);
    await goToQuestions();

    fireEvent.keyDown(window, { key: '2' });
    await screen.findByRole('heading', { name: questionTitle('q02') });

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByRole('heading', { name: questionTitle('q01') })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: optionLabel('q01', 'b') })).toHaveAttribute('aria-checked', 'true');

    fireEvent.keyDown(window, { key: 'Enter' });
    expect(screen.getByRole('heading', { name: questionTitle('q02') })).toBeInTheDocument();
  });

  it('shows the active block in the rail', async () => {
    render(<ReadinessPage />);
    await goToQuestions();

    expect(screen.getByRole('navigation', { name: 'Bloques de la evaluación' })).toBeInTheDocument();
    expect(screen.getByText('Tu tiempo y tu equipo', { selector: 'li span' }).closest('li')).toHaveAttribute('aria-current', 'step');
  });
});

describe('ReadinessPage draft', () => {
  it('offers to resume where the visitor left off, and to start over', async () => {
    const { unmount } = render(<ReadinessPage />);
    await goToQuestions();
    await answerQuestion('q01', 'b');
    unmount();

    render(<ReadinessPage />);
    click('Retomar donde lo dejé');
    expect(screen.getByRole('heading', { name: questionTitle('q02') })).toBeInTheDocument();
    click(/Atrás/);
    expect(screen.getByRole('radio', { name: optionLabel('q01', 'b') })).toHaveAttribute('aria-checked', 'true');
  });

  it('starts over with empty answers', async () => {
    const { unmount } = render(<ReadinessPage />);
    await goToQuestions();
    await answerQuestion('q01', 'b');
    unmount();

    render(<ReadinessPage />);
    click('Empezar de nuevo');
    expect(screen.getByLabelText('Nombre')).toHaveValue('');
    expect(localStorage.getItem('sm_readiness_draft')).not.toContain('Daniel');
  });
});

describe('ReadinessPage simulator and submission', () => {
  it('shows the sales from the profile and lets the visitor correct them', async () => {
    render(<ReadinessPage />);
    await goToSimulator();

    expect(screen.getByText(/250\.000 a 500\.000/)).toBeInTheDocument();
    click('corregir');
    expect(screen.getByRole('heading', { name: 'Ahora, tu negocio' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '250.000 a 500.000' })).toHaveAttribute('aria-checked', 'true');
  });

  it('asks only for the profit percentage on the last screen', async () => {
    render(<ReadinessPage />);
    await goToSimulator();

    expect(screen.getByRole('heading', { name: 'Tu ganancia' })).toBeInTheDocument();
    expect(screen.getByLabelText('De lo que facturaste, ¿qué porcentaje te quedó de ganancia?')).toBeInTheDocument();
    expect(screen.queryByLabelText(/Trabajos o servicios/)).not.toBeInTheDocument();
    expect(screen.getAllByRole('spinbutton')).toHaveLength(1);
  });

  it('requires a sales range on the business screen', async () => {
    render(<ReadinessPage />);
    click('Conocer las posibilidades de mi negocio');
    await fillContact();
    click(/Continuar/);
    click(/Continuar/);

    expect(screen.getAllByText('Elegí una opción.').length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByRole('radio', { name: /Menos de 250\.000|a 500\.000|a 750\.000|a 1 millón|1 a 2 millones|Más de 2 millones/ })).toHaveLength(6);
  });

  it('sends the exact contract payload and shows the result', async () => {
    assessmentsApi.submitReadiness.mockResolvedValue({ token: 'tok', result: READINESS_RESULT_READY });
    render(<ReadinessPage />);
    await goToSimulator();

    click(/Ver mi resultado/);
    expect(screen.getAllByText(/Ingresá un porcentaje entre 0 y 100/).length).toBe(1);
    expect(assessmentsApi.submitReadiness).not.toHaveBeenCalled();

    fillSimulator();
    click(/Ver mi resultado/);

    await screen.findByRole('heading', { level: 1, name: 'Vossler Construction' });
    expect(assessmentsApi.submitReadiness).toHaveBeenCalledTimes(1);
    expect(assessmentsApi.submitReadiness).toHaveBeenCalledWith(CONTRACT_PAYLOAD);
    expect(localStorage.getItem('sm_readiness_draft')).toBeNull();
  });

  it('sends a null margin when marked "I don\'t know", and jobs_count is always null', async () => {
    assessmentsApi.submitReadiness.mockResolvedValue({ token: 'tok', result: READINESS_RESULT_READY });
    render(<ReadinessPage />);
    await goToSimulator();
    fireEvent.click(screen.getByLabelText('No lo sé'));
    click(/Ver mi resultado/);

    await waitFor(() => expect(assessmentsApi.submitReadiness).toHaveBeenCalled());
    expect(assessmentsApi.submitReadiness.mock.calls[0][0].simulator).toEqual({ jobs_count: null, profit_margin_pct: null });
  });

  it('sends "I don\'t know yet" as the answer key u', async () => {
    assessmentsApi.submitReadiness.mockResolvedValue({ token: 'tok', result: READINESS_RESULT_READY });
    render(<ReadinessPage />);
    await goToQuestions();
    for (const question of [...QUESTIONS, OPENNESS_QUESTION]) {
      await answerQuestion(question.id, question.id === 'q07' ? 'u' : CONTRACT_ANSWERS[question.id]);
    }
    fillSimulator();
    click(/Ver mi resultado/);

    await waitFor(() => expect(assessmentsApi.submitReadiness).toHaveBeenCalled());
    expect(assessmentsApi.submitReadiness.mock.calls[0][0].answers.q07).toBe('u');
  });

  it('sends the selected language', async () => {
    assessmentsApi.submitReadiness.mockResolvedValue({ token: 'tok', result: READINESS_RESULT_READY });
    render(<ReadinessPage />);
    await goToSimulator();
    fillSimulator();
    click('EN');
    click(/See my result/);

    await waitFor(() => expect(assessmentsApi.submitReadiness).toHaveBeenCalled());
    expect(assessmentsApi.submitReadiness.mock.calls[0][0].lang).toBe('en');
  });

  it('lets the visitor review the answers after the result without sending again', async () => {
    assessmentsApi.submitReadiness.mockResolvedValue({ token: 'tok', result: READINESS_RESULT_READY });
    render(<ReadinessPage />);
    await goToSimulator();
    fillSimulator();
    click(/Ver mi resultado/);
    await screen.findByRole('heading', { level: 1, name: 'Vossler Construction' });

    click('Volver a mis respuestas');
    expect(screen.getByRole('heading', { name: 'Empecemos por conocerte' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toHaveValue('Daniel');
  });

  it('returns to the contact screen and flags the field on a 422 for contact.email', async () => {
    assessmentsApi.submitReadiness.mockRejectedValue(
      httpError(422, { errors: { 'contact.email': ['Este email ya está en uso.'] } }),
    );
    render(<ReadinessPage />);
    await goToSimulator();
    fillSimulator();
    click(/Ver mi resultado/);

    await screen.findByRole('heading', { name: 'Empecemos por conocerte' });
    expect(screen.getByText('Este email ya está en uso.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveValue('d@x.com');
    expect(screen.getByText('Revisá estos datos y volvé a intentar.')).toBeInTheDocument();
  });

  it('returns to the business screen on a 422 for business.revenue_range', async () => {
    assessmentsApi.submitReadiness.mockRejectedValue(
      httpError(422, { errors: { 'business.revenue_range': ['Monto inválido.'] } }),
    );
    render(<ReadinessPage />);
    await goToSimulator();
    fillSimulator();
    click(/Ver mi resultado/);

    await screen.findByRole('heading', { name: 'Ahora, tu negocio' });
    expect(screen.getByText('Monto inválido.')).toBeInTheDocument();
  });

  it('returns to the question on a 422 for answers.q05', async () => {
    assessmentsApi.submitReadiness.mockRejectedValue(
      httpError(422, { errors: { 'answers.q05': ['Respuesta inválida.'] } }),
    );
    render(<ReadinessPage />);
    await goToSimulator();
    fillSimulator();
    click(/Ver mi resultado/);

    await screen.findByRole('heading', { name: questionTitle('q05') });
    expect(screen.getByText('Respuesta inválida.')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: optionLabel('q05', 'b') })).toHaveAttribute('aria-checked', 'true');
  });

  it('shows the already-submitted message on a 409', async () => {
    assessmentsApi.submitReadiness.mockRejectedValue(httpError(409));
    render(<ReadinessPage />);
    await goToSimulator();
    fillSimulator();
    click(/Ver mi resultado/);

    expect(await screen.findByText(/Ya recibimos tu evaluación/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver mi resultado/ })).toBeInTheDocument();
  });

  it('asks to wait on a 429 and allows retrying', async () => {
    assessmentsApi.submitReadiness.mockRejectedValueOnce(httpError(429)).mockResolvedValueOnce({ token: 't', result: READINESS_RESULT_READY });
    render(<ReadinessPage />);
    await goToSimulator();
    fillSimulator();
    click(/Ver mi resultado/);

    expect(await screen.findByText('Esperá un momento y volvé a intentar.')).toBeInTheDocument();
    click(/Ver mi resultado/);
    await screen.findByRole('heading', { level: 1, name: 'Vossler Construction' });
    expect(assessmentsApi.submitReadiness).toHaveBeenCalledTimes(2);
  });

  it('shows a generic message on an unexpected failure', async () => {
    assessmentsApi.submitReadiness.mockRejectedValue(new Error('network'));
    render(<ReadinessPage />);
    await goToSimulator();
    fillSimulator();
    click(/Ver mi resultado/);

    expect(await screen.findByText(/Algo salió mal al enviar/)).toBeInTheDocument();
  });
});
