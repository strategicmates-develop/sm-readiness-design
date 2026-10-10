/**
 * @vitest-environment jsdom
 *
 * Content integrity of the readiness assessment and its pure form helpers.
 */
import { beforeEach, describe, it, expect } from 'vitest';
import {
  ACTIVITY_OPTIONS,
  BLOCKS,
  OPENNESS_QUESTION,
  QUESTIONS,
  QUESTIONS_BY_ID,
  REVENUE_RANGE_OPTIONS,
  TOTAL_STEPS,
} from './readinessQuestions';
import { T } from './readinessCopy';
import {
  DRAFT_KEY,
  EMPTY_BUSINESS,
  EMPTY_PROFILE,
  EMPTY_SIMULATOR,
  FLOW,
  buildReadinessPayload,
  clearDraft,
  groupServerErrors,
  loadDraft,
  saveDraft,
  toggleMultiOption,
  validateBusiness,
  validateContact,
  validateSimulator,
} from './readinessForm';
import { CONTRACT_ANSWERS, CONTRACT_PAYLOAD } from './readinessFixtures';

const MULTI_IDS = ['q06', 'q09', 'q12', 'q18'];
const UNKNOWN_IDS = ['q07', 'q08', 'q13', 'q14', 'q15', 'q16', 'q17'];

describe('readiness questionnaire content', () => {
  it('has 18 questions in 6 blocks of 3 and an 18-step counter', () => {
    expect(BLOCKS).toHaveLength(6);
    BLOCKS.forEach((block) => expect(block.questionIds).toHaveLength(3));
    expect(QUESTIONS).toHaveLength(18);
    expect(QUESTIONS.map((question) => question.id)).toEqual(
      Array.from({ length: 18 }, (_, index) => `q${String(index + 1).padStart(2, '0')}`),
    );
    expect(TOTAL_STEPS).toBe(18);
    expect(BLOCKS.map((block) => block.key)).toEqual(['time_team', 'work_quality', 'money', 'clients_sales', 'information', 'direction']);
  });

  it('assigns every question to exactly one block, in order', () => {
    expect(BLOCKS.flatMap((block) => block.questionIds)).toEqual(QUESTIONS.map((question) => question.id));
    QUESTIONS.forEach((question) => {
      expect(BLOCKS.find((block) => block.key === question.block).questionIds).toContain(question.id);
    });
    expect(BLOCKS.find((block) => block.key === 'information').questionIds).toEqual(['q13', 'q14', 'q15']);
    expect(BLOCKS.find((block) => block.key === 'direction').questionIds).toEqual(['q16', 'q17', 'q18']);
  });

  it('orders the flow with no help screens: profile, 18 questions, openness, profit', () => {
    expect(FLOW).toHaveLength(22);
    expect(FLOW.slice(0, 5)).toEqual(['profile_contact', 'profile_business', 'q01', 'q02', 'q03']);
    expect(FLOW.slice(-3)).toEqual(['q18', 'openness', 'simulate']);
    expect(FLOW.some((screen) => screen.startsWith('help_'))).toBe(false);
  });

  it('marks q06, q09, q12 and q18 as multi and keeps option keys sequential', () => {
    QUESTIONS.forEach((question) => {
      expect(question.text.es && question.text.en).toBeTruthy();
      expect(question.type).toBe(MULTI_IDS.includes(question.id) ? 'multi' : 'single');
      const keys = question.options.filter((option) => !option.unknown).map((option) => option.key);
      expect(keys).toEqual(['a', 'b', 'c', 'd'].slice(0, keys.length));
      expect(keys.length).toBeGreaterThanOrEqual(3);
      question.options.forEach((option) => expect(option.es && option.en).toBeTruthy());
    });
  });

  it('adds the "I don\'t know yet" card last, only in the questions that accept it', () => {
    QUESTIONS.forEach((question) => {
      const unknown = question.options.filter((option) => option.unknown);
      if (UNKNOWN_IDS.includes(question.id)) {
        expect(unknown).toHaveLength(1);
        expect(unknown[0].key).toBe('u');
        expect(question.options.at(-1)).toBe(unknown[0]);
      } else {
        expect(unknown).toHaveLength(0);
      }
    });
  });

  it('defines the closing openness question with two options, outside the 18', () => {
    expect(OPENNESS_QUESTION.options.map((option) => option.key)).toEqual(['a', 'b']);
    expect(QUESTIONS.find((question) => question.id === 'openness')).toBeUndefined();
    expect(QUESTIONS_BY_ID.openness).toBe(OPENNESS_QUESTION);
  });

  it('has a bilingual title and intro for every block and no help screens', () => {
    BLOCKS.forEach((block) => {
      ['title', 'intro'].forEach((field) => expect(block[field].es && block[field].en).toBeTruthy());
      expect(block.help).toBeUndefined();
      expect(block.helpCta).toBeUndefined();
    });
    expect(T.es.help_title).toBeUndefined();
  });

  it('offers the 6 sales ranges the server accepts, in both languages', () => {
    expect(REVENUE_RANGE_OPTIONS.map((option) => option.key)).toEqual(['lt_250k', '250k_500k', '500k_750k', '750k_1m', '1m_2m', 'gt_2m']);
    expect(REVENUE_RANGE_OPTIONS.map((option) => option.es)).toEqual([
      'Menos de 250.000', '250.000 a 500.000', '500.000 a 750.000', '750.000 a 1 millón', '1 a 2 millones', 'Más de 2 millones',
    ]);
    expect(REVENUE_RANGE_OPTIONS[0].en).toBe('Under 250,000');
  });

  it('keeps the copy keys identical in ES and EN and fills every value', () => {
    expect(Object.keys(T.en).sort()).toEqual(Object.keys(T.es).sort());
    ['es', 'en'].forEach((lang) => Object.values(T[lang]).forEach((value) => expect(value).toBeTruthy()));
  });

  it('offers the 6 activities the server accepts', () => {
    expect(ACTIVITY_OPTIONS.map((option) => option.key)).toEqual([
      'construction', 'remodeling', 'installations_repairs', 'maintenance', 'cleaning', 'other_related',
    ]);
  });
});

describe('readiness form helpers', () => {
  const profile = { ...EMPTY_PROFILE, first_name: 'Daniel', last_name: 'Vossler', business_name: 'Vossler Construction', city: 'Orlando', state: 'FL', email: 'd@x.com', phone: '+1 407 555 0188', hispanic_owner: 'yes' };
  const business = { activity: 'construction', activity_other: '', revenue_range: '250k_500k', revenue_confidence: 'confirmed', has_active_clients: true, team_size: '8', years_operating: '6' };

  it('validates the contact screen; the state has no default and must come from the city', () => {
    expect(EMPTY_PROFILE.state).toBe('');
    expect(validateContact({ ...profile, state: '' }).state).toBe('err_state');
    expect(validateContact(profile)).toEqual({});
    expect(Object.keys(validateContact({ ...EMPTY_PROFILE, state: '' })).sort()).toEqual(
      ['business_name', 'city', 'email', 'first_name', 'hispanic_owner', 'last_name', 'phone', 'state'],
    );
    expect(validateContact({ ...profile, email: 'nope' }).email).toBe('err_email');
    expect(validateContact({ ...profile, phone: '1'.repeat(31) }).phone).toBe('err_too_long');
    expect(validateContact({ ...profile, business_name: 'x'.repeat(161) }).business_name).toBe('err_too_long');
    expect(validateContact({ ...profile, state: 'F' }).state).toBe('err_state');
    ['yes', 'no', 'talk'].forEach((value) => expect(validateContact({ ...profile, hispanic_owner: value })).toEqual({}));
    expect(validateContact({ ...profile, hispanic_owner: true }).hispanic_owner).toBe('err_choose');
  });

  it('validates the business screen', () => {
    expect(validateBusiness(business)).toEqual({});
    expect(validateBusiness(EMPTY_BUSINESS)).toMatchObject({
      activity: 'err_choose', revenue_range: 'err_choose', revenue_confidence: 'err_choose',
      has_active_clients: 'err_choose', team_size: 'err_team', years_operating: 'err_years',
    });
    expect(validateBusiness({ ...business, activity: 'other_related' }).activity_other).toBe('err_required');
    expect(validateBusiness({ ...business, activity: 'other_related', activity_other: 'Welding' })).toEqual({});
    expect(validateBusiness({ ...business, revenue_confidence: 'needs_review' })).toEqual({});
    expect(validateBusiness({ ...business, has_active_clients: false })).toEqual({});
    expect(validateBusiness({ ...business, years_operating: '0' })).toEqual({});
    REVENUE_RANGE_OPTIONS.forEach((option) => expect(validateBusiness({ ...business, revenue_range: option.key })).toEqual({}));
    expect(validateBusiness({ ...business, revenue_range: '5m' }).revenue_range).toBe('err_choose');
    expect(validateBusiness({ ...business, team_size: '0' }).team_size).toBe('err_team');
    expect(validateBusiness({ ...business, team_size: '5001' }).team_size).toBe('err_team');
    expect(validateBusiness({ ...business, years_operating: '1.5' }).years_operating).toBe('err_years');
  });

  it('validates only the profit percentage and accepts "I don\'t know"', () => {
    expect(validateSimulator({ ...EMPTY_SIMULATOR, profit_margin_pct: '25' })).toEqual({});
    expect(validateSimulator(EMPTY_SIMULATOR)).toEqual({ profit_margin_pct: 'err_margin' });
    expect(validateSimulator({ ...EMPTY_SIMULATOR, profit_margin_pct: '101' })).toEqual({ profit_margin_pct: 'err_margin' });
    expect(validateSimulator({ ...EMPTY_SIMULATOR, margin_unknown: true })).toEqual({});
  });

  it('makes q06 option d exclusive in both directions', () => {
    const q06 = QUESTIONS_BY_ID.q06;
    expect(toggleMultiOption(q06, ['a', 'b'], 'd')).toEqual(['d']);
    expect(toggleMultiOption(q06, ['d'], 'a')).toEqual(['a']);
    expect(toggleMultiOption(q06, ['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleMultiOption(q06, ['a', 'b'], 'a')).toEqual(['b']);
    expect(toggleMultiOption(QUESTIONS_BY_ID.q09, ['a'], 'd')).toEqual(['a', 'd']);
  });

  it('builds exactly the contract payload and orders multi answers by option', () => {
    const payload = buildReadinessPayload({
      profile,
      business,
      answers: { ...CONTRACT_ANSWERS, q06: ['b', 'a'], q18: ['c', 'a'] },
      simulator: { ...EMPTY_SIMULATOR, profit_margin_pct: '25' },
      lang: 'es',
    });
    expect(payload).toEqual(CONTRACT_PAYLOAD);
    expect(payload.business).not.toHaveProperty('annual_revenue');
    expect(payload.business.revenue_range).toBe('250k_500k');
    expect(Object.keys(payload)).toEqual(['lang', 'hp_website', 'contact', 'business', 'answers', 'simulator']);
    expect(Object.keys(payload.answers)).toHaveLength(19);
  });

  it('always sends jobs_count null, null margin when unknown, and activity_other only for other_related', () => {
    const payload = buildReadinessPayload({
      profile,
      business: { ...business, activity: 'other_related', activity_other: ' Welding ' },
      answers: { ...CONTRACT_ANSWERS, q07: 'u' },
      simulator: { profit_margin_pct: '10', margin_unknown: true },
      lang: 'en',
    });
    expect(payload.simulator).toEqual({ jobs_count: null, profit_margin_pct: null });
    expect(payload.business.activity_other).toBe('Welding');
    expect(payload.answers.q07).toBe('u');
    expect(payload.lang).toBe('en');
  });

  it('maps server errors to the screen and field, first screen in flow order', () => {
    const grouped = groupServerErrors({
      'simulator.profit_margin_pct': ['bad margin'],
      'answers.q05': ['bad q05'],
      'answers.openness': ['bad openness'],
      'business.revenue_range': ['bad revenue'],
      'business.name': ['bad name'],
      'contact.email': ['bad email'],
      other: ['mystery'],
    });
    expect(grouped.firstScreen).toBe('profile_contact');
    expect(grouped.byScreen).toEqual({
      simulate: { profit_margin_pct: 'bad margin' },
      q05: { q05: 'bad q05' },
      openness: { openness: 'bad openness' },
      profile_business: { revenue_range: 'bad revenue' },
      profile_contact: { business_name: 'bad name', email: 'bad email' },
    });
    expect(grouped.unmapped).toEqual(['mystery']);
    expect(groupServerErrors(undefined).firstScreen).toBeNull();
  });
});

describe('readiness draft', () => {
  beforeEach(() => localStorage.clear());

  it('saves and restores the progress without the honeypot', () => {
    saveDraft({ screen: 'q04', profile: { ...EMPTY_PROFILE, first_name: 'Ana', hp_website: 'spam' }, business: EMPTY_BUSINESS, answers: { q01: 'a' }, simulator: EMPTY_SIMULATOR });
    const draft = loadDraft();
    expect(draft.screen).toBe('q04');
    expect(draft.profile.first_name).toBe('Ana');
    expect(draft.profile.hp_website).toBe('');
    expect(draft.answers).toEqual({ q01: 'a' });
    clearDraft();
    expect(loadDraft()).toBeNull();
  });

  it('ignores a corrupted or unknown draft', () => {
    localStorage.setItem(DRAFT_KEY, '{not json');
    expect(loadDraft()).toBeNull();
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ screen: 'q99' }));
    expect(loadDraft()).toBeNull();
  });
});
