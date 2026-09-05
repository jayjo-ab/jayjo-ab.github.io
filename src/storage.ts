import { DEFAULT_SETTINGS, defaultDareCatalog, defaultPlayers, MAX_PLAYERS } from "./defaults";
import type { SavedState } from "./types";

const KEY = "highcard-dare-game-v1";

export function loadState(): SavedState {
  const players = defaultPlayers();
  const fallback: SavedState = {
    players,
    dares: defaultDareCatalog(players),
    settings: { ...DEFAULT_SETTINGS },
  };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<SavedState>;
    if (!parsed.players || !Array.isArray(parsed.players) || parsed.players.length < 2) return fallback;
    // Ensure there are always MAX_PLAYERS slots
    const merged = [...parsed.players];
    while (merged.length < MAX_PLAYERS) merged.push(players[merged.length]);
    const dares = parsed.dares ?? fallback.dares;
    for (const p of merged) {
      if (!dares.character[p.id]) dares.character[p.id] = [];
    }
    return {
      players: merged.map((p) => ({
        ...p,
        clothes: (p.clothes ?? []).map((c) => ({ ...c, removed: false })),
      })),
      dares,
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
    };
  } catch {
    return fallback;
  }
}

export function saveState(state: SavedState) {
  try {
    const toSave: SavedState = {
      ...state,
      players: state.players.map((p) => ({
        ...p,
        clothes: p.clothes.map((c) => ({ ...c, removed: false })),
      })),
    };
    localStorage.setItem(KEY, JSON.stringify(toSave));
  } catch {
    /* ignore quota errors */
  }
}

export function clearState() {
  localStorage.removeItem(KEY);
}
