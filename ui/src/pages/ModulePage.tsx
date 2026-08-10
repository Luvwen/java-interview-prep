import { useEffect, useState } from "react";
import { api } from "../api";
import type { ModuleDetail, ModuleState } from "../types";
import StateBadge from "../components/StateBadge";

function ModulePage({
  moduleId,
  onOpenQuiz,
  onBack,
}: {
  moduleId: string;
  onOpenQuiz: () => void;
  onBack: () => void;
}) {
  const [module, setModule] = useState<ModuleDetail | null>(null);
  const [state, setState] = useState<ModuleState>("PENDING");
  const [completing, setCompleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getModule(moduleId), api.getProgress()])
      .then(([detail, progress]) => {
        setModule(detail);
        setState(progress.moduleStates[moduleId] ?? "PENDING");
      })
      .catch((err: Error) => setError(err.message));
  }, [moduleId]);

  if (error) return <p className="error">{error}</p>;
  if (!module) return <p className="hint">Cargando modulo...</p>;

  const markCompleted = async () => {
    setCompleting(true);
    try {
      await api.completeModule(moduleId);
      setState("COMPLETED");
      setMessage("Modulo marcado como completado.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <section className="module-detail">
      <button className="link" onClick={onBack}>
        &larr; Volver
      </button>
      <header className="detail-header">
        <h2>{module.title}</h2>
        <StateBadge state={state} />
      </header>
      <p className="description">{module.description}</p>
      <div className="topics">
        {module.topics.map((topic) => (
          <article key={topic.id} className="topic">
            <h3>{topic.title}</h3>
            <p className="content">{topic.content}</p>
            {topic.examples.length > 0 && (
              <pre className="code-block">{topic.examples.join("\n\n")}</pre>
            )}
          </article>
        ))}
      </div>
      <div className="actions-row">
        <button className="primary" onClick={onOpenQuiz}>
          Ir al quiz
        </button>
        <button
          className="secondary"
          disabled={state === "COMPLETED" || completing}
          onClick={markCompleted}
        >
          {state === "COMPLETED"
            ? "Completado"
            : completing
              ? "Marcando..."
              : "Marcar como completado"}
        </button>
      </div>
      {message && <p className="success">{message}</p>}
    </section>
  );
}

export default ModulePage;
