// Public readiness assessment (no login): intro, 2 profile screens, 18 questions
// in 6 blocks (one per screen), the openness question, the profit screen,
// submission and result. Scoring is
// computed by the server; this page only collects answers and renders the result.
// Copy is bilingual (ES/EN) through useLocalLang, like the other public pages.
// Progress is saved in localStorage (see saveDraft) so a visitor can come back.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalLang } from '../shared/useLocalLang';
import { assessmentsApi } from '../api/assessments';
import ReadinessShell from './ReadinessShell';
import IntroScreen from './IntroScreen';
import { BusinessScreen, ContactScreen } from './ProfileScreens';
import QuestionScreen from './QuestionScreen';
import SimulateScreen from './SimulateScreen';
import SubmittingScreen from './SubmittingScreen';
import ResultScreen from './ResultScreen';
import { T } from './readinessCopy';
import {
  BLOCKS_BY_KEY,
  REVENUE_RANGE_OPTIONS,
  PROFILE_BLOCK,
  QUESTIONS,
  QUESTIONS_BY_ID,
  SIMULATE_BLOCK,
  TOTAL_STEPS,
} from './readinessQuestions';
import {
  EMPTY_BUSINESS,
  EMPTY_PROFILE,
  EMPTY_SIMULATOR,
  FLOW,
  SCREEN_PROFILE_BUSINESS,
  SCREEN_PROFILE_CONTACT,
  SCREEN_SIMULATE,
  buildReadinessPayload,
  clearDraft,
  groupServerErrors,
  isAnswered,
  loadDraft,
  saveDraft,
  toggleMultiOption,
  validateBusiness,
  validateContact,
  validateSimulator,
} from './readinessForm';

const AUTO_ADVANCE_MS = 300;
const PHASE_INTRO = 'intro';
const PHASE_FLOW = 'flow';
const PHASE_SUBMITTING = 'submitting';
const PHASE_RESULT = 'result';

const UNKNOWN_FLAG_FIELDS = { margin_unknown: 'profit_margin_pct' };

// Block a screen belongs to (drives the rail and the question eyebrow).
function blockKeyOf(screen) {
  if (screen === SCREEN_PROFILE_CONTACT || screen === SCREEN_PROFILE_BUSINESS) return PROFILE_BLOCK.key;
  if (screen === SCREEN_SIMULATE) return SIMULATE_BLOCK.key;
  return QUESTIONS_BY_ID[screen].block;
}

// Maps a failed submission to the screen to show and its banner.
function describeSubmitError(error) {
  const status = error?.response?.status;
  if (status === 422) {
    const grouped = groupServerErrors(error.response.data?.errors);
    const screen = grouped.firstScreen ?? SCREEN_SIMULATE;
    const details = grouped.unmapped.length > 0 ? grouped.unmapped : [error.response.data?.message].filter(Boolean);
    return { screen, fieldErrors: grouped.byScreen, banner: { key: 'err_validation', details: grouped.firstScreen ? [] : details } };
  }
  if (status === 409) return { screen: SCREEN_SIMULATE, fieldErrors: {}, banner: { key: 'err_already_submitted', details: [] } };
  if (status === 429) return { screen: SCREEN_SIMULATE, fieldErrors: {}, banner: { key: 'err_throttle', details: [] } };
  return { screen: SCREEN_SIMULATE, fieldErrors: {}, banner: { key: 'err_generic', details: [] } };
}

export default function ReadinessPage() {
  const { lang, setLanguage, t } = useLocalLang(T);
  const [draft] = useState(loadDraft); // initial state only; the intro re-reads the storage
  const [phase, setPhase] = useState(PHASE_INTRO);
  const [screen, setScreen] = useState(draft?.screen ?? FLOW[0]);
  const [profile, setProfile] = useState(draft?.profile ?? EMPTY_PROFILE);
  const [business, setBusiness] = useState(draft?.business ?? EMPTY_BUSINESS);
  const [answers, setAnswers] = useState(draft?.answers ?? {});
  const [simulator, setSimulator] = useState(draft?.simulator ?? EMPTY_SIMULATOR);
  // { [screen]: { [field]: copyKeyOrServerMessage } }
  const [errors, setErrors] = useState({});
  const [banners, setBanners] = useState({}); // { [screen]: { key, details } }
  const [result, setResult] = useState(null);
  const advanceTimer = useRef(null);

  const cancelAdvance = useCallback(() => {
    clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
  }, []);

  useEffect(() => cancelAdvance, [cancelAdvance]);

  // Every screen starts from the top.
  useEffect(() => {
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  }, [screen, phase]);

  // Save progress while the visitor is answering.
  useEffect(() => {
    if (phase === PHASE_FLOW && !result) saveDraft({ screen, profile, business, answers, simulator });
  }, [phase, result, screen, profile, business, answers, simulator]);

  const screenIndex = FLOW.indexOf(screen);

  const goNext = useCallback(() => {
    cancelAdvance();
    setScreen(FLOW[Math.min(screenIndex + 1, FLOW.length - 1)]);
  }, [screenIndex, cancelAdvance]);

  const goBack = useCallback(() => {
    cancelAdvance();
    if (screenIndex === 0) {
      setPhase(PHASE_INTRO);
      return;
    }
    setScreen(FLOW[screenIndex - 1]);
  }, [screenIndex, cancelAdvance]);

  // Error values are copy keys (client validation) or ready-made server messages.
  const resolveErrors = (screenKey) =>
    Object.fromEntries(
      Object.entries(errors[screenKey] ?? {}).map(([field, value]) => [field, T.es[value] === undefined ? value : t(value)]),
    );

  const clearFieldError = (screenKey, field) =>
    setErrors((current) => (current[screenKey]?.[field] ? { ...current, [screenKey]: { ...current[screenKey], [field]: undefined } } : current));

  const updateProfile = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
    clearFieldError(SCREEN_PROFILE_CONTACT, field);
  };

  // The city search sets city and state together.
  const updateLocation = ({ city, state }) => {
    setProfile((current) => ({ ...current, city, state }));
    clearFieldError(SCREEN_PROFILE_CONTACT, 'city');
    clearFieldError(SCREEN_PROFILE_CONTACT, 'state');
  };

  const updateBusiness = (field, value) => {
    setBusiness((current) => ({ ...current, [field]: value }));
    clearFieldError(SCREEN_PROFILE_BUSINESS, field);
  };

  // Checking "I don't know" also clears the error of its value.
  const updateSimulator = (field, value) => {
    setSimulator((current) => ({ ...current, [field]: value }));
    clearFieldError(SCREEN_SIMULATE, UNKNOWN_FLAG_FIELDS[field] ?? field);
  };

  const setScreenErrors = (screenKey, screenErrors) => {
    setErrors((current) => ({ ...current, [screenKey]: screenErrors }));
    setBanners((current) => ({ ...current, [screenKey]: null }));
  };

  const advanceFrom = (screenKey, validator, value) => {
    const found = validator(value);
    setScreenErrors(screenKey, found);
    if (Object.keys(found).length === 0) goNext();
  };

  const handleSelect = useCallback(
    (questionId, optionKey) => {
      const question = QUESTIONS_BY_ID[questionId];
      setBanners((current) => ({ ...current, [questionId]: null }));
      setErrors((current) => (current[questionId] ? { ...current, [questionId]: undefined } : current));
      if (question.type === 'multi') {
        setAnswers((current) => ({ ...current, [questionId]: toggleMultiOption(question, current[questionId], optionKey) }));
        return;
      }
      setAnswers((current) => ({ ...current, [questionId]: optionKey }));
      cancelAdvance();
      advanceTimer.current = setTimeout(() => {
        advanceTimer.current = null;
        setScreen(FLOW[FLOW.indexOf(questionId) + 1]);
      }, AUTO_ADVANCE_MS);
    },
    [cancelAdvance],
  );

  const handleQuestionContinue = useCallback(
    (question) => {
      cancelAdvance();
      if (!isAnswered(question, answers)) {
        setBanners((current) => ({ ...current, [question.id]: { key: 'err_answer_required', details: [] } }));
        return;
      }
      setScreen(FLOW[FLOW.indexOf(question.id) + 1]);
    },
    [answers, cancelAdvance],
  );

  const handleSubmit = async () => {
    // Back from "review my answers": the assessment was already sent once.
    if (result) {
      setPhase(PHASE_RESULT);
      return;
    }
    const found = validateSimulator(simulator);
    setScreenErrors(SCREEN_SIMULATE, found);
    if (Object.keys(found).length > 0) return;

    setPhase(PHASE_SUBMITTING);
    try {
      const response = await assessmentsApi.submitReadiness(
        buildReadinessPayload({ profile, business, answers, simulator, lang }),
      );
      clearDraft();
      setResult(response.result);
      setPhase(PHASE_RESULT);
    } catch (error) {
      const failure = describeSubmitError(error);
      setErrors((current) => ({ ...current, ...failure.fieldErrors }));
      setBanners((current) => ({ ...current, [failure.screen]: failure.banner }));
      setScreen(failure.screen);
      setPhase(PHASE_FLOW);
    }
  };

  const startFresh = () => {
    clearDraft();
    setProfile(EMPTY_PROFILE);
    setBusiness(EMPTY_BUSINESS);
    setAnswers({});
    setSimulator(EMPTY_SIMULATOR);
    setScreen(FLOW[0]);
    setPhase(PHASE_FLOW);
  };

  const resume = () => setPhase(PHASE_FLOW);

  // The visitor reviews the answers after the result (no second submission).
  const reviewAnswers = () => {
    setScreen(FLOW[0]);
    setPhase(PHASE_FLOW);
  };

  // A server error on a question shows as banner detail (questions have no fields).
  const questionBanner = (questionId) => {
    const banner = banners[questionId];
    const serverMessage = errors[questionId]?.[questionId];
    if (serverMessage && (!banner || banner.key === 'err_validation')) {
      return { key: 'err_validation', details: [serverMessage] };
    }
    return banner ?? null;
  };

  const inFlow = phase === PHASE_FLOW;
  const questionNumber = QUESTIONS.findIndex((question) => question.id === screen) + 1;
  const counter = inFlow && questionNumber > 0 ? { current: questionNumber, total: TOTAL_STEPS } : null;
  const progress = phase === PHASE_RESULT || phase === PHASE_SUBMITTING ? 1 : inFlow ? (screenIndex + 1) / FLOW.length : 0;
  const currentBlock = inFlow ? BLOCKS_BY_KEY[blockKeyOf(screen)] : null;

  const renderFlow = () => {
    if (screen === SCREEN_PROFILE_CONTACT) {
      return (
        <ContactScreen
          profile={profile}
          errors={resolveErrors(screen)}
          banner={banners[screen]}
          t={t}
          lang={lang}
          onChange={updateProfile}
          onLocationChange={updateLocation}
          onBack={goBack}
          onNext={() => advanceFrom(screen, validateContact, profile)}
        />
      );
    }
    if (screen === SCREEN_PROFILE_BUSINESS) {
      return (
        <BusinessScreen
          business={business}
          errors={resolveErrors(screen)}
          banner={banners[screen]}
          t={t}
          lang={lang}
          onChange={updateBusiness}
          onBack={goBack}
          onNext={() => advanceFrom(screen, validateBusiness, business)}
        />
      );
    }
    if (screen === SCREEN_SIMULATE) {
      return (
        <SimulateScreen
          simulator={simulator}
          revenueLabel={REVENUE_RANGE_OPTIONS.find((option) => option.key === business.revenue_range)?.[lang]}
          errors={resolveErrors(screen)}
          banner={banners[screen]}
          t={t}
          blockTitle={currentBlock.title[lang]}
          onChange={updateSimulator}
          onEditRevenue={() => setScreen(SCREEN_PROFILE_BUSINESS)}
          onBack={goBack}
          onSubmit={handleSubmit}
        />
      );
    }
    const question = QUESTIONS_BY_ID[screen];
    const position = currentBlock.questionIds?.indexOf(question.id) ?? -1;
    const eyebrow =
      position >= 0
        ? `${currentBlock.title[lang]} · ${t('question_of', { n: position + 1, m: currentBlock.questionIds.length })}`
        : currentBlock.title[lang];
    return (
      <QuestionScreen
        key={question.id}
        question={question}
        value={answers[question.id]}
        lang={lang}
        t={t}
        eyebrow={eyebrow}
        blockIntro={position === 0 ? currentBlock.intro[lang] : undefined}
        banner={questionBanner(question.id)}
        onSelect={(optionKey) => handleSelect(question.id, optionKey)}
        onContinue={() => handleQuestionContinue(question)}
        onBack={goBack}
      />
    );
  };

  return (
    <ReadinessShell
      lang={lang}
      onLangChange={setLanguage}
      t={t}
      counter={counter}
      progress={progress}
      currentBlockKey={currentBlock?.key}
      showProgress={phase !== PHASE_INTRO}
      wide={phase === PHASE_RESULT}
    >
      {phase === PHASE_INTRO && <IntroScreen t={t} hasDraft={loadDraft() !== null} onStart={startFresh} onResume={resume} />}
      {inFlow && renderFlow()}
      {phase === PHASE_SUBMITTING && <SubmittingScreen t={t} />}
      {phase === PHASE_RESULT && (
        <ResultScreen
          result={result}
          lang={lang}
          businessName={profile.business_name.trim()}
          facts={{
            years: business.years_operating,
            revenue: REVENUE_RANGE_OPTIONS.find((option) => option.key === business.revenue_range)?.[lang],
            team: business.team_size,
          }}
          onReview={reviewAnswers}
        />
      )}
    </ReadinessShell>
  );
}
