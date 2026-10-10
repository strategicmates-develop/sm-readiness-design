import PropTypes from 'prop-types';

export default function SubmittingScreen({ t }) {
  return (
    <section className="readiness-enter py-16 text-center" role="status" aria-live="polite">
      <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-brand-blue-light border-t-brand-navy" />
      <h1 className="text-2xl font-semibold text-brand-navy">{t('submitting_title')}</h1>
      <p className="mt-2 text-sm text-ink/70">{t('submitting_text')}</p>
    </section>
  );
}

SubmittingScreen.propTypes = { t: PropTypes.func.isRequired };
