import { useEffect, useState } from "react";
import { api, ApiError } from "../api";
import type { ModuleSummary, Quiz, QuizResult } from "../types";
import OrderQuestion from "../components/OrderQuestion";
import ErrorPage from "../components/ErrorPage";

function MixedQuizPage({ onExit }: { onExit: () => void }) {
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selected, setSelected] = useState<number[][]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  useEffect(() => {
    api.listModules().then(setModules).catch((err: Error) => {
      if (err instanceof ApiError) {
        setErrorStatus(err.status);
      } else {
        setError(err.message);
      }
    });
  }, []);

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedModules(modules.map((m) => m.id));
  };

  const startQuiz = async () => {
    if (selectedModules.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const q = await api.getMixedQuiz(selectedModules, count);
      setQuiz(q);
      setSelected(
        q.questions.map((question) =>
          question.type === "ORDER"
            ? question.options.map((_, i) => i)
            : []
        )
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorStatus(err.status);
      } else {
        setError((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleOption = (questionIndex: number, optionIndex: number) => {
    const type = quiz!.questions[questionIndex].type;
    setSelected((prev) => {
      const next = prev.map((q) => [...q]);
      if (type === "SINGLE" || type === "TRUE_FALSE") {
        next[questionIndex] = [optionIndex];
      } else {
        const current = next[questionIndex];
        next[questionIndex] = current.includes(optionIndex)
          ? current.filter((i) => i !== optionIndex)
          : [...current, optionIndex];
      }
      return next;
    });
  };

  const submit = async () => {
    setLoading(true);
    try {
      const res = await api.submitQuizV2(
        quiz!.id,
        selectedModules,
        selected
      );
      setResult(res);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorStatus(err.status);
      } else {
        setError((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (errorStatus) return <ErrorPage status={errorStatus} onBack={onExit} />;
  if (error) return <p className="error">{error}</p>;

  if (result) {
    const percent = Math.round((result.score / result.total) * 100);
    return (
      <section className="quiz-result">
        <h2>Quiz Mixto - Resultado</h2>
        <p className={result.passed ? "passed" : "failed"}>
          {percent}% &mdash; {result.passed ? "Aprobado" : "Desaprobado"}
        </p>
        <p className="score">
          {result.score} / {result.total} correctas
        </p>
        <ul className="feedback-list">
          {result.feedback.map((feedback, i) => (
            <li key={feedback.questionId} className={feedback.correct ? "correct" : "incorrect"}>
              <strong>
                {i + 1}. {feedback.correct ? "Correcta" : "Incorrecta"}
              </strong>
              <p>{feedback.explanation}</p>
            </li>
          ))}
        </ul>
        <div className="actions">
          <button className="primary" onClick={() => setResult(null)}>
            Reintentar
          </button>
          <button onClick={onExit}>Volver</button>
        </div>
      </section>
    );
  }

  if (quiz) {
    const answeredAll = selected.every((q) => q.length > 0);
    return (
      <section className="quiz">
        <button className="link" onClick={onExit}>
          &larr; Salir
        </button>
        <h2>Quiz Mixto</h2>
        <p className="hint">{quiz.questions.length} preguntas de {selectedModules.length} modulos</p>
        {quiz.questions.map((question, qIndex) => (
          <fieldset key={question.id} className="question">
            <legend>
              {qIndex + 1}. {question.text}
              <span className="type-hint">
                {question.type === "SINGLE"
                  ? "Opcion unica"
                  : question.type === "MULTIPLE"
                    ? "Opcion multiple"
                    : "Verdadero o falso"}
              </span>
            </legend>
            {question.type === "TRUE_FALSE" ? (
              <div className="toggle" role="group">
                {question.options.map((option, oIndex) => (
                  <button
                    key={oIndex}
                    type="button"
                    className={
                      selected[qIndex]?.includes(oIndex) ? "toggle-btn selected" : "toggle-btn"
                    }
                    onClick={() => toggleOption(qIndex, oIndex)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : question.type === "ORDER" ? (
              <OrderQuestion
                options={question.options}
                value={selected[qIndex] ?? question.options.map((_, i) => i)}
                onChange={(order) => {
                  setSelected((prev) => {
                    const next = [...prev];
                    next[qIndex] = order;
                    return next;
                  });
                }}
              />
            ) : (
              question.options.map((option, oIndex) => (
                <label key={oIndex} className="option">
                  <input
                    type={question.type === "SINGLE" ? "radio" : "checkbox"}
                    name={question.id}
                    checked={selected[qIndex]?.includes(oIndex) ?? false}
                    onChange={() => toggleOption(qIndex, oIndex)}
                  />
                  <span>{option}</span>
                </label>
              ))
            )}
          </fieldset>
        ))}
        <button
          className="primary"
          disabled={!answeredAll || loading}
          onClick={submit}
        >
          {loading ? "Enviando..." : "Enviar respuestas"}
        </button>
      </section>
    );
  }

  return (
    <section>
      <button className="link" onClick={onExit}>
        &larr; Volver
      </button>
      <h2>Quiz Mixto Aleatorio</h2>
      <p className="description">
        Selecciona los modulos y la cantidad de preguntas. Las preguntas se eligen
        aleatoriamente del banco, mezclando formatos (opcion unica, multiple, verdadero/falso).
      </p>
      <div className="module-selector">
        <div className="selector-header">
          <h3>Modulos</h3>
          <button className="link" onClick={selectAll}>Seleccionar todos</button>
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
      <div className="count-selector">
        <label>
          Cantidad de preguntas:
          <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
        </label>
      </div>
      <div className="actions-row">
        <button
          className="primary"
          disabled={selectedModules.length === 0 || loading}
          onClick={startQuiz}
        >
          {loading ? "Generando..." : "Iniciar quiz"}
        </button>
      </div>
    </section>
  );
}

export default MixedQuizPage;
