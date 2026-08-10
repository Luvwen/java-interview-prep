import { useEffect, useState, useCallback } from "react";
import { api, ApiError } from "../api";
import type { ModuleSummary, Quiz, QuizResult } from "../types";
import TimerBar from "../components/TimerBar";
import OrderQuestion from "../components/OrderQuestion";
import ErrorPage from "../components/ErrorPage";

function TimeAttackPage({ onExit }: { onExit: () => void }) {
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [secondsPerQuestion, setSecondsPerQuestion] = useState(30);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [answers, setAnswers] = useState<number[][]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);

  useEffect(() => {
    api.listModules().then(setModules).catch((err: Error) => {
      if (err instanceof ApiError) {
        setErrorStatus(err.status);
      } else {
        setError(err.message);
      }
    });
  }, []);

  const startQuiz = async () => {
    if (!selectedModule) return;
    setLoading(true);
    setError(null);
    try {
      const q = await api.getQuiz(selectedModule);
      setQuiz(q);
      setAnswers(
        q.questions.map((question) =>
          question.type === "ORDER"
            ? question.options.map((_, i) => i)
            : []
        )
      );
      setSelected([]);
      setCurrent(0);
      setTotalElapsed(0);
      setQuizStarted(true);
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
    if (!quiz) return;
    const newAnswers = [...answers];
    newAnswers[current] = selected.length > 0 ? selected : [];
    setAnswers(newAnswers);
    setSelected([]);

    if (current + 1 < quiz.questions.length) {
      setCurrent(current + 1);
    } else {
      submitAnswers(newAnswers);
    }
  }, [quiz, current, selected, answers]);

  const toggleOption = (optionIndex: number) => {
    const type = quiz!.questions[current].type;
    if (type === "SINGLE" || type === "TRUE_FALSE") {
      setSelected([optionIndex]);
    } else {
      setSelected((prev) =>
        prev.includes(optionIndex)
          ? prev.filter((i) => i !== optionIndex)
          : [...prev, optionIndex]
      );
    }
  };

  const nextQuestion = () => {
    const newAnswers = [...answers];
    newAnswers[current] = selected;
    setAnswers(newAnswers);
    setSelected([]);

    if (current + 1 < quiz!.questions.length) {
      setCurrent(current + 1);
    } else {
      submitAnswers(newAnswers);
    }
  };

  const submitAnswers = async (finalAnswers: number[][]) => {
    setQuizStarted(false);
    setLoading(true);
    try {
      const res = await api.submitQuizV2(
        quiz!.id,
        [selectedModule],
        finalAnswers,
        totalElapsed
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
    const minutes = Math.floor(totalElapsed / 60);
    const seconds = totalElapsed % 60;
    return (
      <section className="quiz-result">
        <h2>Contra Reloj - Resultado</h2>
        <p className={result.passed ? "passed" : "failed"}>
          {percent}% &mdash; {result.passed ? "Aprobado" : "Desaprobado"}
        </p>
        <p className="score">
          {result.score} / {result.total} correctas en {minutes}:{seconds.toString().padStart(2, "0")}
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

  if (quiz && quizStarted) {
    const question = quiz.questions[current];
    return (
      <section className="quiz">
        <TimerBar
          totalSeconds={secondsPerQuestion}
          onTimeUp={timeUp}
          running={quizStarted}
        />
        <div className="quiz-progress-text">
          Pregunta {current + 1} de {quiz.questions.length}
        </div>
        <fieldset className="question" key={question.id}>
          <legend>
            {question.text}
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
                    selected.includes(oIndex) ? "toggle-btn selected" : "toggle-btn"
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
              value={selected.length > 0 ? selected : question.options.map((_, i) => i)}
              onChange={(order) => setSelected(order)}
            />
          ) : (
            question.options.map((option, oIndex) => (
              <label key={oIndex} className="option">
                <input
                  type={question.type === "SINGLE" ? "radio" : "checkbox"}
                  name={question.id}
                  checked={selected.includes(oIndex)}
                  onChange={() => toggleOption(oIndex)}
                />
                <span>{option}</span>
              </label>
            ))
          )}
        </fieldset>
        <div className="actions-row">
          <button
            className="primary"
            disabled={selected.length === 0}
            onClick={nextQuestion}
          >
            {current + 1 < quiz.questions.length ? "Siguiente" : "Finalizar"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <button className="link" onClick={onExit}>
        &larr; Volver
      </button>
      <h2>Quiz Contra Reloj</h2>
      <p className="description">
        Responde antes de que se agote el tiempo por pregunta. Si el tiempo se
        agota, la pregunta se cuenta como incorrecta.
      </p>
      <div className="config-form">
        <div className="form-field">
          <label>
            Modulo:
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
            >
              <option value="">Seleccionar modulo</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-field">
          <label>
            Segundos por pregunta:
            <select
              value={secondsPerQuestion}
              onChange={(e) => setSecondsPerQuestion(Number(e.target.value))}
            >
              <option value={15}>15s</option>
              <option value={30}>30s</option>
              <option value={45}>45s</option>
              <option value={60}>60s</option>
            </select>
          </label>
        </div>
        <div className="actions-row">
          <button
            className="primary"
            disabled={!selectedModule || loading}
            onClick={startQuiz}
          >
            {loading ? "Cargando..." : "Iniciar"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default TimeAttackPage;
