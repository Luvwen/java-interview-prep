import { useEffect, useState } from "react";
import { api } from "../api";
import type { Progress } from "../types";
import StateBadge from "../components/StateBadge";

function ProgressPage({
  onOpenModule,
}: {
  onOpenModule: (id: string) => void;
}) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const loadProgress = () =>
    api
      .getProgress()
      .then(setProgress)
      .catch((err: Error) => setError(err.message));

  useEffect(() => {
    loadProgress();
  }, []);

  const resetProgress = async () => {
    if (!confirm("Esto borrara todo tu progreso. Estas seguro?")) return;
    setResetting(true);
    try {
      await api.resetProgress();
      await loadProgress();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setResetting(false);
    }
  };

  if (error) return <p className="error">{error}</p>;
  if (!progress) return <p className="hint">Cargando progreso...</p>;

  const entries = Object.entries(progress.moduleStates);
  const completed = entries.filter(([, state]) => state === "COMPLETED").length;

  return (
    <section>
      <h2>Progreso</h2>
      <div className="overall">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress.overallPercent}%` }}
          />
        </div>
        <span>{progress.overallPercent}% global</span>
      </div>
      <p className="summary">
        {completed} de {entries.length} modulos completados
      </p>
      <ul className="progress-list">
        {entries.map(([id, state]) => (
          <li key={id}>
            <button className="link" onClick={() => onOpenModule(id)}>
              {id}
            </button>
            <StateBadge state={state} />
          </li>
        ))}
      </ul>
      <div className="actions-row" style={{ marginTop: 24 }}>
        <button
          className="secondary"
          disabled={resetting}
          onClick={resetProgress}
        >
          {resetting ? "Reseteando..." : "Resetear progreso"}
        </button>
      </div>
    </section>
  );
}

export default ProgressPage;
