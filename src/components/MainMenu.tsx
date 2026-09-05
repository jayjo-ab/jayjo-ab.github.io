import { useState } from "react";
import type { DareCatalog, Player, Settings } from "../types";
import { DIFFICULTY_LABELS, ESCALATION_OPTIONS, MAX_DIFFICULTY, MAX_PLAYERS, MIN_PLAYERS } from "../defaults";
import PlayerEditor from "./PlayerEditor";
import DareEditor from "./DareEditor";
import { Button, Card, Label, Select } from "./ui";
import { cn } from "../utils/cn";

interface Props {
  players: Player[];
  dares: DareCatalog;
  settings: Settings;
  onPlayersChange: (p: Player[]) => void;
  onDaresChange: (d: DareCatalog) => void;
  onSettingsChange: (s: Settings) => void;
  onStart: () => void;
  onResetAll: () => void;
  savedFlash: boolean;
}

export default function MainMenu({
  players,
  dares,
  settings,
  onPlayersChange,
  onDaresChange,
  onSettingsChange,
  onStart,
  onResetAll,
  savedFlash,
}: Props) {
  const [section, setSection] = useState<"players" | "dares">("players");
  const active = players.slice(0, settings.playerCount);

  const canStart = active.every((p) => p.name.trim().length > 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <header className="mb-8 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          <span className={cn("h-2 w-2 rounded-full transition-colors", savedFlash ? "bg-emerald-400" : "bg-slate-500")} />
          {savedFlash ? "Saved" : "Auto-saved locally"}
        </div>
        <h1 className="bg-gradient-to-r from-fuchsia-300 via-white to-violet-300 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl">
          High Card Dares
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Everyone draws a card. Highest wins, lowest loses – ties share the fate. The loser gets a dare.
        </p>
      </header>

      {/* Settings */}
      <Card title="Game settings" className="mb-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Players</Label>
            <div className="flex overflow-hidden rounded-lg border border-white/10">
              {Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => i + MIN_PLAYERS).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onSettingsChange({ ...settings, playerCount: n })}
                  className={cn(
                    "flex-1 py-2 text-sm font-semibold transition-colors",
                    settings.playerCount === n ? "bg-fuchsia-600 text-white" : "bg-slate-900/60 text-slate-400 hover:bg-white/10",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">You + {settings.playerCount - 1} bot{settings.playerCount - 1 === 1 ? "" : "s"}</p>
          </div>
          <div>
            <Label>Escalate difficulty every</Label>
            <Select value={settings.escalateEvery} onChange={(e) => onSettingsChange({ ...settings, escalateEvery: Number(e.target.value) })} className="w-full">
              {ESCALATION_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} round{n === 1 ? "" : "s"}
                </option>
              ))}
            </Select>
            <p className="mt-1 text-[11px] text-slate-500">Max level {MAX_DIFFICULTY} ({DIFFICULTY_LABELS[MAX_DIFFICULTY]})</p>
          </div>
          <div>
            <Label>Start difficulty</Label>
            <Select value={settings.startDifficulty} onChange={(e) => onSettingsChange({ ...settings, startDifficulty: Number(e.target.value) })} className="w-full">
              {Array.from({ length: MAX_DIFFICULTY }, (_, i) => (
                <option key={i} value={i + 1}>
                  Level {i + 1} · {DIFFICULTY_LABELS[i + 1]}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Section switch */}
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setSection("players")}
          className={cn("rounded-lg px-4 py-2 text-sm font-semibold", section === "players" ? "bg-white text-slate-900" : "bg-white/10 text-slate-300 hover:bg-white/20")}
        >
          Players & outfits
        </button>
        <button
          type="button"
          onClick={() => setSection("dares")}
          className={cn("rounded-lg px-4 py-2 text-sm font-semibold", section === "dares" ? "bg-white text-slate-900" : "bg-white/10 text-slate-300 hover:bg-white/20")}
        >
          Dare catalog
        </button>
      </div>

      {section === "players" && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {active.map((p, i) => (
            <PlayerEditor
              key={p.id}
              player={p}
              index={i}
              onChange={(np) => onPlayersChange(players.map((x) => (x.id === np.id ? np : x)))}
            />
          ))}
        </div>
      )}

      {section === "dares" && (
        <Card>
          <DareEditor catalog={dares} players={active} onChange={onDaresChange} />
        </Card>
      )}

      <div className="mt-8 flex flex-col items-center gap-3">
        <Button size="lg" onClick={onStart} disabled={!canStart} className="w-full max-w-xs text-lg">
          ▶ Start game
        </Button>
        {!canStart && <p className="text-xs text-rose-300">Every player needs a name.</p>}
        <button
          type="button"
          onClick={() => {
            if (confirm("Reset all players, outfits, dares and settings to defaults?")) onResetAll();
          }}
          className="text-xs text-slate-500 underline-offset-2 hover:text-rose-300 hover:underline"
        >
          Reset everything to defaults
        </button>
      </div>
    </div>
  );
}
