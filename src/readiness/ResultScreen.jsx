// Result of the readiness assessment. Everything is computed by the server; this
// screen only renders it. Structure: short verdict, score meter with the business
// facts, the six areas as bar cards, strengths, up to 3 priorities and a closing
// block that says what Strategic Mates does next. One sentence per element.
// Tone rule: never the word "no", always "where you are and what comes next".
// Printable: see the readiness-print-* rules in index.css.
import PropTypes from 'prop-types';
import { CONTACT_EMAIL, T } from './readinessCopy';
import { QUESTIONS_BY_ID } from './readinessQuestions';
import Escaques from './Escaques';
import { CheckMark } from './ReadinessUi';

// Brand colors only: solid = institutional blue, developing = mid blue, to build = gold.
const STATUS_COLORS = { weak: '#d09700', medium: '#5f96b5', strong: '#153f58' };
const CLOSE_STEPS = ['1', '2', '3'];
const CLOSE_GRADIENT = 'linear-gradient(135deg, #153f58 0%, #08293d 100%)';

// Gauge geometry: a 240 degree arc, open at the bottom (angles in SVG degrees).
const GAUGE_CENTER = 60;
const GAUGE_RADIUS = 50;
const GAUGE_START = 150;
const GAUGE_SWEEP = 240;
const GAUGE_TIP = 0.05; // share of the scale painted gold at the end of the stroke

const localized = (value, lang) => value?.[lang] ?? value?.es;

function pointAt(angle) {
  const radians = (angle * Math.PI) / 180;
  return [GAUGE_CENTER + GAUGE_RADIUS * Math.cos(radians), GAUGE_CENTER + GAUGE_RADIUS * Math.sin(radians)];
}

// Arc between two shares (0-1) of the gauge scale.
function arcPath(fromShare, toShare) {
  const [startX, startY] = pointAt(GAUGE_START + GAUGE_SWEEP * fromShare);
  const [endX, endY] = pointAt(GAUGE_START + GAUGE_SWEEP * toShare);
  const largeArc = (toShare - fromShare) * GAUGE_SWEEP > 180 ? 1 : 0;
  return `M ${startX.toFixed(2)} ${startY.toFixed(2)} A ${GAUGE_RADIUS} ${GAUGE_RADIUS} 0 ${largeArc} 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`;
}

export function ScoreMeter({ score, verdict, label }) {
  const value = Math.min(Math.max(Number(score) || 0, 0), 100);
  const share = value / 100;
  const tipStart = Math.max(share - GAUGE_TIP, 0);
  return (
    <div className="relative mx-auto h-[168px] w-[210px] shrink-0" role="img" aria-label={`${label}: ${Math.round(value)}`}>
      <svg viewBox="0 0 120 100" className="h-full w-full" aria-hidden="true">
        <path d={arcPath(0, 1)} fill="none" stroke="#dbe6f3" strokeWidth="10" />
        {share > 0 && <path d={arcPath(0, tipStart)} fill="none" stroke="#153f58" strokeWidth="10" />}
        {share > 0 && <path d={arcPath(tipStart, share)} fill="none" stroke="#d09700" strokeWidth="10" />}
      </svg>
      <div className="absolute inset-x-0 top-[48px] flex flex-col items-center">
        <span className="font-accent text-[44px] font-semibold leading-none text-brand-navy">{Math.round(value)}</span>
        <span className="mt-2 text-[13px] font-medium text-ink/70">{verdict}</span>
      </div>
    </div>
  );
}

ScoreMeter.propTypes = { score: PropTypes.number, verdict: PropTypes.string.isRequired, label: PropTypes.string.isRequired };

function AreaCard({ name, percentage, status, statusLabel }) {
  const color = STATUS_COLORS[status] ?? STATUS_COLORS.weak;
  const rounded = Math.round(Math.min(Math.max(Number(percentage) || 0, 0), 100));
  return (
    <li className="rounded-lg border border-brand-blue-light bg-white p-4">
      <h3 className="min-h-[2.5rem] text-[15px] font-semibold leading-snug text-brand-navy">{name}</h3>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-1.5 flex-1 bg-brand-blue-light">
          <div className="h-full" style={{ width: `${rounded}%`, background: color }} />
        </div>
        <span className="w-9 text-right font-accent text-[13px] font-medium tabular-nums text-brand-navy">{rounded}%</span>
      </div>
      <p className="mt-3 flex items-center gap-2 text-xs text-ink/60">
        <span aria-hidden="true" className="h-2 w-2 shrink-0" style={{ background: color }} />
        {statusLabel}
      </p>
    </li>
  );
}

AreaCard.propTypes = {
  name: PropTypes.string.isRequired,
  percentage: PropTypes.number,
  status: PropTypes.string,
  statusLabel: PropTypes.string.isRequired,
};

function Section({ title, children }) {
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-lg font-semibold text-brand-navy">{title}</h2>
      {children}
    </section>
  );
}

Section.propTypes = { title: PropTypes.string.isRequired, children: PropTypes.node };

function formatLongDate(isoDate, lang) {
  const parsed = isoDate ? new Date(isoDate) : new Date();
  const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

// `facts` carries the business data the visitor typed: { years, revenue, team }.
export default function ResultScreen({ result, lang, businessName, facts, onReview }) {
  const copy = T[lang] ?? T.es;
  const ready = result.readiness === 'ready';
  const blockLabel = (block) => (lang === 'en' ? block.label_en : block.label);
  const blocksByKey = Object.fromEntries(result.blocks.map((block) => [block.key, block]));
  const strengths = result.strengths ?? [];
  const priorities = result.priorities ?? [];
  const unknownQuestions = (result.unknown ?? []).map((id) => QUESTIONS_BY_ID[id]).filter(Boolean);
  const gaps = result.eligible_program ? [] : (result.eligibility_gaps ?? []);
  const asksToTalk = [].concat(result.concerns?.openness ?? []).includes('b');
  const nextStep = localized(result.next_step, lang);
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(copy.result_contact_subject)}`;
  const longDate = formatLongDate(result.submitted_at, lang);
  const factRows = [
    [copy.result_fact_years, facts?.years],
    [copy.result_fact_sales, facts?.revenue],
    [copy.result_fact_team, facts?.team],
  ].filter(([, value]) => value !== undefined && value !== null && value !== '');
  const notes = [asksToTalk && copy.result_openness_talk, result.follow_up && copy.result_follow_up, nextStep].filter(Boolean);
  const bodyText = 'text-sm leading-relaxed text-ink/80';

  return (
    <article className="readiness-enter readiness-print-root pb-6 pt-2">
      <header className="relative pr-[72px] md:pr-24">
        <Escaques className="absolute right-0 top-0" />
        <p className="mb-4 font-accent text-xs font-medium uppercase tracking-[0.08em] text-brand-gold-dark">
          {copy.result_eyebrow} · {longDate}
        </p>
        <h1 className="text-[26px] font-semibold leading-[1.15] text-brand-navy md:text-[34px]">
          {businessName || copy.result_title}
        </h1>
        <p className="mt-3 font-accent text-lg font-semibold text-ink md:text-[22px]">
          {ready ? copy.result_sub_ready : copy.result_sub_track}
        </p>
        <p className="mt-2 text-[15px] text-ink/75">{copy.result_intro}</p>
      </header>

      <div className="mt-8 flex flex-col items-center gap-6 rounded-lg border border-brand-blue-light bg-white p-6 md:flex-row md:gap-10 md:p-8">
        <ScoreMeter
          score={result.score}
          verdict={ready ? copy.result_verdict_ready : copy.result_verdict_track}
          label={copy.result_score_label}
        />
        {factRows.length > 0 && (
          <dl className="w-full flex-1 border-t border-brand-blue-light">
            {factRows.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4 border-b border-brand-blue-light py-3">
                <dt className="text-[13px] text-ink/70">{label}</dt>
                <dd className="text-right font-accent text-[15px] font-medium text-brand-navy">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <Section title={copy.result_blocks_title}>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {result.blocks.map((block) => (
            <AreaCard
              key={block.key}
              name={blockLabel(block)}
              percentage={block.percentage}
              status={block.status}
              statusLabel={copy[`status_${block.status}`]}
            />
          ))}
        </ul>
      </Section>

      {strengths.length > 0 && (
        <Section title={copy.result_strengths_title}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {strengths.map((strength) => (
              <li
                key={strength.question ?? localized(strength.text, 'es')}
                className="relative overflow-hidden rounded-lg border border-brand-blue-light bg-white p-5 pt-6"
              >
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand-gold-main" />
                <CheckMark className="h-4 w-4" stroke="#a77e00" strokeWidth={2} />
                <p className="mt-3 text-[15px] leading-snug text-ink">{localized(strength.text, lang)}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title={copy.result_priorities_title}>
        {priorities.length > 0 ? (
          <ol className="grid gap-3 md:grid-cols-3">
            {priorities.map((priority, index) => {
              const area = blocksByKey[priority.block];
              return (
                <li key={priority.question} className="flex flex-col rounded-lg border border-brand-blue-light bg-white p-5">
                  <span className="font-accent text-sm font-semibold tracking-[0.12em] text-brand-gold-dark">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-2 text-[17px] font-semibold leading-snug text-brand-navy">{localized(priority.title, lang)}</h3>
                  <p className={`mt-2 ${bodyText}`}>{localized(priority.reading, lang)}</p>
                  <p className={`mt-2 ${bodyText}`}>{localized(priority.help, lang)}</p>
                  {area && (
                    <p className="mt-auto pt-4 text-xs text-ink/70">
                      {copy.result_area_label}: {blockLabel(area)}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="text-[15px] leading-relaxed text-ink/80">{copy.result_all_strong}</p>
        )}
      </Section>

      <section className="relative mt-12 overflow-hidden rounded-lg p-6 text-white md:p-10" style={{ background: CLOSE_GRADIENT }}>
        <Escaques className="absolute right-0 top-0" color="#ffffff" opacity={0.15} />
        <img src="/brand/isotipo-on-navy.png" alt="" className="relative h-10 w-10" />
        <h2 className="relative mt-5 max-w-md text-xl font-semibold md:text-2xl">{copy.result_close_title}</h2>
        <ul className="relative mt-6 grid gap-6 md:grid-cols-3">
          {CLOSE_STEPS.map((step) => (
            <li key={step}>
              <h3 className="font-accent text-base font-semibold text-brand-gold-light">{copy[`result_close_${step}_title`]}</h3>
              <p className="mt-1 text-sm leading-relaxed text-white/90">{copy[`result_close_${step}_text`]}</p>
            </li>
          ))}
        </ul>
        {gaps.length > 0 && (
          <div className="relative mt-8 space-y-1 border-t border-white/25 pt-5 text-sm leading-relaxed text-white/90">
            {gaps.map((gap) => (
              <p key={gap}>{copy[`gap_${gap}`]}</p>
            ))}
            <p>{copy.result_gap_close}</p>
          </div>
        )}
        <a
          href={mailto}
          className="readiness-print-hide relative mt-8 inline-flex h-12 w-full items-center justify-center rounded-lg bg-white px-8 font-accent text-base font-medium text-brand-navy transition hover:bg-brand-blue-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:w-auto"
        >
          {copy.result_cta_primary}
        </a>
      </section>

      {onReview && (
        <div className="readiness-print-hide mt-6 text-center">
          <button
            type="button"
            onClick={onReview}
            className="rounded-[2px] px-1 py-1 text-sm text-brand-navy underline underline-offset-4 hover:text-brand-navy-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
          >
            {copy.result_cta_secondary}
          </button>
        </div>
      )}

      {(unknownQuestions.length > 0 || notes.length > 0) && (
        <div className="mt-8 space-y-2 text-[13px] leading-relaxed text-ink/70">
          {unknownQuestions.length > 0 && (
            <>
              <p>
                <span className="font-semibold text-brand-navy">{copy.result_unknown_title}.</span> {copy.result_unknown_text}
              </p>
              <ul className="list-inside list-disc">
                {unknownQuestions.map((question) => (
                  <li key={question.id}>{question.text[lang]}</li>
                ))}
              </ul>
            </>
          )}
          {notes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
      )}

      <footer className="mt-8 border-t border-brand-blue-light pt-4 text-center">
        <p className="font-accent text-sm font-medium text-brand-navy">{copy.result_slogan}</p>
        <p className="mt-1 text-xs text-ink/70">{copy.result_footer.replace('{date}', longDate)}</p>
      </footer>
    </article>
  );
}

const localizedShape = PropTypes.shape({ es: PropTypes.string, en: PropTypes.string });

ResultScreen.propTypes = {
  lang: PropTypes.string.isRequired,
  businessName: PropTypes.string,
  facts: PropTypes.shape({ years: PropTypes.string, revenue: PropTypes.string, team: PropTypes.string }),
  onReview: PropTypes.func,
  result: PropTypes.shape({
    readiness: PropTypes.string,
    score: PropTypes.number,
    submitted_at: PropTypes.string,
    eligible_program: PropTypes.bool,
    eligibility_gaps: PropTypes.arrayOf(PropTypes.string),
    blocks: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string,
        label: PropTypes.string,
        label_en: PropTypes.string,
        percentage: PropTypes.number,
        status: PropTypes.string,
      }),
    ).isRequired,
    strengths: PropTypes.arrayOf(PropTypes.shape({ question: PropTypes.string, text: localizedShape })),
    priorities: PropTypes.arrayOf(
      PropTypes.shape({
        question: PropTypes.string,
        block: PropTypes.string,
        title: localizedShape,
        reading: localizedShape,
        help: localizedShape,
      }),
    ),
    unknown: PropTypes.arrayOf(PropTypes.string),
    follow_up: PropTypes.bool,
    all_strong: PropTypes.bool,
    concerns: PropTypes.object,
    next_step: localizedShape,
  }).isRequired,
};
