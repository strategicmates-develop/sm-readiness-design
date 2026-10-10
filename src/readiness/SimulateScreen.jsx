// Last data screen: only the profit percentage, with its "I don't know" checkbox.
// The sales range chosen in the profile is shown read-only with a link to fix it.
import PropTypes from 'prop-types';
import { ErrorBanner } from '../shared/ErrorMessages';
import { ReadinessNav, ScreenHeading, TextField } from './ReadinessUi';

export default function SimulateScreen({ simulator, revenueLabel, errors, banner, t, blockTitle, onChange, onEditRevenue, onBack, onSubmit }) {
  const submit = (event) => {
    event.preventDefault();
    onSubmit();
  };
  return (
    <form noValidate onSubmit={submit} className="readiness-enter">
      <ScreenHeading title={blockTitle} />
      <div className="mb-6 flex items-center justify-between gap-3 border-y border-brand-blue-light py-3 text-sm">
        <span className="text-ink/70">{t('sim_sales_label')}</span>
        <span className="text-right font-medium text-brand-navy">
          {revenueLabel}{' '}
          <button type="button" onClick={onEditRevenue} className="ml-2 rounded-[2px] text-xs text-ink/70 underline underline-offset-4 hover:text-brand-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy">
            {t('sim_fix')}
          </button>
        </span>
      </div>
      <TextField
        id="profit_margin_pct"
        label={t('sim_margin')}
        hint={t('sim_margin_hint')}
        type="number"
        inputMode="decimal"
        min="0"
        max="100"
        value={simulator.profit_margin_pct}
        disabled={simulator.margin_unknown}
        error={errors.profit_margin_pct}
        onChange={(event) => onChange('profit_margin_pct', event.target.value)}
      />
      <label className="mt-3 inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink/70">
        <input
          type="checkbox"
          checked={simulator.margin_unknown}
          onChange={(event) => onChange('margin_unknown', event.target.checked)}
          className="h-[18px] w-[18px] accent-brand-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
        />
        {t('sim_unknown')}
      </label>
      {banner && <ErrorBanner title={t(banner.key)} details={banner.details} />}
      <ReadinessNav onBack={onBack} backLabel={t('back')} onNext={onSubmit} nextLabel={t('see_result')} />
    </form>
  );
}

SimulateScreen.propTypes = {
  simulator: PropTypes.shape({ profit_margin_pct: PropTypes.string, margin_unknown: PropTypes.bool }).isRequired,
  revenueLabel: PropTypes.string,
  errors: PropTypes.objectOf(PropTypes.string),
  banner: PropTypes.shape({ key: PropTypes.string, details: PropTypes.arrayOf(PropTypes.string) }),
  t: PropTypes.func.isRequired,
  blockTitle: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onEditRevenue: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
