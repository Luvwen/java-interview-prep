import { useEffect, useState } from "react";
import { api } from "../api";
import type { Quiz, QuizResult } from "../types";
import OrderQuestion from "../components/OrderQuestion";

function QuizPage({
  moduleId,
  onExit,
}: {
  moduleId: string;
  onExit: () => void;
}) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selected, setSelected] = useState<number[][]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getQuiz(moduleId)
      .then((quiz) => {
        setQuiz(quiz);
        setSelected(
          quiz.questions.map((q) =>
            q.type === "ORDER"
              ? q.options.map((_, i) => i)
              : []
          )
        );
        setResult(null);
      })
      .catch((err: Error) => setError(err.message));
  }, [moduleId]);

  if (error) return <p className="error">{error}</p>;
  if (!quiz) return <p className="hint">Cargando quiz...</p>;

  const toggleOption = (questionIndex: number, optionIndex: number) => {
    const type = quiz.questions[questionIndex].type;
    setSelected((prev) => {
      const next = prev.map((question) => [...question]);
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
    setSubmitting(true);
    try {
      const quizResult = await api.submitQuiz(moduleId, selected);
      setResult(quizResult);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const answeredAll = selected.every(
    (question, i) =>
      question.length > 0 ||
      quiz.questions[i].type === "ORDER"
  );

  if (result) {
    const percent = Math.round((result.score / result.total) * 100);
    return (
      <section className="quiz-result">
        <h2>Resultado</h2>
        <p className={result.passed ? "passed" : "failed"}>
          {percent}% &mdash; {result.passed ? "Aprobado" : "Desaprobado"}
        </p>
        <p className="score">
          {result.score} / {result.total} correctas
        </p>
        <p className="module-state-note">
          {result.passed
            ? "Este modulo quedo marcado como completado."
            : "El modulo queda en curso: aproba al menos el 70% para completarlo."}
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

  return (
    <section className="quiz">
      <button className="link" onClick={onExit}>
        &larr; Salir
      </button>
      <h2>Quiz</h2>
      {quiz.questions.map((question, qIndex) => (
        <fieldset key={question.id} className="question">
          <legend>
            {qIndex + 1}. {question.text}
            <span className="type-hint">
              {question.type === "SINGLE"
                ? "Opcion unica"
                : question.type === "MULTIPLE"
                  ? "Opcion multiple"
                  : question.type === "ORDER"
                    ? "Ordenar bloques"
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
        disabled={!answeredAll || submitting}
        onClick={submit}
      >
        {submitting ? "Enviando..." : "Enviar respuestas"}
      </button>
    </section>
  );
}

export default QuizPage;
