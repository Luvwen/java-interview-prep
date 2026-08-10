import { useEffect, useState } from "react";
import { api, ApiError } from "../api";
import type { Quiz, QuizResult } from "../types";
import ErrorPage from "../components/ErrorPage";

function ErrorReviewPage({ onExit }: { onExit: () => void }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selected, setSelected] = useState<number[][]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  const loadQuiz = () => {
    setLoading(true);
    setError(null);
    api
      .getErrorReviewQuiz()
      .then((q) => {
        setQuiz(q);
        setSelected(q.questions.map(() => []));
        setResult(null);
      })
      .catch((err: Error) => {
        if (err instanceof ApiError) {
          setErrorStatus(err.status);
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQuiz();
  }, []);

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
      const res = await api.submitQuizV2(quiz!.id, [], selected);
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

  if (loading && !quiz) return <p className="hint">Cargando preguntas para repasar...</p>;
  if (errorStatus) return <ErrorPage status={errorStatus} onBack={onExit} />;
  if (error) return <p className="error">{error}</p>;

  if (result) {
    const percent = Math.round((result.score / result.total) * 100);
    const pending = result.feedback.filter((f) => !f.correct).length;
    return (
      <section className="quiz-result">
        <h2>Repaso de Errores - Resultado</h2>
        <p className={result.passed ? "passed" : "failed"}>
          {percent}% &mdash; {result.passed ? "Aprobado" : "Desaprobado"}
        </p>
        <p className="score">
          {result.score} / {result.total} correctas
        </p>
        {pending > 0 && (
          <p className="hint">
            Quedan {pending} pregunta{pending !== 1 ? "s" : ""} por repasar.
          </p>
        )}
        {pending === 0 && (
          <p className="success">
            Has dominado todas las preguntas que fallaste.
          </p>
        )}
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
          {pending > 0 && (
            <button className="primary" onClick={loadQuiz}>
              Repasar de nuevo
            </button>
          )}
          <button onClick={onExit}>Volver</button>
        </div>
      </section>
    );
  }

  if (quiz && quiz.questions.length === 0) {
    return (
      <section>
        <button className="link" onClick={onExit}>
          &larr; Volver
        </button>
        <h2>Repaso de Errores</h2>
        <p className="success">
          No hay preguntas pendientes para repasar. Responde quizzes para generar el banco de errores.
        </p>
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
        <h2>Repaso de Errores</h2>
        <p className="hint">
          {quiz.questions.length} pregunta{quiz.questions.length !== 1 ? "s" : ""} por repasar.
          Acertar 2 veces seguidas la elimina del banco.
        </p>
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

  return null;
}

export default ErrorReviewPage;
