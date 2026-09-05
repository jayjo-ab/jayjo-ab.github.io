import { useEffect, useMemo, useRef, useState } from "react";
import type { Card as CardT, DareCatalog, Player, RoundRecord, Settings } from "../types";
import { DIFFICULTY_LABELS, MAX_DIFFICULTY } from "../defaults";
import { newDeck } from "../game/cards";
import { describeOutfit, difficultyForRound, formatRoundLog, joinNames, pickDare, possessive, resolveRound } from "../game/logic";
import PlayingCard from "./PlayingCard";
import ClothingPanel, { type SwapSelection } from "./ClothingPanel";
import { Badge, Button, Card } from "./ui";
import { cn } from "../utils/cn";

interface Props {
  initialPlayers: Player[];
  dares: DareCatalog;
  settings: Settings;
  onExit: () => void;
}

type Phase = "ready" | "revealing" | "result";

export default function Game({ initialPlayers, dares, settings, onExit }: Props) {
  const [players, setPlayers] = useState<Player[]>(() => initialPlayers.map((p) => ({ ...p, clothes: p.clothes.map((c) => ({ ...c, removed: false })) })));
  const deckRef = useRef<CardT[]>(newDeck());
  const [phase, setPhase] = useState<Phase>("ready");
  const [history, setHistory] = useState<RoundRecord[]>([]);
  const [current, setCurrent] = useState<RoundRecord | null>(null);
  const [swapFrom, setSwapFrom] = useState<SwapSelection | null>(null);
  const [copied, setCopied] = useState<"round" | "full" | null>(null);
  const [includeOutfits, setIncludeOutfits] = useState(true);
  const [replaceTarget, setReplaceTarget] = useState<{ playerId: string; itemId: string } | null>(null);
  const [replaceName, setReplaceName] = useState("");

  const roundNumber = history.length + 1;
  const difficulty = difficultyForRound(roundNumber, settings.escalateEvery, settings.startDifficulty);
  const nextEscalation = useMemo(() => {
    if (difficulty >= MAX_DIFFICULTY) return null;
    const roundsIntoLevel = (roundNumber - 1) % settings.escalateEvery;
    return settings.escalateEvery - roundsIntoLevel;
  }, [difficulty, roundNumber, settings.escalateEvery]);

  const byId = (id: string) => players.find((p) => p.id === id)!;

  const stats = useMemo(() => {
    const s: Record<string, { wins: number; losses: number }> = {};
    for (const p of players) s[p.id] = { wins: 0, losses: 0 };
    for (const r of history) {
      r.winnerIds.forEach((id) => s[id] && s[id].wins++);
      r.loserIds.forEach((id) => s[id] && s[id].losses++);
    }
    return s;
  }, [history, players]);

  // ---- Dealing ----
  const deal = () => {
    if (deckRef.current.length < players.length) deckRef.current = newDeck();
    const cards: Record<string, CardT> = {};
    for (const p of players) cards[p.id] = deckRef.current.pop()!;
    const { winnerIds, loserIds } = resolveRound(cards);
    const record: RoundRecord = { number: roundNumber, difficulty, cards, winnerIds, loserIds, dares: [], actions: [] };
    setCurrent(record);
    setPhase("revealing");
    setSwapFrom(null);
  };

  useEffect(() => {
    if (phase !== "revealing" || !current) return;
    const t = setTimeout(() => {
      const assigned = current.loserIds.map((id) => pickDare(byId(id), dares, current.difficulty, players, current.winnerIds));
      setCurrent({ ...current, dares: assigned });
      setPhase("result");
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const nextRound = () => {
    if (!current) return;
    setHistory((h) => [...h, current]);
    setCurrent(null);
    setPhase("ready");
    setSwapFrom(null);
  };

  const rerollDare = (playerId: string) => {
    if (!current) return;
    const prev = current.dares.find((d) => d.playerId === playerId);
    const exclude = prev?.dareId ? [prev.dareId] : [];
    const fresh = pickDare(byId(playerId), dares, current.difficulty, players, current.winnerIds, exclude);
    setCurrent({ ...current, dares: current.dares.map((d) => (d.playerId === playerId ? fresh : d)) });
  };

  // ---- Clothing actions ----
  const pushAction = (text: string) => setCurrent((c) => (c ? { ...c, actions: [...c.actions, text] } : c));

  const toggleItem = (playerId: string, itemId: string) => {
    const p = byId(playerId);
    const item = p.clothes.find((c) => c.id === itemId);
    if (!item) return;
    const nowRemoved = !item.removed;
    setPlayers((ps) => ps.map((x) => (x.id === playerId ? { ...x, clothes: x.clothes.map((c) => (c.id === itemId ? { ...c, removed: nowRemoved } : c)) } : x)));
    const pr = p.sex === "male" ? "his" : "her";
    pushAction(nowRemoved ? `${p.name} takes off ${pr} ${item.name}.` : `${p.name} puts ${pr} ${item.name} back on.`);
  };

  const openReplace = (playerId: string, itemId: string) => {
    setReplaceTarget({ playerId, itemId });
    setReplaceName("");
  };

  const confirmReplace = () => {
    if (!replaceTarget) return;
    const name = replaceName.trim();
    if (!name) return;
    const p = byId(replaceTarget.playerId);
    const item = p.clothes.find((c) => c.id === replaceTarget.itemId);
    if (!item) return;
    setPlayers((ps) =>
      ps.map((x) =>
        x.id === replaceTarget.playerId
          ? { ...x, clothes: x.clothes.map((c) => (c.id === replaceTarget.itemId ? { ...c, name, removed: false } : c)) }
          : x,
      ),
    );
    const pr = p.sex === "male" ? "his" : "her";
    pushAction(`${p.name} replaced ${pr} ${item.name} with ${name}.`);
    setReplaceTarget(null);
  };

  const completeSwap = (target: SwapSelection) => {
    if (!swapFrom || swapFrom.playerId === target.playerId) return;
    const a = byId(swapFrom.playerId);
    const b = byId(target.playerId);
    const itemA = a.clothes.find((c) => c.id === swapFrom.itemId);
    const itemB = b.clothes.find((c) => c.id === target.itemId);
    if (!itemA || !itemB) return;
    setPlayers((ps) =>
      ps.map((x) => {
        if (x.id === a.id) return { ...x, clothes: x.clothes.map((c) => (c.id === itemA.id ? { ...itemB } : c)) };
        if (x.id === b.id) return { ...x, clothes: x.clothes.map((c) => (c.id === itemB.id ? { ...itemA } : c)) };
        return x;
      }),
    );
    pushAction(`${a.name} and ${b.name} swapped clothes: ${possessive(a.name)} ${itemA.name} for ${possessive(b.name)} ${itemB.name}.`);
    setSwapFrom(null);
  };

  // ---- Logs ----
  const roundLog = current ? formatRoundLog(current, players) : "";
  const outfitLog = players.map(describeOutfit).join("\n");
  const fullLog = [...history, ...(current ? [current] : [])].map((r) => formatRoundLog(r, players)).join("\n\n");

  const copy = async (which: "round" | "full") => {
    let text = which === "round" ? roundLog : fullLog;
    if (includeOutfits && text) text += `\n\n--- Current outfits ---\n${outfitLog}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  };

  const losers = current?.loserIds ?? [];
  const winners = current?.winnerIds ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => confirm("Leave the game and return to the menu?") && onExit()} className="text-sm text-slate-400 hover:text-white">
          ← Menu
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-white/10 text-slate-200">Round {roundNumber}</Badge>
          <Badge className={cn("text-white", difficultyColor(difficulty))}>
            Difficulty {difficulty} · {DIFFICULTY_LABELS[difficulty]}
          </Badge>
          {nextEscalation !== null ? (
            <span className="text-xs text-slate-400">
              escalates in {nextEscalation} round{nextEscalation === 1 ? "" : "s"}
            </span>
          ) : (
            <span className="text-xs text-slate-400">max difficulty</span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="relative mb-6 rounded-3xl border border-emerald-900/50 bg-[radial-gradient(ellipse_at_center,_#166534_0%,_#14532d_45%,_#052e16_100%)] p-6 shadow-2xl sm:p-8">
        <div className="pointer-events-none absolute inset-3 rounded-2xl border border-emerald-400/10" />
        <div className={cn("grid gap-6", players.length <= 3 ? "grid-cols-3" : players.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3 sm:grid-cols-5")}>
          {players.map((p) => {
            const card = current?.cards[p.id];
            const isWin = phase === "result" && winners.includes(p.id) && losers.length > 0;
            const isLose = phase === "result" && losers.includes(p.id);
            return (
              <div key={p.id} className="flex flex-col items-center gap-2">
                <PlayingCard card={card} faceDown={phase !== "result"} highlight={isWin ? "win" : isLose ? "lose" : null} />
                <div className="text-center">
                  <div className={cn("text-sm font-semibold", p.sex === "male" ? "text-sky-200" : "text-pink-200")}>
                    {p.name}
                    {!p.isBot && <span className="ml-1 text-[10px] text-emerald-200/70">(you)</span>}
                  </div>
                  <div className="text-[11px] text-emerald-100/60">
                    {stats[p.id].wins}W · {stats[p.id].losses}L · {p.clothes.filter((c) => !c.removed).length} on
                  </div>
                  {isWin && <div className="mt-0.5 text-xs font-bold text-emerald-300">WINNER</div>}
                  {isLose && <div className="mt-0.5 text-xs font-bold text-rose-300">LOSER</div>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center">
          {phase === "ready" && (
            <Button size="lg" onClick={deal} className="min-w-48">
              🃏 Deal round {roundNumber}
            </Button>
          )}
          {phase === "revealing" && <div className="animate-pulse text-sm text-emerald-100/80">Revealing…</div>}
          {phase === "result" && (
            <Button size="lg" variant="success" onClick={nextRound} className="min-w-48">
              Next round →
            </Button>
          )}
        </div>
      </div>

      {/* Result */}
      {phase === "result" && current && (
        <Card
          className="mb-6"
          title={
            losers.length === 0
              ? "Everyone tied!"
              : `${joinNames(losers.map((id) => byId(id).name))} ${losers.length > 1 ? "lose" : "loses"} the round`
          }
        >
          {losers.length === 0 ? (
            <p className="text-sm text-slate-300">All cards have the same rank – nobody wins, nobody loses, no dare.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-400">
                {joinNames(winners.map((id) => byId(id).name))} {winners.length > 1 ? "win" : "wins"} with the highest card.
              </p>
              {current.dares.map((d) => {
                const p = byId(d.playerId);
                return (
                  <div key={d.playerId} className="rounded-xl border border-rose-400/30 bg-gradient-to-r from-rose-500/10 to-fuchsia-500/10 p-4">
                    <div className="mb-1 flex items-center gap-2">
                      <span className={cn("font-semibold", p.sex === "male" ? "text-sky-300" : "text-pink-300")}>{p.name}</span>
                      <Badge className={d.source === "character" ? "bg-violet-500/30 text-violet-200" : d.source === "gender" ? "bg-white/10 text-slate-300" : "bg-rose-500/20 text-rose-300"}>
                        {d.source === "character" ? "★ character dare" : d.source === "gender" ? (p.sex === "male" ? "♂ male dare" : "♀ female dare") : "no dare"}
                      </Badge>
                      <button type="button" onClick={() => rerollDare(d.playerId)} className="ml-auto text-xs text-slate-400 hover:text-white">
                        ↻ Re-roll
                      </button>
                    </div>
                    <p className="text-base text-white">{d.text}</p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Clothing */}
      <Card
        className="mb-6"
        title="Clothes"
        action={<span className="text-xs text-slate-400">Tick = stripped · Replace / Swap add a log message</span>}
      >
        {phase !== "result" && (
          <p className="mb-3 text-xs italic text-slate-500">
            {history.length === 0 ? "Deal the first round to start tracking clothes." : "Deal the next round to log more clothing changes."}
          </p>
        )}
        <ClothingPanel
          players={players}
          loserIds={losers}
          disabled={phase !== "result"}
          swapFrom={swapFrom}
          onToggle={toggleItem}
          onReplace={openReplace}
          onSwapStart={setSwapFrom}
          onSwapComplete={completeSwap}
          onSwapCancel={() => setSwapFrom(null)}
        />
      </Card>

      {/* Log */}
      <Card
        title="Round log"
        action={
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-xs text-slate-400">
              <input type="checkbox" checked={includeOutfits} onChange={(e) => setIncludeOutfits(e.target.checked)} className="accent-fuchsia-500" />
              + outfits
            </label>
            <Button size="sm" variant="secondary" onClick={() => copy("round")} disabled={!current}>
              {copied === "round" ? "✓ Copied" : "Copy round"}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => copy("full")} disabled={!fullLog}>
              {copied === "full" ? "✓ Copied" : "Copy full log"}
            </Button>
          </div>
        }
      >
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-950/60 p-3 font-mono text-xs leading-relaxed text-slate-200">
          {current ? roundLog : history.length ? formatRoundLog(history[history.length - 1], players) : "No rounds played yet."}
          {includeOutfits && (current || history.length > 0) ? `\n\n--- Current outfits ---\n${outfitLog}` : ""}
        </pre>
        {history.length > 0 && (
          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-slate-400 hover:text-white">Previous rounds ({history.length})</summary>
            <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-950/60 p-3 font-mono text-xs leading-relaxed text-slate-300">
              {history.map((r) => formatRoundLog(r, players)).join("\n\n")}
            </pre>
          </details>
        )}
      </Card>

      {/* Replace modal */}
      {replaceTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setReplaceTarget(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-1 text-base font-semibold text-white">Replace clothing</h3>
            <p className="mb-3 text-sm text-slate-400">
              {byId(replaceTarget.playerId).name} replaces <strong className="text-white">{byId(replaceTarget.playerId).clothes.find((c) => c.id === replaceTarget.itemId)?.name}</strong> with…
            </p>
            <input
              autoFocus
              value={replaceName}
              onChange={(e) => setReplaceName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmReplace();
                if (e.key === "Escape") setReplaceTarget(null);
              }}
              placeholder="New item name"
              className="mb-4 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-fuchsia-400/60 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setReplaceTarget(null)}>
                Cancel
              </Button>
              <Button onClick={confirmReplace} disabled={!replaceName.trim()}>
                Replace
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function difficultyColor(d: number) {
  return ["", "bg-emerald-600", "bg-lime-600", "bg-amber-600", "bg-orange-600", "bg-rose-600"][d] ?? "bg-slate-600";
}
