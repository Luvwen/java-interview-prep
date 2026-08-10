import { useEffect, useState } from "react";
import { api } from "../api";
import type { ModuleSummary } from "../types";
import StateBadge from "../components/StateBadge";

function CatalogPage({ onOpenModule }: { onOpenModule: (id: string) => void }) {
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listModules()
      .then(setModules)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="hint">Cargando modulos...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <section>
      <h2>Modulos</h2>
      <ul className="module-grid">
        {modules.map((module) => (
          <li key={module.id}>
            <button className="module-card" onClick={() => onOpenModule(module.id)}>
              <StateBadge state={module.state} />
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default CatalogPage;
