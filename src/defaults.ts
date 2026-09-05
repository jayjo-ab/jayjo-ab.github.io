import type { Dare, DareCatalog, Player, Settings, Sex } from "./types";

export const MAX_DIFFICULTY = 5;
export const MAX_PLAYERS = 5;
export const MIN_PLAYERS = 2;

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Easy",
  2: "Mild",
  3: "Medium",
  4: "Hard",
  5: "Extreme",
};

export const ESCALATION_OPTIONS = [1, 2, 3, 5, 7, 10];

let counter = 0;
export function uid(prefix = "id"): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter}_${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function mkDares(list: [number, string][]): Dare[] {
  return list.map(([difficulty, text]) => ({ id: uid("dare"), difficulty, text }));
}

const DEFAULT_MALE_CLOTHES = ["Shoes", "Socks", "Jacket", "Shirt", "Trousers", "Undershirt", "Boxers"];
const DEFAULT_FEMALE_CLOTHES = ["Shoes", "Socks", "Cardigan", "Blouse", "Skirt", "Bra", "Panties"];

export function defaultClothesFor(sex: Sex) {
  const src = sex === "male" ? DEFAULT_MALE_CLOTHES : DEFAULT_FEMALE_CLOTHES;
  return src.map((name) => ({ id: uid("cl"), name, removed: false }));
}

export function makePlayer(index: number, sex: Sex, name?: string): Player {
  return {
    id: uid("p"),
    name: name ?? (index === 0 ? "You" : `Bot ${index}`),
    sex,
    isBot: index !== 0,
    clothes: defaultClothesFor(sex),
  };
}

export const DEFAULT_GENDER_DARES: Record<Sex, [number, string][]> = {
  male: [
    [1, "{loser} has to give every other player a sincere compliment."],
    [1, "{loser} must do 10 push-ups while the others count out loud."],
    [1, "{loser} has to tell an embarrassing story from his past."],
    [2, "{loser} has to let {winner} style his hair however they like for the next 3 rounds."],
    [2, "{loser} must flex and pose like a bodybuilder for 30 seconds."],
    [2, "{loser} has to speak in a dramatic accent until the next round is over."],
    [3, "{loser} has to give {winner} a one-minute shoulder massage."],
    [3, "{loser} must let {winner} draw something on his arm with a marker."],
    [3, "{loser} has to do his best slow-motion catwalk across the room."],
    [4, "{loser} must let {winner} pick one item of clothing he has to take off."],
    [4, "{loser} has to sit on the floor at {winner}'s feet for the next round."],
    [5, "{loser} must obey one command from {winner} (within the rules of the game)."],
    [5, "{loser} has to let {winner} decide what he wears for the rest of the game."],
  ],
  female: [
    [1, "{loser} has to give every other player a sincere compliment."],
    [1, "{loser} must do 10 squats while the others count out loud."],
    [1, "{loser} has to tell an embarrassing story from her past."],
    [2, "{loser} has to let {winner} style her hair however they like for the next 3 rounds."],
    [2, "{loser} must strike three model poses picked by {winner}."],
    [2, "{loser} has to speak in a dramatic accent until the next round is over."],
    [3, "{loser} has to give {winner} a one-minute shoulder massage."],
    [3, "{loser} must let {winner} draw something on her arm with a marker."],
    [3, "{loser} has to do her best slow-motion catwalk across the room."],
    [4, "{loser} must let {winner} pick one item of clothing she has to take off."],
    [4, "{loser} has to sit on the floor at {winner}'s feet for the next round."],
    [5, "{loser} must obey one command from {winner} (within the rules of the game)."],
    [5, "{loser} has to let {winner} decide what she wears for the rest of the game."],
  ],
};

export const DEFAULT_CHARACTER_DARES: [number, string][] = [
  [1, "{loser} has to say something nice about {winner}'s outfit."],
  [3, "{loser} must trade seats with {winner} for the next round."],
  [5, "{loser} has to let {winner} choose the next dare in person."],
];

export function defaultDareCatalog(players: Player[]): DareCatalog {
  const character: Record<string, Dare[]> = {};
  for (const p of players) character[p.id] = mkDares(DEFAULT_CHARACTER_DARES);
  return {
    gender: {
      male: mkDares(DEFAULT_GENDER_DARES.male),
      female: mkDares(DEFAULT_GENDER_DARES.female),
    },
    character,
  };
}

export const DEFAULT_SETTINGS: Settings = {
  playerCount: 3,
  escalateEvery: 3,
  startDifficulty: 1,
};

export function defaultPlayers(): Player[] {
  return [
    makePlayer(0, "male", "You"),
    makePlayer(1, "female", "Mia"),
    makePlayer(2, "female", "Lena"),
    makePlayer(3, "male", "Tom"),
    makePlayer(4, "female", "Sara"),
  ];
}
