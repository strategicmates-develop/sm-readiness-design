export const MAX_RESULTS = 8;
export const MIN_CHARS = 2;

// Lowercase without accents, so "Cañón" and "canon" match.
export const normalize = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

// Cities whose name starts with the typed text; "orlando, f" also filters by state.
// `index` is ordered by population, so the first matches are the biggest cities.
export function searchCities(index, query) {
  const [namePart, statePart = ''] = query.split(',');
  const prefix = normalize(namePart);
  const statePrefix = normalize(statePart);
  if (prefix.length < MIN_CHARS) return [];
  const matches = [];
  for (const entry of index) {
    if (entry.key.startsWith(prefix) && entry.state.toLowerCase().startsWith(statePrefix)) {
      matches.push(entry);
      if (matches.length === MAX_RESULTS) break;
    }
  }
  return matches;
}
