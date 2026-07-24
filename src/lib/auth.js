// Auth helpers. The single source of truth for "who is logged in right now"
// is localStorage.currentUserId; everything else reads it.
import { loadState, saveState } from '../data/storage.js';

const SESSION_KEY = 'ikrom-kursi-session';

export function login(username, password) {
  const state = loadState();
  const user = state.users.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
  );
  if (!user) return { ok: false, error: 'Login yoki parol noto\'g\'ri' };
  localStorage.setItem(SESSION_KEY, user.id);
  return { ok: true, user };
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function currentUser() {
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  const state = loadState();
  return state.users.find((u) => u.id === id) || null;
}

export function updateUserPassword(userId, newPassword) {
  const state = loadState();
  const user = state.users.find((u) => u.id === userId);
  if (!user) return;
  user.password = newPassword;
  saveState(state);
}
