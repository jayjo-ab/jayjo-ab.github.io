import { useMemo, useState } from "react";
import type { Dare, DareCatalog, Player, Sex } from "../types";
import { DEFAULT_CHARACTER_DARES, DEFAULT_GENDER_DARES, DIFFICULTY_LABELS, MAX_DIFFICULTY, uid } from "../defaults";
import { Button, Input, Select } from "./ui";
import { cn } from "../utils/cn";

interface Props {
  catalog: DareCatalog;
  players: Player[]; // active players only
  onChange: (c: DareCatalog) => void;
}

type TabKey = { kind: "gender"; sex: Sex } | { kind: "character"; playerId: string };

export default function DareEditor({ catalog, players, onChange }: Props) {
  const [tab, setTab] = useState<TabKey>({ kind: "gender", sex: "male" });
  const [filter, setFilter] = useState<number>(0);
  const [newText, setNewText] = useState("");
  const [newDiff, setNewDiff] = useState(1);

  const list: Dare[] = useMemo(() => {
    if (tab.kind === "gender") return catalog.gender[tab.sex] ?? [];
    return catalog.character[tab.playerId] ?? [];
  }, [catalog, tab]);

  const setList = (next: Dare[]) => {
    if (tab.kind === "gender") onChange({ ...catalog, gender: { ...catalog.gender, [tab.sex]: next } });
    else onChange({ ...catalog, character: { ...catalog.character, [tab.playerId]: next } });
  };

  const add = () => {
    const text = newText.trim();
    if (!text) return;
    setList([...list, { id: uid("dare"), text, difficulty: newDiff }]);
    setNewText("");
  };

  const update = (id: string, patch: Partial<Dare>) => setList(list.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  const remove = (id: string) => setList(list.filter((d) => d.id !== id));

  const resetTab = () => {
    if (tab.kind === "gender") {
      setList(DEFAULT_GENDER_DARES[tab.sex].map(([difficulty, text]) => ({ id: uid("dare"), difficulty, text })));
    } else {
      setList(DEFAULT_CHARACTER_DARES.map(([difficulty, text]) => ({ id: uid("dare"), difficulty, text })));
    }
  };

  const visible = filter ? list.filter((d) => d.difficulty === filter) : list;
  const counts = Array.from({ length: MAX_DIFFICULTY }, (_, i) => list.filter((d) => d.difficulty === i + 1).length);

  const isActive = (t: TabKey) =>
    t.kind === tab.kind && (t.kind === "gender" ? t.sex === (tab as { sex: Sex }).sex : t.playerId === (tab as { playerId: string }).playerId);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        <TabButton active={isActive({ kind: "gender", sex: "male" })} onClick={() => setTab({ kind: "gender", sex: "male" })} color="sky">
          ♂ Male dares
        </TabButton>
        <TabButton active={isActive({ kind: "gender", sex: "female" })} onClick={() => setTab({ kind: "gender", sex: "female" })} color="pink">
          ♀ Female dares
        </TabButton>
        {players.map((p) => (
          <TabButton
            key={p.id}
            active={isActive({ kind: "character", playerId: p.id })}
            onClick={() => setTab({ kind: "character", playerId: p.id })}
            color="violet"
          >
            ★ {p.name || "Unnamed"}
          </TabButton>
        ))}
      </div>

      <p className="mb-3 text-xs text-slate-400">
        {tab.kind === "gender"
          ? `Dares for every ${tab.sex} player. `
          : `Character-specific dares that only ${players.find((p) => p.id === tab.playerId)?.name ?? "this player"} can get. `}
        Both lists are pooled together when the loser draws a dare. Placeholders:{" "}
        <code className="rounded bg-white/10 px-1">{"{loser}"}</code> <code className="rounded bg-white/10 px-1">{"{winner}"}</code>{" "}
        <code className="rounded bg-white/10 px-1">{"{random}"}</code> <code className="rounded bg-white/10 px-1">{"{he}"}</code>{" "}
        <code className="rounded bg-white/10 px-1">{"{him}"}</code> <code className="rounded bg-white/10 px-1">{"{his}"}</code>
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setFilter(0)}
          className={cn("rounded-full px-2.5 py-1 text-xs", filter === 0 ? "bg-white text-slate-900" : "bg-white/10 text-slate-300 hover:bg-white/20")}
        >
          All ({list.length})
        </button>
        {counts.map((n, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setFilter(i + 1)}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs",
              filter === i + 1 ? "bg-white text-slate-900" : "bg-white/10 text-slate-300 hover:bg-white/20",
              n === 0 && "opacity-50",
            )}
          >
            {i + 1} · {DIFFICULTY_LABELS[i + 1]} ({n})
          </button>
        ))}
        <button type="button" onClick={resetTab} className="ml-auto text-xs text-slate-400 underline-offset-2 hover:text-white hover:underline">
          Reset this list
        </button>
      </div>

      <ul className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
        {visible.map((d) => (
          <li key={d.id} className="flex items-start gap-1.5">
            <Select value={d.difficulty} onChange={(e) => update(d.id, { difficulty: Number(e.target.value) })} className="w-20 shrink-0 py-1.5">
              {Array.from({ length: MAX_DIFFICULTY }, (_, i) => (
                <option key={i} value={i + 1}>
                  Lv {i + 1}
                </option>
              ))}
            </Select>
            <textarea
              value={d.text}
              onChange={(e) => update(d.id, { text: e.target.value })}
              rows={1}
              className="min-h-[34px] w-full resize-y rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 text-sm text-white focus:border-fuchsia-400/60 focus:outline-none"
            />
            <button type="button" onClick={() => remove(d.id)} className="rounded p-1.5 text-rose-400 hover:bg-rose-500/20" title="Delete">
              ✕
            </button>
          </li>
        ))}
        {visible.length === 0 && <li className="py-4 text-center text-xs italic text-slate-500">No dares here yet.</li>}
      </ul>

      <div className="mt-3 flex gap-1.5">
        <Select value={newDiff} onChange={(e) => setNewDiff(Number(e.target.value))} className="w-20 shrink-0">
          {Array.from({ length: MAX_DIFFICULTY }, (_, i) => (
            <option key={i} value={i + 1}>
              Lv {i + 1}
            </option>
          ))}
        </Select>
        <Input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="New dare… e.g. {loser} has to …"
        />
        <Button variant="secondary" onClick={add}>
          + Add
        </Button>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
  color,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color: "sky" | "pink" | "violet";
}) {
  const activeCls = { sky: "bg-sky-600 text-white", pink: "bg-pink-600 text-white", violet: "bg-violet-600 text-white" }[color];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("rounded-lg px-3 py-1.5 text-sm font-medium transition-colors", active ? activeCls : "bg-white/5 text-slate-300 hover:bg-white/15")}
    >
      {children}
    </button>
  );
}
