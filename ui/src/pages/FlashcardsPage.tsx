import { useEffect, useState } from "react";
import { api } from "../api";
import type { ModuleSummary, ModuleDetail } from "../types";
import FlipCard from "../components/FlipCard";

interface Flashcard {
  moduleId: string;
  moduleTitle: string;
  topicId: string;
  title: string;
  content: string;
}

function FlashcardsPage({ onExit }: { onExit: () => void }) {
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [known, setKnown] = useState<string[]>([]);
  const [unknown, setUnknown] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionDone, setSessionDone] = useState(false);

  useEffect(() => {
    api.listModules().then(setModules).catch((err: Error) => setError(err.message));
  }, []);

  const startSession = async () => {
    if (selectedModules.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const allCards: Flashcard[] = [];
      for (const moduleId of selectedModules) {
        const detail: ModuleDetail = await api.getModule(moduleId);
        const mod = modules.find((m) => m.id === moduleId);
        for (const topic of detail.topics) {
          allCards.push({
            moduleId,
            moduleTitle: mod?.title ?? moduleId,
            topicId: topic.id,
            title: topic.title,
            content: topic.content.substring(0, 300) + (topic.content.length > 300 ? "..." : ""),
          });
        }
      }
      shuffle(allCards);
      setCards(allCards);
      setCurrentIndex(0);
      setKnown([]);
      setUnknown([]);
      setSessionDone(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const shuffle = <T,>(arr: T[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  };

  const markKnown = () => {
    const card = cards[currentIndex];
    setKnown((prev) => [...prev, card.topicId]);
    advance();
  };

  const markUnknown = () => {
    const card = cards[currentIndex];
    setUnknown((prev) => [...prev, card.topicId]);
    advance();
  };

  const advance = () => {
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setSessionDone(true);
    }
  };

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  if (error) return <p className="error">{error}</p>;

  if (sessionDone) {
    return (
      <section className="quiz-result">
        <h2>Sesion de Flashcards</h2>
        <p className="score">
          {known.length} sabia / {unknown.length} no sabia
        </p>
        {unknown.length > 0 && (
          <p className="hint">
            Repasa los temas que marcaste como "no sabia" para reforzar.
          </p>
        )}
        <div className="actions">
          <button className="primary" onClick={startSession}>
            Repetir sesion
          </button>
          <button onClick={onExit}>Volver</button>
        </div>
      </section>
    );
  }

  if (cards.length > 0) {
    const card = cards[currentIndex];
    return (
      <section>
        <div className="session-progress">
          {currentIndex + 1} / {cards.length}
        </div>
        <p className="hint">{card.moduleTitle}</p>
        <FlipCard
          front={card.title}
          back={card.content}
          onKnow={markKnown}
          onDontKnow={markUnknown}
        />
      </section>
    );
  }

  return (
    <section>
      <button className="link" onClick={onExit}>
        &larr; Volver
      </button>
      <h2>Flashcards</h2>
      <p className="description">
        Voltea las tarjetas y autoevalua si sabias el contenido. Las tarjetas
        que marques como "no sabia" volveran a aparecer al final de la sesion.
      </p>
      <div className="module-selector">
        <div className="selector-header">
          <h3>Modulos</h3>
          <button className="link" onClick={() => setSelectedModules(modules.map((m) => m.id))}>
            Seleccionar todos
          </button>
        </div>
        <ul className="module-checkboxes">
          {modules.map((m) => (
            <li key={m.id}>
              <label className="option">
                <input
                  type="checkbox"
                  checked={selectedModules.includes(m.id)}
                  onChange={() => toggleModule(m.id)}
                />
                <span>{m.title}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div className="actions-row">
        <button
          className="primary"
          disabled={selectedModules.length === 0 || loading}
          onClick={startSession}
        >
          {loading ? "Cargando..." : "Iniciar sesion"}
        </button>
      </div>
    </section>
  );
}

export default FlashcardsPage;
