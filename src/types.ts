export type Sex = "male" | "female";

export interface ClothingItem {
  id: string;
  name: string;
  removed: boolean;
}

export interface Player {
  id: string;
  name: string;
  sex: Sex;
  isBot: boolean;
  clothes: ClothingItem[];
}

export interface Dare {
  id: string;
  text: string;
  difficulty: number; // 1..MAX_DIFFICULTY
}

export interface DareCatalog {
  gender: Record<Sex, Dare[]>;
  character: Record<string, Dare[]>; // keyed by player id
}

export interface Settings {
  playerCount: number; // 2..5
  escalateEvery: number; // rounds per difficulty level
  startDifficulty: number;
}

export interface SavedState {
  players: Player[];
  dares: DareCatalog;
  settings: Settings;
}

export interface Card {
  rank: number; // 2..14 (11=J, 12=Q, 13=K, 14=A)
  suit: "♠" | "♥" | "♦" | "♣";
}

export interface AssignedDare {
  playerId: string;
  text: string;
  source: "gender" | "character" | "none";
  dareId?: string;
}

export interface RoundRecord {
  number: number;
  difficulty: number;
  cards: Record<string, Card>;
  winnerIds: string[];
  loserIds: string[];
  dares: AssignedDare[];
  actions: string[]; // clothing actions in plain text
}
