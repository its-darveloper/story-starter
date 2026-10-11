// Saved plans, kept in this browser's local storage (same device, same address).
// Storage can be unavailable (private browsing, blocked site data), so every
// read and write is guarded; the app still works, it just can't remember plans.

const KEY = 'storyStarter.plans';

function readAll() {
  try {
    const plans = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(plans) ? plans : [];
  } catch {
    return [];
  }
}

function writeAll(plans) {
  try {
    localStorage.setItem(KEY, JSON.stringify(plans));
    return true;
  } catch {
    return false;
  }
}

// Newest first.
export const listPlans = () => readAll().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

export const getPlan = (id) => readAll().find((p) => p.id === id) || null;

// Returns true if the plan was saved.
export function savePlan(plan) {
  return writeAll([plan, ...readAll().filter((p) => p.id !== plan.id)]);
}

export function deletePlan(id) {
  return writeAll(readAll().filter((p) => p.id !== id));
}
