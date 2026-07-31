// Persistent storage layer. Everything lives in one localStorage key so it
// can be inspected and reset in one place.
import { initialState } from './seed.js';

// Bumped to v2 when the seed was re-scoped from 5 subjects to 2 (Fizika + Matematika).
// Bumped to v3 when students/users gained the parent-contact fields: the merge
// below is shallow, so it cannot reach inside the students array to add them —
// stale v2 rows would arrive without the fields and read as "parent missing"
// forever. Old data is ignored; the user gets a clean, fresh seed on first load.
const STORAGE_KEY = 'ikrom-kursi-v3';

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    // If the seed shape has changed (e.g. new fields), merge with initialState
    // so we don't crash on stale data. `settings` is merged one level deeper so
    // newly-added setting keys are always present even on old saved data.
    return {
      ...initialState,
      ...parsed,
      settings: { ...initialState.settings, ...(parsed.settings || {}) },
    };
  } catch (err) {
    console.warn('Failed to load state, using seed.', err);
    return initialState;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save state.', err);
  }
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  return initialState;
}
