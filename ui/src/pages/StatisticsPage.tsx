import { useEffect, useState } from "react";
import { api } from "../api";
import type { Attempt } from "../types";

interface ModuleStats {
  moduleId: string;
  title: string;
  correct: number;
  wrong: number;
  bestPercent: number;
  avgPercent: number;
  avgTimeSeconds: number;
  attempts: number;
}

function StatisticsPage({ onOpenModule }: { onOpenModule: (id: string) => void }) {
  const [stats, setStats] = useState<Record<string, ModuleStats> | null>(null);
  const [streak, setStreak] = useState<{ current: number; lastDate: string | null } | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/streak").then((r) => r.json()),
      api.getProgress(),
    ])
      .then(([statsData, streakData, progress]) => {
        setStats(statsData);
        setStreak(streakData);
        setAttempts(progress.attempts ?? []);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p className="hint">Cargando estadisticas...</p>;

  const entries = Object.values(stats);
  const totalCorrect = entries.reduce((s, e) => s + e.correct, 0);
  const totalWrong = entries.reduce((s, e) => s + e.wrong, 0);
  const totalAttempts = entries.reduce((s, e) => s + e.attempts, 0);

  return (
    <section>
      <h2>Estadisticas</h2>

      <div className="stats-summary">
        <div className="stat-card">
          <span className="stat-value">{totalAttempts}</span>
          <span className="stat-label">Intentos totales</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalCorrect}</span>
          <span className="stat-label">Correctas</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalWrong}</span>
          <span className="stat-label">Incorrectas</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{streak?.current ?? 0}</span>
          <span className="stat-label">Racha (dias)</span>
        </div>
      </div>

      <h3>Por modulo</h3>
      <ul className="stats-list">
        {entries.map((stat) => {
          const total = stat.correct + stat.wrong;
          const percent = total > 0 ? Math.round((stat.correct * 100) / total) : 0;
          const weak = percent < 60 && total > 0;
          return (
            <li key={stat.moduleId} className={weak ? "stat-weak" : ""}>
              <div className="stat-header">
                <button className="link" onClick={() => onOpenModule(stat.moduleId)}>
                  {stat.title}
                </button>
                {weak && <span className="badge badge-weak">Debil</span>}
                <span className="stat-attempts">{stat.attempts} intentos</span>
              </div>
              <div className="stat-bar-container">
                <div className="stat-bar">
                  <div className="stat-bar-fill" style={{ width: `${percent}%` }} />
                </div>
                <span className="stat-percent">{percent}%</span>
              </div>
            </li>
          );
        })}
      </ul>

      {attempts.length > 0 && (
        <>
          <h3>Intentos recientes</h3>
          <ul className="attempts-list">
            {attempts.slice(-10).reverse().map((attempt, i) => (
              <li key={i}>
                <span className={`attempt-mode ${attempt.passed ? "passed" : "failed"}`}>
                  {attempt.mode}
                </span>
                <span>
                  {attempt.score}/{attempt.total}
                </span>
                <span className="hint">{attempt.date}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export default StatisticsPage;
