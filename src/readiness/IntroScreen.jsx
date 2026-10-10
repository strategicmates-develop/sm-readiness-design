import PropTypes from 'prop-types';
import Escaques from './Escaques';
import { PRIMARY_BUTTON_CLASS } from './ReadinessUi';

// The key phrase of the title is set in a heavier weight: "Convierte tu negocio en
// una **empresa rentable**". Falls back to the plain title if it is not found.
function TitleWithKeyPhrase({ title, keyPhrase }) {
  const position = keyPhrase ? title.lastIndexOf(keyPhrase) : -1;
  if (position < 0) return title;
  return (
    <>
      {title.slice(0, position)}
      <strong className="font-bold">{keyPhrase}</strong>
      {title.slice(position + keyPhrase.length)}
    </>
  );
}

TitleWithKeyPhrase.propTypes = { title: PropTypes.string.isRequired, keyPhrase: PropTypes.string };

// With a saved draft the visitor may resume it or start over.
export default function IntroScreen({ t, hasDraft, onStart, onResume }) {
  return (
    <section className="readiness-enter relative min-h-[420px] py-6 pb-24 md:py-14 md:pb-28">
      <p className="mb-4 font-accent text-xs font-medium uppercase tracking-[0.08em] text-brand-gold-dark">{t('brand_form')}</p>
      <h1 className="max-w-[640px] text-[28px] font-semibold leading-[1.2] text-brand-navy md:text-4xl">
        <TitleWithKeyPhrase title={t('intro_title')} keyPhrase={t('intro_title_strong')} />
      </h1>
      <span aria-hidden="true" className="mt-6 block h-[3px] w-12 bg-brand-gold-main" />
      <p className="mt-6 max-w-lg text-base leading-relaxed text-ink">{t('intro_text')}</p>
      <div className="relative z-10 mt-8 flex flex-col items-stretch gap-4 sm:items-start">
        {hasDraft && (
          <button type="button" onClick={onResume} className={`${PRIMARY_BUTTON_CLASS} w-full sm:w-auto`}>
            {t('resume')}
          </button>
        )}
        <button
          type="button"
          onClick={onStart}
          className={
            hasDraft
              ? 'self-center rounded-[2px] px-1 py-2 text-sm text-ink/70 underline-offset-4 transition hover:text-brand-navy hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy sm:self-start'
              : `${PRIMARY_BUTTON_CLASS} w-full sm:w-auto`
          }
        >
          {hasDraft ? t('restart') : t('start')}
        </button>
      </div>
      <p className="mt-5 text-xs text-ink/70">{t('intro_meta')}</p>
      <Escaques className="absolute bottom-0 right-0" />
    </section>
  );
}

IntroScreen.propTypes = {
  t: PropTypes.func.isRequired,
  hasDraft: PropTypes.bool,
  onStart: PropTypes.func.isRequired,
  onResume: PropTypes.func,
};
