// Pure helpers for the readiness assessment: initial state, client-side
// validation, payload builder, draft storage and mapping of server errors to screens.
import {
  ACTIVITY_OPTIONS,
  BLOCKS,
  HISPANIC_OPTIONS,
  OPENNESS_QUESTION,
  OTHER_ACTIVITY_KEY,
  QUESTIONS,
  QUESTIONS_BY_ID,
  REVENUE_CONFIDENCE_OPTIONS,
  REVENUE_RANGE_OPTIONS,
} from './readinessQuestions';

export const LIMITS = {
  yearsMax: 100,
  teamMax: 5000,
  phoneMax: 30,
  cityMax: 120,
  stateMin: 2,
  stateMax: 60,
  nameMax: 120,
  businessNameMax: 160,
};

export const DRAFT_KEY = 'sm_readiness_draft';

export const SCREEN_PROFILE_CONTACT = 'profile_contact';
export const SCREEN_PROFILE_BUSINESS = 'profile_business';
export const SCREEN_OPENNESS = OPENNESS_QUESTION.id;
export const SCREEN_SIMULATE = 'simulate';

// Ordered screens between the intro and the submission.
export const FLOW = [
  SCREEN_PROFILE_CONTACT,
  SCREEN_PROFILE_BUSINESS,
  ...BLOCKS.flatMap((block) => block.questionIds),
  SCREEN_OPENNESS,
  SCREEN_SIMULATE,
];

export const EMPTY_PROFILE = {
  first_name: '',
  last_name: '',
  business_name: '',
  city: '',
  state: '', // comes from the city picked in the search (or the small state select)
  email: '',
  phone: '',
  hispanic_owner: '', // yes | no | talk
  hp_website: '', // honeypot, hidden from people
};

export const EMPTY_BUSINESS = {
  activity: '',
  activity_other: '',
  revenue_range: '',
  revenue_confidence: '',
  has_active_clients: null,
  team_size: '',
  years_operating: '',
};

// `margin_unknown` is the "I don't know" checkbox: the value then goes out as null.
export const EMPTY_SIMULATOR = { profit_margin_pct: '', margin_unknown: false };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isBlank = (value) => String(value ?? '').trim() === '';

// Parses a numeric input; returns NaN for blanks or garbage.
const toNumber = (value) => (isBlank(value) ? Number.NaN : Number(value));

const isIntegerInRange = (value, min, max) => {
  const number = toNumber(value);
  return Number.isInteger(number) && number >= min && number <= max;
};

const isNumberInRange = (value, min, max) => {
  const number = toNumber(value);
  return Number.isFinite(number) && number >= min && number <= max;
};

const lengthError = (value, max, min = 1) => {
  const length = String(value ?? '').trim().length;
  if (length === 0) return 'err_required';
  if (length > max) return 'err_too_long';
  if (length < min) return 'err_state';
  return null;
};

// Each validator returns { field: errorCopyKey }. An empty object means valid.
export function validateContact(profile) {
  const errors = {};
  const rules = {
    first_name: lengthError(profile.first_name, LIMITS.nameMax),
    last_name: lengthError(profile.last_name, LIMITS.nameMax),
    business_name: lengthError(profile.business_name, LIMITS.businessNameMax),
    city: lengthError(profile.city, LIMITS.cityMax),
    // The state always comes from the city search or its select: an empty one means "choose it".
    state: isBlank(profile.state) ? 'err_state' : lengthError(profile.state, LIMITS.stateMax, LIMITS.stateMin),
    phone: lengthError(profile.phone, LIMITS.phoneMax),
  };
  Object.entries(rules).forEach(([name, error]) => {
    if (error) errors[name] = error;
  });
  if (isBlank(profile.email)) errors.email = 'err_required';
  else if (!EMAIL_PATTERN.test(profile.email.trim())) errors.email = 'err_email';
  if (!HISPANIC_OPTIONS.some((option) => option.key === profile.hispanic_owner)) errors.hispanic_owner = 'err_choose';
  return errors;
}

export function validateBusiness(business) {
  const errors = {};
  if (!ACTIVITY_OPTIONS.some((option) => option.key === business.activity)) errors.activity = 'err_choose';
  if (business.activity === OTHER_ACTIVITY_KEY && isBlank(business.activity_other)) errors.activity_other = 'err_required';
  if (!REVENUE_RANGE_OPTIONS.some((option) => option.key === business.revenue_range)) errors.revenue_range = 'err_choose';
  if (!REVENUE_CONFIDENCE_OPTIONS.some((option) => option.key === business.revenue_confidence)) errors.revenue_confidence = 'err_choose';
  if (typeof business.has_active_clients !== 'boolean') errors.has_active_clients = 'err_choose';
  if (!isIntegerInRange(business.team_size, 1, LIMITS.teamMax)) errors.team_size = 'err_team';
  if (!isIntegerInRange(business.years_operating, 0, LIMITS.yearsMax)) errors.years_operating = 'err_years';
  return errors;
}

// A checked "I don't know" box skips the value; otherwise it must be in range.
export function validateSimulator(simulator) {
  const errors = {};
  if (!simulator.margin_unknown && !isNumberInRange(simulator.profit_margin_pct, 0, 100)) errors.profit_margin_pct = 'err_margin';
  return errors;
}

// A question is answered when single has a key, multi has at least one key.
export function isAnswered(question, answers) {
  const value = answers[question.id];
  return question.type === 'multi' ? Array.isArray(value) && value.length > 0 : Boolean(value);
}

// Toggles an option of a multi question. The exclusive option (q06 "d") clears
// the others and is cleared by any other choice.
export function toggleMultiOption(question, current = [], optionKey) {
  if (current.includes(optionKey)) return current.filter((key) => key !== optionKey);
  if (question.exclusive === optionKey) return [optionKey];
  return [...current.filter((key) => key !== question.exclusive), optionKey];
}

// Multi answers go out in the order of the options, not in click order.
function normalizeAnswers(answers) {
  return Object.fromEntries(
    [...QUESTIONS, OPENNESS_QUESTION].map((question) => {
      const value = answers[question.id];
      if (question.type !== 'multi') return [question.id, value];
      return [question.id, question.options.map((option) => option.key).filter((key) => value?.includes(key))];
    }),
  );
}

// Builds the exact body of POST /public/assessments/readiness.
export function buildReadinessPayload({ profile, business, answers, simulator, lang }) {
  const isOther = business.activity === OTHER_ACTIVITY_KEY;
  return {
    lang,
    hp_website: profile.hp_website ?? '',
    contact: {
      first_name: profile.first_name.trim(),
      last_name: profile.last_name.trim(),
      city: profile.city.trim(),
      state: profile.state.trim(),
      email: profile.email.trim(),
      phone: profile.phone.trim(),
      hispanic_owner: profile.hispanic_owner,
    },
    business: {
      name: profile.business_name.trim(),
      activity: business.activity,
      activity_other: isOther ? business.activity_other.trim() : null,
      revenue_range: business.revenue_range,
      revenue_confidence: business.revenue_confidence,
      has_active_clients: business.has_active_clients,
      team_size: Number(business.team_size),
      years_operating: Number(business.years_operating),
    },
    answers: normalizeAnswers(answers),
    // The jobs count is no longer asked; the server accepts null.
    simulator: {
      jobs_count: null,
      profit_margin_pct: simulator.margin_unknown ? null : Number(simulator.profit_margin_pct),
    },
  };
}

// Maps a server field path ("contact.email", "business.name", "answers.q05",
// "simulator.profit_margin_pct") to { screen, field }. Returns null for unknown paths.
// The business name is asked on the contact screen.
export function locateServerField(path) {
  const [group, name] = String(path).split('.');
  if (group === 'contact' || (group === 'business' && name === 'name')) {
    return { screen: SCREEN_PROFILE_CONTACT, field: group === 'business' ? 'business_name' : name };
  }
  if (group === 'business') return { screen: SCREEN_PROFILE_BUSINESS, field: name };
  if (group === 'simulator') return { screen: SCREEN_SIMULATE, field: name };
  if (group === 'answers' && QUESTIONS_BY_ID[name]) return { screen: name, field: name };
  return null;
}

// Groups a Laravel 422 `errors` object by screen:
// { byScreen: { [screen]: { [field]: message } }, firstScreen, unmapped: [message] }
export function groupServerErrors(errors) {
  const byScreen = {};
  const unmapped = [];
  Object.entries(errors ?? {}).forEach(([path, messages]) => {
    const message = Array.isArray(messages) ? messages[0] : messages;
    const location = locateServerField(path);
    if (!location) {
      if (message) unmapped.push(message);
      return;
    }
    byScreen[location.screen] = { ...byScreen[location.screen], [location.field]: message };
  });
  const firstScreen = FLOW.find((screen) => byScreen[screen]) ?? null;
  return { byScreen, firstScreen, unmapped };
}

// Draft in localStorage so a visitor can leave and come back. Storage may be
// blocked or hold garbage: every access is guarded and falls back to "no draft".
export function loadDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY));
    if (!draft || !FLOW.includes(draft.screen)) return null;
    return {
      screen: draft.screen,
      profile: { ...EMPTY_PROFILE, ...draft.profile, hp_website: '' },
      business: { ...EMPTY_BUSINESS, ...draft.business },
      answers: draft.answers && typeof draft.answers === 'object' ? draft.answers : {},
      simulator: { ...EMPTY_SIMULATOR, ...draft.simulator },
    };
  } catch {
    return null;
  }
}

export function saveDraft({ screen, profile, business, answers, simulator }) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ screen, profile: { ...profile, hp_website: '' }, business, answers, simulator }));
  } catch {
    // Storage unavailable: the assessment still works without a draft.
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Nothing to clear.
  }
}
