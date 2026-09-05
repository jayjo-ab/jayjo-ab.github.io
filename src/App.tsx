import { useEffect, useRef, useState } from "react";
import type { DareCatalog, Player, Settings } from "./types";
import { loadState, saveState, clearState } from "./storage";
import MainMenu from "./components/MainMenu";
import Game from "./components/Game";

export default function App() {
  const [initial] = useState(() => loadState());
  const [players, setPlayers] = useState<Player[]>(initial.players);
  const [dares, setDares] = useState<DareCatalog>(initial.dares);
  const [settings, setSettings] = useState<Settings>(initial.settings);
  const [screen, setScreen] = useState<"menu" | "game">("menu");
  const [savedFlash, setSavedFlash] = useState(false);
  const firstRun = useRef(true);

  // Persist everything on change (debounced)
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const t = setTimeout(() => {
      saveState({ players, dares, settings });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1200);
    }, 400);
    return () => clearTimeout(t);
  }, [players, dares, settings]);

  const resetAll = () => {
    clearState();
    const fresh = loadState();
    setPlayers(fresh.players);
    setDares(fresh.dares);
    setSettings(fresh.settings);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 [background-image:radial-gradient(ellipse_at_top,_rgba(168,85,247,0.15),_transparent_60%),radial-gradient(ellipse_at_bottom_right,_rgba(236,72,153,0.12),_transparent_60%)]">
      {screen === "menu" ? (
        <MainMenu
          players={players}
          dares={dares}
          settings={settings}
          onPlayersChange={setPlayers}
          onDaresChange={setDares}
          onSettingsChange={setSettings}
          onStart={() => setScreen("game")}
          onResetAll={resetAll}
          savedFlash={savedFlash}
        />
      ) : (
        <Game
          key="game"
          initialPlayers={players.slice(0, settings.playerCount)}
          dares={dares}
          settings={settings}
          onExit={() => setScreen("menu")}
        />
      )}
    </div>
  );
}
