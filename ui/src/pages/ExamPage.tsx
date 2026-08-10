import { useEffect, useState, useCallback } from "react";
import { api, ApiError } from "../api";
import type { ModuleSummary, Quiz, QuizResult } from "../types";
import TimerBar from "../components/TimerBar";
import OrderQuestion from "../components/OrderQuestion";
import ErrorPage from "../components/ErrorPage";

function ExamPage({ onExit }: { onExit: () => void }) {
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState(25);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[][]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [examStarted, setExamStarted] = useState(false);

  useEffect(() => {
    api.listModules().then(setModules).catch((err: Error) => setError(err.message));
  }, []);

  const startExam = async () => {
    if (selectedModules.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const q = await api.getMixedQuiz(selectedModules, questionCount);
      setQuiz(q);
      setAnswers(q.questions.map(() => []));
      setCurrent(0);
      setExamStarted(true);
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

  const timeUp = useCallback(() => {
    submitExam();
  }, [answers, quiz]);

  const toggleOption = (optionIndex: number) => {
    if (!quiz) return;
    const type = quiz.questions[current].type;
    setAnswers((prev) => {
      const next = [...prev];
      if (type === "SINGLE" || type === "TRUE_FALSE") {
        next[current] = [optionIndex];
      } else {
        const currentAnswers = next[current];
        next[current] = currentAnswers.includes(optionIndex)
          ? currentAnswers.filter((i) => i !== optionIndex)
          : [...currentAnswers, optionIndex];
      }
      return next;
    });
  };

  const nextQuestion = () => {
    if (current + 1 < quiz!.questions.length) {
      setCurrent(current + 1);
    }
  };

  const prevQuestion = () => {
    // No going back in exam mode
  };

  const submitExam = async () => {
    setExamStarted(false);
    setLoading(true);
    try {
      const totalSeconds = timeLimit * 60;
      const res = await api.submitQuizV2(
        quiz!.id,
        selectedModules,
        answers,
        totalSeconds
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

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  if (errorStatus) return <ErrorPage status={errorStatus} onBack={onExit} />;
  if (error) return <p className="error">{error}</p>;

  if (result) {
    const percent = Math.round((result.score / result.total) * 100);
    return (
      <section className="quiz-result">
        <h2>Examen - Resultado</h2>
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
            Repetir examen
          </button>
          <button onClick={onExit}>Volver</button>
        </div>
      </section>
    );
  }

  if (quiz && examStarted) {
    const question = quiz.questions[current];
    const answeredCount = answers.filter((a) => a.length > 0).length;
    return (
      <section className="quiz">
        <TimerBar
          totalSeconds={timeLimit * 60}
          onTimeUp={timeUp}
          running={examStarted}
        />
        <div className="exam-nav">
          <span className="quiz-progress-text">
            Pregunta {current + 1} de {quiz.questions.length}
          </span>
          <span className="hint">{answeredCount} respondidas</span>
        </div>
        <fieldset className="question" key={question.id}>
          <legend>
            {question.text}
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
                    answers[current]?.includes(oIndex) ? "toggle-btn selected" : "toggle-btn"
                  }
                  onClick={() => toggleOption(oIndex)}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : question.type === "ORDER" ? (
            <OrderQuestion
              options={question.options}
              value={answers[current] ?? question.options.map((_, i) => i)}
              onChange={(order) => {
                setAnswers((prev) => {
                  const next = [...prev];
                  next[current] = order;
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
                  checked={answers[current]?.includes(oIndex) ?? false}
                  onChange={() => toggleOption(oIndex)}
                />
                <span>{option}</span>
              </label>
            ))
          )}
        </fieldset>
        <div className="actions-row">
          <button
            className="secondary"
            disabled={current === 0}
            onClick={prevQuestion}
          >
            Anterior
          </button>
          {current + 1 < quiz.questions.length ? (
            <button className="primary" onClick={nextQuestion}>
              Siguiente
            </button>
          ) : (
            <button className="primary" onClick={submitExam}>
              Entregar examen
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section>
      <button className="link" onClick={onExit}>
        &larr; Volver
      </button>
      <h2>Examen Simulado</h2>
      <p className="description">
        Simula una entrevista tecnica: sin ir hacia atras, sin feedback hasta el
        final, con tiempo limitado.
      </p>
      <div className="config-form">
        <div className="form-field">
          <label>
            Modulos:
            <div className="module-checkboxes">
              {modules.map((m) => (
                <label key={m.id} className="option">
                  <input
                    type="checkbox"
                    checked={selectedModules.includes(m.id)}
                    onChange={() => toggleModule(m.id)}
                  />
                  <span>{m.title}</span>
                </label>
              ))}
            </div>
          </label>
        </div>
        <div className="form-field">
          <label>
            Cantidad de preguntas:
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
          </label>
        </div>
        <div className="form-field">
          <label>
            Tiempo limite (minutos):
            <select
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
            >
              <option value={10}>10 min</option>
              <option value={15}>15 min</option>
              <option value={25}>25 min</option>
              <option value={40}>40 min</option>
            </select>
          </label>
        </div>
        <div className="actions-row">
          <button
            className="primary"
            disabled={selectedModules.length === 0 || loading}
            onClick={startExam}
          >
            {loading ? "Generando..." : "Iniciar examen"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default ExamPage;
