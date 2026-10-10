/**
 * @vitest-environment jsdom
 *
 * City search: prefix matching without accents, at most 8 suggestions, picking
 * fills city and state, keyboard handling and the typed-city fallback with its
 * small state select.
 */
import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PropTypes from 'prop-types';
import CityCombobox from './CityCombobox';
import { normalize, searchCities } from './data/citySearch';
import { T } from './readinessCopy';
import cities from './data/usCities.json';

const t = (key) => T.es[key];

// Controlled wrapper, like the contact screen does.
function Harness({ onLocation }) {
  const [location, setLocation] = useState({ city: '', state: '' });
  const handleChange = (next) => {
    setLocation(next);
    onLocation(next);
  };
  return <CityCombobox id="city" label="Ciudad" city={location.city} state={location.state} t={t} onChange={handleChange} />;
}

Harness.propTypes = { onLocation: PropTypes.func.isRequired };

const type = (text) => fireEvent.change(screen.getByLabelText('Ciudad'), { target: { value: text } });

describe('city data', () => {
  it('ships a compact list sorted by population that always includes Orlando, FL', () => {
    expect(cities.length).toBeGreaterThan(5000);
    expect(cities.every(([name, state, population]) => name && /^[A-Z]{2}$/.test(state) && population > 0)).toBe(true);
    expect(cities.map((city) => city[2])).toEqual([...cities.map((city) => city[2])].sort((a, b) => b - a));
    expect(cities.some(([name, state]) => name === 'Orlando' && state === 'FL')).toBe(true);
  });
});

describe('searchCities', () => {
  const index = cities.map(([name, state]) => ({ name, state, key: normalize(name) }));

  it('matches by name prefix ignoring case and accents, with a limit of 8', () => {
    expect(searchCities(index, 'orl')[0]).toMatchObject({ name: 'Orlando', state: 'FL' });
    expect(searchCities(index, 'SAN')).toHaveLength(8);
    expect(normalize('Cañón')).toBe('canon');
  });

  it('needs two letters and accepts a state filter after a comma', () => {
    expect(searchCities(index, 'o')).toEqual([]);
    const results = searchCities(index, 'orlando, f');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((entry) => entry.state === 'FL')).toBe(true);
  });
});

describe('CityCombobox', () => {
  it('suggests Orlando, FL for "orl" and fills city and state when picked', async () => {
    const onLocation = vi.fn();
    render(<Harness onLocation={onLocation} />);

    type('orl');
    fireEvent.click(await screen.findByRole('option', { name: 'Orlando, FL' }));

    expect(onLocation).toHaveBeenLastCalledWith({ city: 'Orlando', state: 'FL' });
    expect(screen.getByLabelText('Ciudad')).toHaveValue('Orlando, FL');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Estado')).not.toBeInTheDocument();
  });

  it('shows at most 8 city suggestions plus the typed-text option', async () => {
    render(<Harness onLocation={vi.fn()} />);

    type('san');
    // The city list loads lazily: wait for the suggestions, not only the typed-text option.
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(9));
    expect(screen.getByRole('option', { name: /Usar «san»/ })).toBeInTheDocument();
  });

  it('does not suggest anything with fewer than two letters', () => {
    render(<Harness onLocation={vi.fn()} />);
    type('o');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('clears the location while the typed text is not a picked suggestion', async () => {
    const onLocation = vi.fn();
    render(<Harness onLocation={onLocation} />);

    type('orl');
    await screen.findByRole('option', { name: 'Orlando, FL' });
    expect(onLocation).toHaveBeenLastCalledWith({ city: '', state: '' });
  });

  it('works with the keyboard: arrows move, Enter picks and Escape closes', async () => {
    const onLocation = vi.fn();
    render(<Harness onLocation={onLocation} />);
    const input = screen.getByLabelText('Ciudad');

    type('orl');
    await screen.findByRole('option', { name: 'Orlando, FL' });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    type('orlando');
    const options = await screen.findAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onLocation).toHaveBeenLastCalledWith({ city: 'Orlando', state: 'FL' });
  });

  it('lets the visitor use a city that is not in the list and then shows the state select', async () => {
    const onLocation = vi.fn();
    render(<Harness onLocation={onLocation} />);

    type('Pueblo Chico');
    fireEvent.click(await screen.findByRole('option', { name: /Usar «Pueblo Chico»/ }));
    expect(onLocation).toHaveBeenLastCalledWith({ city: 'Pueblo Chico', state: '' });

    const select = screen.getByLabelText('Estado');
    expect(select.querySelectorAll('option')).toHaveLength(52 + 1); // 50 states + DC + PR + placeholder
    fireEvent.change(select, { target: { value: 'TX' } });
    expect(onLocation).toHaveBeenLastCalledWith({ city: 'Pueblo Chico', state: 'TX' });
  });

  it('hides the state select again when the visitor edits the text', async () => {
    render(<Harness onLocation={vi.fn()} />);

    type('Pueblo Chico');
    fireEvent.click(await screen.findByRole('option', { name: /Usar «Pueblo Chico»/ }));
    expect(screen.getByLabelText('Estado')).toBeInTheDocument();
    type('Pueblo Chic');
    expect(screen.queryByLabelText('Estado')).not.toBeInTheDocument();
  });
});
