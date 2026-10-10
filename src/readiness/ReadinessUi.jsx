// Small presentational pieces shared by the readiness screens.
// Visual language (official brand guide): institutional blue for structure and
// action, light blue hairlines, gold only as a small accent, rounded points (8px).
// No shadows, no tinted fills, no decorative icons.
import PropTypes from 'prop-types';
import { FieldError } from '../shared/ErrorMessages';

export const FIELD_LABEL_CLASS = 'mb-1.5 block text-[13px] text-ink/70';

// Gold outline for typing fields; the institutional blue border that comes with
// it keeps the focus ring readable on white.
export const INPUT_CLASS =
  'h-12 w-full rounded-lg border bg-white px-4 text-base text-ink transition placeholder:text-ink/50 hover:border-brand-blue-mid focus:border-brand-navy focus:outline-2 focus:outline-brand-gold-main disabled:bg-brand-blue-light/40 disabled:text-ink/50';

const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy';

export const PRIMARY_BUTTON_CLASS = `inline-flex h-12 items-center justify-center rounded-lg bg-brand-navy px-8 font-accent text-base font-medium text-white transition hover:bg-brand-navy-deep disabled:opacity-50 ${FOCUS_RING}`;

// Thin check mark drawn by hand, reused by radios, checkboxes and strengths.
export function CheckMark({ className = '', stroke = 'currentColor', strokeWidth = 1.75 }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M3.5 8.5l3 3 6-7" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

CheckMark.propTypes = { className: PropTypes.string, stroke: PropTypes.string, strokeWidth: PropTypes.number };

// One answer: text on the left, radio (or square for multi) on the right.
// `shortcut` is the 1-4 key hint, shown from md up as plain small text.
// `subtle` is the "I don't know yet" text link under the options.
export function OptionCard({ shortcut, label, selected, multi, subtle, onSelect }) {
  if (subtle) {
    return (
      <button
        type="button"
        role={multi ? 'checkbox' : 'radio'}
        aria-checked={selected}
        onClick={onSelect}
        className={`inline-flex items-center gap-1.5 rounded-[2px] py-1 text-left text-sm underline-offset-4 transition hover:underline ${FOCUS_RING} ${
          selected ? 'font-semibold text-brand-navy underline' : 'text-brand-blue-mid hover:text-brand-navy'
        }`}
      >
        {selected && <CheckMark className="h-3.5 w-3.5 shrink-0" />}
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      onClick={onSelect}
      className={`relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-lg bg-white text-left transition ${FOCUS_RING} ${
        selected
          ? 'border-[1.5px] border-brand-navy px-[19.5px] py-[17.5px]'
          : 'border border-brand-blue-light px-5 py-[18px] hover:border-brand-blue-mid'
      }`}
    >
      {selected && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] bg-brand-gold-main" />}
      <span className="text-base leading-snug text-ink">{label}</span>
      <span className="flex shrink-0 items-center gap-3">
        <span
          aria-hidden="true"
          className={`flex h-[18px] w-[18px] items-center justify-center border-[1.5px] border-brand-navy ${
            multi ? 'rounded-[3px]' : 'rounded-full'
          } ${selected ? 'bg-brand-navy' : 'bg-white'}`}
        >
          {selected && <CheckMark className="h-3 w-3 text-white" />}
        </span>
        {shortcut && (
          <span aria-hidden="true" className="hidden w-3 font-accent text-[11px] font-medium uppercase text-ink/55 md:inline">
            {shortcut}
          </span>
        )}
      </span>
    </button>
  );
}

OptionCard.propTypes = {
  shortcut: PropTypes.number,
  label: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  multi: PropTypes.bool,
  subtle: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
};

export function TextField({ id, label, error, hint, className = '', ...inputProps }) {
  return (
    <div className={className}>
      <label htmlFor={id} className={FIELD_LABEL_CLASS}>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? 'true' : undefined}
        {...inputProps}
        className={`${INPUT_CLASS} ${error ? 'border-red-700' : 'border-brand-blue-light'}`}
      />
      {hint && !error && <p className="mt-1 text-xs text-ink/70">{hint}</p>}
      <FieldError message={error} />
    </div>
  );
}

TextField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  hint: PropTypes.string,
  className: PropTypes.string,
};

// Choice among a few options (yes/no, ranges): same option rows as the questions.
export function ChoiceRow({ legend, options, value, error, onChange }) {
  return (
    <fieldset>
      <legend className={FIELD_LABEL_CLASS}>{legend}</legend>
      <div
        className={`grid gap-2.5 ${options.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}
        role="radiogroup"
        aria-label={legend}
      >
        {options.map((option) => (
          <OptionCard
            key={String(option.value)}
            label={option.label}
            selected={value === option.value}
            onSelect={() => onChange(option.value)}
          />
        ))}
      </div>
      <FieldError message={error} />
    </fieldset>
  );
}

ChoiceRow.propTypes = {
  legend: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]), label: PropTypes.string }),
  ).isRequired,
  value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export function ReadinessNav({ onBack, onNext, backLabel, nextLabel, nextDisabled, showNext = true }) {
  return (
    <div className="mt-10 flex flex-col-reverse items-center gap-4 sm:flex-row sm:justify-between">
      <button
        type="button"
        onClick={onBack}
        disabled={!onBack}
        className={`rounded-[2px] px-1 py-2 text-sm text-ink/70 underline-offset-4 transition hover:text-brand-navy hover:underline disabled:invisible ${FOCUS_RING}`}
      >
        {backLabel}
      </button>
      {showNext && (
        <button type="button" onClick={onNext} disabled={nextDisabled} className={`${PRIMARY_BUTTON_CLASS} w-full sm:w-auto`}>
          {nextLabel}
        </button>
      )}
    </div>
  );
}

ReadinessNav.propTypes = {
  onBack: PropTypes.func,
  onNext: PropTypes.func,
  backLabel: PropTypes.string.isRequired,
  nextLabel: PropTypes.string,
  nextDisabled: PropTypes.bool,
  showNext: PropTypes.bool,
};

export function ScreenHeading({ eyebrow, title, subtitle, titleId }) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <p className="mb-3 font-accent text-xs font-medium uppercase tracking-[0.08em] text-brand-gold-dark">{eyebrow}</p>
      )}
      <h1 id={titleId} className="max-w-[640px] text-[22px] font-semibold leading-[1.2] text-brand-navy md:text-[28px]">
        {title}
      </h1>
      {subtitle && <p className="mt-3 max-w-[640px] text-[15px] leading-relaxed text-ink/75">{subtitle}</p>}
    </div>
  );
}

ScreenHeading.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  titleId: PropTypes.string,
};
