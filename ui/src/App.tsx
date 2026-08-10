import { useState } from "react";
import CatalogPage from "./pages/CatalogPage";
import ModulePage from "./pages/ModulePage";
import ProgressPage from "./pages/ProgressPage";
import QuizPage from "./pages/QuizPage";
import MixedQuizPage from "./pages/MixedQuizPage";
import ErrorReviewPage from "./pages/ErrorReviewPage";
import TimeAttackPage from "./pages/TimeAttackPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import ExamPage from "./pages/ExamPage";
import StatisticsPage from "./pages/StatisticsPage";

type View =
  | "catalog"
  | "module"
  | "quiz"
  | "progress"
  | "activities"
  | "mixed-quiz"
  | "error-review"
  | "time-attack"
  | "flashcards"
  | "exam"
  | "statistics";

function App() {
  const [view, setView] = useState<View>("catalog");
  const [moduleId, setModuleId] = useState<string | null>(null);

  const openModule = (id: string) => {
    setModuleId(id);
    setView("module");
  };

  const backToCatalog = () => setView("catalog");

  const isActivity =
    view === "activities" ||
    view === "mixed-quiz" ||
    view === "error-review" ||
    view === "time-attack" ||
    view === "flashcards" ||
    view === "exam" ||
    view === "statistics";

  return (
    <div className="app">
      <header className="app-header">
        <h1>Java Theory</h1>
        <nav className="app-nav">
          <button
            className={view === "catalog" ? "active" : ""}
            onClick={() => setView("catalog")}
          >
            Modulos
          </button>
          <button className={isActivity ? "active" : ""} onClick={() => setView("activities")}>
            Actividades
          </button>
          <button
            className={view === "progress" ? "active" : ""}
            onClick={() => setView("progress")}
          >
            Progreso
          </button>
        </nav>
      </header>
      <main className="app-content">
        {view === "catalog" && <CatalogPage onOpenModule={openModule} />}
        {view === "module" && moduleId && (
          <ModulePage moduleId={moduleId} onOpenQuiz={() => setView("quiz")} onBack={backToCatalog} />
        )}
        {view === "quiz" && moduleId && (
          <QuizPage moduleId={moduleId} onExit={backToCatalog} />
        )}
        {view === "activities" && (
          <section>
            <h2>Actividades</h2>
            <p className="description">
              Practica con modos de juego diferentes al quiz normal.
            </p>
            <ul className="activity-grid">
              <li>
                <button className="activity-card" onClick={() => setView("time-attack")}>
                  <h3>Contra Reloj</h3>
                  <p>
                    Responde contra un cronometro por pregunta. Pon a prueba
                    tu velocidad.
                  </p>
                </button>
              </li>
              <li>
                <button className="activity-card" onClick={() => setView("mixed-quiz")}>
                  <h3>Quiz Mixto</h3>
                  <p>
                    Selecciona modulos y cantidad de preguntas. Mezcla de formatos
                    (opcion unica, multiple, verdadero/falso).
                  </p>
                </button>
              </li>
              <li>
                <button className="activity-card" onClick={() => setView("error-review")}>
                  <h3>Repasar Errores</h3>
                  <p>
                    Repasa las preguntas que fallaste. Acertar 2 veces seguidas las
                    elimina del banco.
                  </p>
                </button>
              </li>
              <li>
                <button className="activity-card" onClick={() => setView("flashcards")}>
                  <h3>Flashcards</h3>
                  <p>
                    Voltea tarjetas con conceptos clave y autoevalua si los sabias.
                  </p>
                </button>
              </li>
              <li>
                <button className="activity-card" onClick={() => setView("exam")}>
                  <h3>Examen Simulado</h3>
                  <p>
                    Simula una entrevista: tiempo limitado, sin ir atras, feedback
                    solo al finalizar.
                  </p>
                </button>
              </li>
              <li>
                <button className="activity-card" onClick={() => setView("statistics")}>
                  <h3>Estadisticas</h3>
                  <p>
                    Ve tu desempeno por modulo: aciertos, errores, intentos y topicos
                    debiles.
                  </p>
                </button>
              </li>
            </ul>
          </section>
        )}
        {view === "time-attack" && (
          <TimeAttackPage onExit={() => setView("activities")} />
        )}
        {view === "mixed-quiz" && (
          <MixedQuizPage onExit={() => setView("activities")} />
        )}
        {view === "error-review" && (
          <ErrorReviewPage onExit={() => setView("activities")} />
        )}
        {view === "flashcards" && (
          <FlashcardsPage onExit={() => setView("activities")} />
        )}
        {view === "exam" && (
          <ExamPage onExit={() => setView("activities")} />
        )}
        {view === "statistics" && (
          <StatisticsPage onOpenModule={openModule} />
        )}
        {view === "progress" && <ProgressPage onOpenModule={openModule} />}
      </main>
    </div>
  );
}

export default App;
