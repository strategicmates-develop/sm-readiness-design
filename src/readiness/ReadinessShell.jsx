// Page chrome of the readiness assessment: white header with the horizontal logo,
// step counter and language toggle, a 4px progress bar and the block rail
// (desktop only).
import PropTypes from 'prop-types';
import { BLOCKS, PROFILE_BLOCK, SIMULATE_BLOCK } from './readinessQuestions';

const RAIL_BLOCKS = [PROFILE_BLOCK, ...BLOCKS, SIMULATE_BLOCK];

export function ProgressBar({ progress, label }) {
  const percentage = Math.round(Math.min(Math.max(progress, 0), 1) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentage}
      className="h-1 bg-brand-blue-light"
    >
      <div className="h-full bg-brand-gold-main transition-all duration-500 ease-out" style={{ width: `${percentage}%` }} />
    </div>
  );
}

ProgressBar.propTypes = { progress: PropTypes.number.isRequired, label: PropTypes.string.isRequired };

// Plain text rail: the current block in institutional blue with a gold square,
// the rest in muted black with a light blue square.
export function BlockRail({ currentKey, lang, label }) {
  const currentIndex = RAIL_BLOCKS.findIndex((block) => block.key === currentKey);
  return (
    <nav aria-label={label} className="readiness-print-hide hidden w-56 shrink-0 lg:block">
      <ol className="sticky top-28 space-y-3.5">
        {RAIL_BLOCKS.map((block, index) => {
          const active = index === currentIndex;
          return (
            <li
              key={block.key}
              aria-current={active ? 'step' : undefined}
              className={`flex items-start gap-3 text-sm leading-snug ${
                active ? 'font-semibold text-brand-navy' : 'text-ink/55'
              }`}
            >
              <span
                aria-hidden="true"
                className={`mt-[5px] h-2 w-2 shrink-0 rounded-[2px] ${active ? 'bg-brand-gold-main' : 'bg-brand-blue-light'}`}
              />
              <span>{block.title[lang]}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

BlockRail.propTypes = {
  currentKey: PropTypes.string,
  lang: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

// `counter` is { current, total } or null (intro, simulator, result).
export default function ReadinessShell({
  children,
  lang,
  onLangChange,
  t,
  counter,
  progress = 0,
  currentBlockKey,
  showProgress = true,
  wide = false,
}) {
  return (
    <div className="readiness-shell flex min-h-screen flex-col bg-white text-ink">
      <header className="readiness-print-hide sticky top-0 z-50 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
          <a href="https://strategicmates.com" target="_blank" rel="noreferrer" className="shrink-0">
            <img src="/brand/logo-horizontal.png" alt="Strategic Mates" className="h-[41px] w-auto" />
          </a>

          {counter && (
            <span className="font-accent text-sm font-medium tabular-nums text-brand-navy" data-testid="step-counter">
              {String(counter.current).padStart(2, '0')}
              <span className="text-ink/55"> / {String(counter.total).padStart(2, '0')}</span>
            </span>
          )}

          <div className="flex shrink-0 items-center gap-4">
            {['es', 'en'].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => onLangChange(code)}
                aria-pressed={lang === code}
                className={`rounded-[2px] py-1 font-accent text-xs font-medium tracking-wide underline-offset-[6px] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy ${
                  lang === code
                    ? 'text-brand-navy underline decoration-brand-gold-main decoration-2'
                    : 'text-ink/55 hover:text-brand-navy'
                }`}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        {showProgress ? (
          <ProgressBar progress={progress} label={t('progress_label')} />
        ) : (
          <div className="h-1 bg-brand-blue-light" aria-hidden="true" />
        )}
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 py-8 md:px-8 md:py-12">
        {currentBlockKey && <BlockRail currentKey={currentBlockKey} lang={lang} label={t('rail_label')} />}
        <main className={`mx-auto w-full flex-1 ${wide ? 'max-w-[720px]' : 'max-w-xl'}`}>{children}</main>
      </div>

      <footer className="readiness-print-hide border-t border-brand-blue-light bg-white py-4">
        <p className="mx-auto max-w-6xl px-4 text-xs text-ink/70 md:px-8">
          © {new Date().getFullYear()} Strategic Mates. {t('footer')}
        </p>
      </footer>
    </div>
  );
}

ReadinessShell.propTypes = {
  children: PropTypes.node,
  lang: PropTypes.string.isRequired,
  onLangChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  counter: PropTypes.shape({ current: PropTypes.number, total: PropTypes.number }),
  progress: PropTypes.number,
  currentBlockKey: PropTypes.string,
  showProgress: PropTypes.bool,
  wide: PropTypes.bool,
};
