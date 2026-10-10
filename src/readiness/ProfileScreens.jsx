// The two profile screens: contact data first, then the business data.
import PropTypes from 'prop-types';
import { ErrorBanner, FieldError } from '../shared/ErrorMessages';
import CityCombobox from './CityCombobox';
import { ChoiceRow, FIELD_LABEL_CLASS, INPUT_CLASS, ReadinessNav, ScreenHeading, TextField } from './ReadinessUi';
import { ACTIVITY_OPTIONS, HISPANIC_OPTIONS, OTHER_ACTIVITY_KEY, REVENUE_CONFIDENCE_OPTIONS, REVENUE_RANGE_OPTIONS } from './readinessQuestions';

const screenProps = {
  errors: PropTypes.objectOf(PropTypes.string),
  banner: PropTypes.shape({ key: PropTypes.string, details: PropTypes.arrayOf(PropTypes.string) }),
  t: PropTypes.func.isRequired,
  lang: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onNext: PropTypes.func.isRequired,
};

function ScreenBanner({ banner, t }) {
  if (!banner) return null;
  return <ErrorBanner title={t(banner.key)} details={banner.details} />;
}

ScreenBanner.propTypes = { banner: screenProps.banner, t: PropTypes.func.isRequired };

// `errors` values are already translated messages (client copy or server text).
export function ContactScreen({ profile, errors, banner, t, lang, onChange, onLocationChange, onBack, onNext }) {
  const submit = (event) => {
    event.preventDefault();
    onNext();
  };
  const text = (name, label, extra = {}) => (
    <TextField
      id={name}
      label={t(label)}
      value={profile[name]}
      error={errors[name]}
      onChange={(event) => onChange(name, event.target.value)}
      {...extra}
    />
  );
  return (
    <form noValidate onSubmit={submit} className="readiness-enter">
      <ScreenHeading title={t('profile_contact_title')} subtitle={t('profile_contact_sub')} />
      {/* Honeypot: hidden from people, bots tend to fill it. */}
      <input
        type="text"
        name="hp_website"
        value={profile.hp_website}
        onChange={(e) => onChange('hp_website', e.target.value)}
        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {text('first_name', 'f_first_name', { autoComplete: 'given-name' })}
        {text('last_name', 'f_last_name', { autoComplete: 'family-name' })}
        <div className="sm:col-span-2">{text('business_name', 'f_business_name', { autoComplete: 'organization' })}</div>
        <div className="sm:col-span-2">
          <CityCombobox
            id="city"
            label={t('f_city')}
            city={profile.city}
            state={profile.state}
            error={errors.city ?? errors.state}
            t={t}
            onChange={onLocationChange}
          />
        </div>
        <div className="sm:col-span-2">{text('email', 'f_email', { type: 'email', autoComplete: 'email' })}</div>
        <div className="sm:col-span-2">{text('phone', 'f_phone', { type: 'tel', autoComplete: 'tel' })}</div>
        <div className="sm:col-span-2">
          <ChoiceRow
            legend={t('f_hispanic')}
            options={HISPANIC_OPTIONS.map((option) => ({ value: option.key, label: option[lang] }))}
            value={profile.hispanic_owner}
            error={errors.hispanic_owner}
            onChange={(value) => onChange('hispanic_owner', value)}
          />
        </div>
      </div>
      <ScreenBanner banner={banner} t={t} />
      <ReadinessNav onBack={onBack} backLabel={t('back')} onNext={onNext} nextLabel={t('continue')} />
      <p className="mt-6 text-center text-[11px] text-ink/70">{t('city_attribution')}</p>
    </form>
  );
}

ContactScreen.propTypes = {
  ...screenProps,
  onLocationChange: PropTypes.func.isRequired,
  profile: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    business_name: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    hispanic_owner: PropTypes.string,
    hp_website: PropTypes.string,
  }).isRequired,
};

export function BusinessScreen({ business, errors, banner, t, lang, onChange, onBack, onNext }) {
  const submit = (event) => {
    event.preventDefault();
    onNext();
  };
  return (
    <form noValidate onSubmit={submit} className="readiness-enter">
      <ScreenHeading title={t('profile_business_title')} subtitle={t('profile_business_sub')} />
      <div className="grid gap-4">
        <div>
          <label htmlFor="activity" className={FIELD_LABEL_CLASS}>
            {t('f_activity')}
          </label>
          <select
            id="activity"
            value={business.activity}
            aria-invalid={errors.activity ? 'true' : undefined}
            onChange={(e) => onChange('activity', e.target.value)}
            className={`${INPUT_CLASS} ${errors.activity ? 'border-red-700' : 'border-brand-blue-light'}`}
          >
            <option value="">{t('f_activity_select')}</option>
            {ACTIVITY_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                {option[lang]}
              </option>
            ))}
          </select>
          <FieldError message={errors.activity} />
        </div>
        {business.activity === OTHER_ACTIVITY_KEY && (
          <TextField id="activity_other" label={t('f_activity_other')} value={business.activity_other} error={errors.activity_other} onChange={(e) => onChange('activity_other', e.target.value)} />
        )}
        <ChoiceRow
          legend={t('f_revenue')}
          options={REVENUE_RANGE_OPTIONS.map((option) => ({ value: option.key, label: option[lang] }))}
          value={business.revenue_range}
          error={errors.revenue_range}
          onChange={(value) => onChange('revenue_range', value)}
        />
        <ChoiceRow
          legend={t('f_confidence')}
          options={REVENUE_CONFIDENCE_OPTIONS.map((option) => ({ value: option.key, label: option[lang] }))}
          value={business.revenue_confidence}
          error={errors.revenue_confidence}
          onChange={(value) => onChange('revenue_confidence', value)}
        />
        <ChoiceRow
          legend={t('f_has_clients')}
          options={[
            { value: true, label: t('opt_yes') },
            { value: false, label: t('opt_no') },
          ]}
          value={business.has_active_clients}
          error={errors.has_active_clients}
          onChange={(value) => onChange('has_active_clients', value)}
        />
        <TextField id="team_size" label={t('f_team_size')} type="number" inputMode="numeric" min="1" value={business.team_size} error={errors.team_size} onChange={(e) => onChange('team_size', e.target.value)} />
        <TextField id="years_operating" label={t('f_years')} type="number" inputMode="numeric" min="0" value={business.years_operating} error={errors.years_operating} onChange={(e) => onChange('years_operating', e.target.value)} />
      </div>
      <ScreenBanner banner={banner} t={t} />
      <ReadinessNav onBack={onBack} backLabel={t('back')} onNext={onNext} nextLabel={t('continue')} />
    </form>
  );
}

BusinessScreen.propTypes = {
  ...screenProps,
  business: PropTypes.shape({
    activity: PropTypes.string,
    activity_other: PropTypes.string,
    revenue_range: PropTypes.string,
    revenue_confidence: PropTypes.string,
    has_active_clients: PropTypes.bool,
    team_size: PropTypes.string,
    years_operating: PropTypes.string,
  }).isRequired,
};
