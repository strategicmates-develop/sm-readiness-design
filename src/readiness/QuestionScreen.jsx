// One question per screen. Single questions advance by themselves (the page
// schedules it); multi questions use the Continue button.
// Keyboard: 1-4 choose, Enter continues, ArrowLeft goes back.
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { ErrorBanner } from '../shared/ErrorMessages';
import { OptionCard, ReadinessNav, ScreenHeading } from './ReadinessUi';

const EDITABLE_TAGS = ['INPUT', 'SELECT', 'TEXTAREA'];

export default function QuestionScreen({ question, value, lang, t, eyebrow, blockIntro, banner, onSelect, onContinue, onBack }) {
  const multi = question.type === 'multi';

  useEffect(() => {
    const handleKey = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (EDITABLE_TAGS.includes(event.target?.tagName)) return;
      const optionIndex = Number(event.key) - 1;
      if (Number.isInteger(optionIndex) && optionIndex >= 0 && optionIndex < question.options.length) {
        onSelect(question.options[optionIndex].key);
      } else if (event.key === 'Enter') {
        // Focus stays on the clicked option: Enter must continue, not re-toggle it.
        const onNavButton = event.target?.tagName === 'BUTTON' && !event.target.closest('[role="radio"],[role="checkbox"]');
        if (onNavButton) return;
        event.preventDefault();
        onContinue();
      } else if (event.key === 'ArrowLeft') {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [question, onSelect, onContinue, onBack]);

  const indexedOptions = question.options.map((option, position) => ({ option, position }));
  const regularOptions = indexedOptions.filter(({ option }) => !option.unknown);
  const unknownOptions = indexedOptions.filter(({ option }) => option.unknown);
  const isSelected = (key) => (multi ? Boolean(value?.includes(key)) : value === key);

  return (
    <section key={question.id} className="readiness-enter" aria-labelledby="question-title">
      <ScreenHeading
        eyebrow={eyebrow}
        title={question.text[lang]}
        subtitle={question.hint?.[lang] ?? blockIntro}
        titleId="question-title"
      />
      <div role={multi ? 'group' : 'radiogroup'} aria-labelledby="question-title">
        <div className="space-y-3">
          {regularOptions.map(({ option, position }) => (
            <OptionCard
              key={option.key}
              shortcut={position + 1}
              label={option[lang]}
              multi={multi}
              selected={isSelected(option.key)}
              onSelect={() => onSelect(option.key)}
            />
          ))}
        </div>
        {unknownOptions.length > 0 && (
          <div className="mt-5">
            {unknownOptions.map(({ option }) => (
              <OptionCard
                key={option.key}
                label={option[lang]}
                multi={multi}
                subtle
                selected={isSelected(option.key)}
                onSelect={() => onSelect(option.key)}
              />
            ))}
          </div>
        )}
      </div>
      {banner && <ErrorBanner title={t(banner.key)} details={banner.details} />}
      <ReadinessNav
        onBack={onBack}
        backLabel={t('back')}
        onNext={onContinue}
        nextLabel={t('continue')}
        showNext={multi}
      />
      <p className="mt-6 hidden text-center text-xs text-ink/70 md:block">{t('keyboard_hint')}</p>
    </section>
  );
}

QuestionScreen.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
    text: PropTypes.object,
    hint: PropTypes.object,
    options: PropTypes.array,
  }).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  lang: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  eyebrow: PropTypes.string,
  blockIntro: PropTypes.string,
  banner: PropTypes.shape({ key: PropTypes.string, details: PropTypes.arrayOf(PropTypes.string) }),
  onSelect: PropTypes.func.isRequired,
  onContinue: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

