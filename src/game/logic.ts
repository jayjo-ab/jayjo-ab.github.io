import { MAX_DIFFICULTY } from "../defaults";
import type { AssignedDare, Card, Dare, DareCatalog, Player, RoundRecord } from "../types";
import { cardText } from "./cards";

export function difficultyForRound(round: number, escalateEvery: number, start: number): number {
  const level = start + Math.floor((round - 1) / Math.max(1, escalateEvery));
  return Math.min(MAX_DIFFICULTY, Math.max(1, level));
}

export function resolveRound(cards: Record<string, Card>): { winnerIds: string[]; loserIds: string[] } {
  const entries = Object.entries(cards);
  const ranks = entries.map(([, c]) => c.rank);
  const max = Math.max(...ranks);
  const min = Math.min(...ranks);
  const winnerIds = entries.filter(([, c]) => c.rank === max).map(([id]) => id);
  // If everyone tied, nobody loses.
  const loserIds = max === min ? [] : entries.filter(([, c]) => c.rank === min).map(([id]) => id);
  return { winnerIds, loserIds };
}

function pronouns(sex: Player["sex"]) {
  return sex === "male"
    ? { he: "he", him: "him", his: "his" }
    : { he: "she", him: "her", his: "her" };
}

export function fillTemplate(
  text: string,
  loser: Player,
  players: Player[],
  winnerIds: string[],
): string {
  const winners = players.filter((p) => winnerIds.includes(p.id) && p.id !== loser.id);
  const others = players.filter((p) => p.id !== loser.id);
  const winner = winners[0] ?? others[0];
  const random = others.length ? others[Math.floor(Math.random() * others.length)] : loser;
  const pr = pronouns(loser.sex);
  return text
    .replace(/\{loser\}/g, loser.name)
    .replace(/\{player\}/g, loser.name)
    .replace(/\{winner\}/g, winner ? winner.name : "the winner")
    .replace(/\{winners\}/g, joinNames(winners.map((w) => w.name)) || "the winner")
    .replace(/\{random\}/g, random.name)
    .replace(/\{he\}/g, pr.he)
    .replace(/\{him\}/g, pr.him)
    .replace(/\{his\}/g, pr.his);
}

/** Pool gender + character dares for a difficulty. Falls back to the nearest lower level if empty. */
export function pickDare(
  loser: Player,
  catalog: DareCatalog,
  difficulty: number,
  players: Player[],
  winnerIds: string[],
  exclude: string[] = [],
): AssignedDare {
  const genderList = catalog.gender[loser.sex] ?? [];
  const charList = catalog.character[loser.id] ?? [];

  for (let d = difficulty; d >= 1; d--) {
    const pool: { dare: Dare; source: "gender" | "character" }[] = [
      ...genderList.filter((x) => x.difficulty === d && x.text.trim()).map((dare) => ({ dare, source: "gender" as const })),
      ...charList.filter((x) => x.difficulty === d && x.text.trim()).map((dare) => ({ dare, source: "character" as const })),
    ];
    const filtered = pool.filter((p) => !exclude.includes(p.dare.id));
    const usable = filtered.length ? filtered : pool;
    if (usable.length) {
      const chosen = usable[Math.floor(Math.random() * usable.length)];
      return {
        playerId: loser.id,
        text: fillTemplate(chosen.dare.text, loser, players, winnerIds),
        source: chosen.source,
        dareId: chosen.dare.id,
      };
    }
  }
  return { playerId: loser.id, text: "(No dare available for this difficulty – add some in the menu.)", source: "none" };
}

export function joinNames(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function possessive(name: string) {
  return name.endsWith("s") ? `${name}'` : `${name}'s`;
}

export function formatRoundLog(round: RoundRecord, players: Player[]): string {
  const byId = (id: string) => players.find((p) => p.id === id);
  const lines: string[] = [];
  lines.push(`=== Round ${round.number} · Difficulty ${round.difficulty} ===`);
  for (const p of players) {
    const c = round.cards[p.id];
    if (c) lines.push(`${p.name} draws the ${cardText(c)}.`);
  }
  const winners = round.winnerIds.map((id) => byId(id)?.name ?? "?");
  const losers = round.loserIds.map((id) => byId(id)?.name ?? "?");
  if (losers.length === 0) {
    lines.push(`Everyone tied – no winner and no loser this round.`);
  } else {
    lines.push(`${joinNames(winners)} ${winners.length > 1 ? "win" : "wins"} the round.`);
    lines.push(`${joinNames(losers)} ${losers.length > 1 ? "lose" : "loses"} the round.`);
  }
  for (const d of round.dares) {
    const p = byId(d.playerId);
    lines.push(`Dare for ${p?.name ?? "?"}: ${d.text}`);
  }
  for (const a of round.actions) lines.push(a);
  return lines.join("\n");
}

export function describeOutfit(p: Player): string {
  const worn = p.clothes.filter((c) => !c.removed).map((c) => c.name);
  return worn.length ? `${p.name} is wearing: ${worn.join(", ")}.` : `${p.name} is wearing nothing.`;
}
