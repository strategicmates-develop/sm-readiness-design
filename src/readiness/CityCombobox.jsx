// City search with autocomplete. The US city list (GeoNames, CC BY 4.0) ships in
// the bundle as a lazily loaded JSON chunk: no external API. Choosing "Orlando, FL"
// fills city and state at once. A city that is not in the list can be used as
// typed; only then a small state select appears.
// Keyboard: arrows move, Enter picks, Escape closes.
import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { FieldError } from '../shared/ErrorMessages';
import { FIELD_LABEL_CLASS, INPUT_CLASS } from './ReadinessUi';
import { US_STATES } from './data/usStates';
import { MIN_CHARS, normalize, searchCities } from './data/citySearch';

export default function CityCombobox({ id, label, city, state, error, t, onChange }) {
  const [cities, setCities] = useState(null);
  const [query, setQuery] = useState(city && state ? `${city}, ${state}` : city);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [custom, setCustom] = useState(false); // typed city outside the list

  // The list is a separate chunk, loaded when the field appears.
  useEffect(() => {
    let cancelled = false;
    import('./data/usCities.json').then((module) => {
      if (!cancelled) setCities(module.default.map(([name, code]) => ({ name, state: code, key: normalize(name) })));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const matches = useMemo(() => (cities ? searchCities(cities, query) : []), [cities, query]);
  const typed = query.trim();
  const showList = open && typed.length >= MIN_CHARS && !custom;
  const optionCount = matches.length + 1; // last option: use what was typed

  const pick = (entry) => {
    setQuery(`${entry.name}, ${entry.state}`);
    setOpen(false);
    onChange({ city: entry.name, state: entry.state });
  };

  const acceptTyped = () => {
    setCustom(true);
    setOpen(false);
    onChange({ city: typed, state: '' });
  };

  const handleInput = (event) => {
    setQuery(event.target.value);
    setCustom(false);
    setOpen(true);
    setActiveIndex(0);
    // Until a suggestion is picked there is no valid city.
    onChange({ city: '', state: '' });
  };

  const handleKeyDown = (event) => {
    if (!showList) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % optionCount);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + optionCount) % optionCount);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (activeIndex < matches.length) pick(matches[activeIndex]);
      else acceptTyped();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    }
  };

  const listId = `${id}-listbox`;
  const optionClass = (active) =>
    `block w-full cursor-pointer px-4 py-3 text-left text-sm transition ${active ? 'bg-brand-blue-light text-brand-navy' : 'text-brand-navy hover:bg-brand-blue-light'}`;
  // A typed text with no suggestion picked yet has an empty city: explain what to do.
  const message = error && typed && !custom && !city ? t('err_city_pick') : error;

  return (
    <div className="relative">
      <label htmlFor={id} className={FIELD_LABEL_CLASS}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList ? `${id}-option-${activeIndex}` : undefined}
        aria-invalid={error ? 'true' : undefined}
        autoComplete="off"
        value={query}
        placeholder={t('city_placeholder')}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={() => setOpen(false)}
        className={`${INPUT_CLASS} ${error ? 'border-red-700' : 'border-brand-blue-light'}`}
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-brand-blue-light bg-white"
        >
          {matches.map((entry, index) => (
            <li
              key={`${entry.name}-${entry.state}`}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              // mousedown keeps the focus in the input, so blur does not close the list first
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => pick(entry)}
              className={optionClass(index === activeIndex)}
            >
              {entry.name}, {entry.state}
            </li>
          ))}
          <li
            id={`${id}-option-${matches.length}`}
            role="option"
            aria-selected={activeIndex === matches.length}
            onMouseDown={(event) => event.preventDefault()}
            onClick={acceptTyped}
            className={`${optionClass(activeIndex === matches.length)} border-t border-brand-blue-light text-ink/70`}
          >
            {t('city_use_typed')} «{typed}»
          </li>
        </ul>
      )}
      {custom && (
        <div className="mt-3">
          <label htmlFor="state" className={FIELD_LABEL_CLASS}>
            {t('f_state')}
          </label>
          <select
            id="state"
            value={state}
            onChange={(event) => onChange({ city: typed, state: event.target.value })}
            className={`${INPUT_CLASS} border-brand-blue-light`}
          >
            <option value="">{t('f_state_select')}</option>
            {US_STATES.map(([code, name]) => (
              <option key={code} value={code}>
                {code} - {name}
              </option>
            ))}
          </select>
        </div>
      )}
      <FieldError message={message} />
    </div>
  );
}

CityCombobox.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  city: PropTypes.string,
  state: PropTypes.string,
  error: PropTypes.string,
  t: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};
