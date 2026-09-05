import type { Card } from "../types";

export const SUITS: Card["suit"][] = ["♠", "♥", "♦", "♣"];

export function rankLabel(rank: number): string {
  switch (rank) {
    case 11:
      return "J";
    case 12:
      return "Q";
    case 13:
      return "K";
    case 14:
      return "A";
    default:
      return String(rank);
  }
}

export function rankName(rank: number): string {
  switch (rank) {
    case 11:
      return "Jack";
    case 12:
      return "Queen";
    case 13:
      return "King";
    case 14:
      return "Ace";
    default:
      return String(rank);
  }
}

export function suitName(suit: Card["suit"]): string {
  return { "♠": "Spades", "♥": "Hearts", "♦": "Diamonds", "♣": "Clubs" }[suit];
}

export function cardText(card: Card): string {
  return `${rankName(card.rank)} of ${suitName(card.suit)}`;
}

export function cardShort(card: Card): string {
  return `${rankLabel(card.rank)}${card.suit}`;
}

export function isRed(card: Card) {
  return card.suit === "♥" || card.suit === "♦";
}

export function newDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) for (let rank = 2; rank <= 14; rank++) deck.push({ rank, suit });
  return shuffle(deck);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
