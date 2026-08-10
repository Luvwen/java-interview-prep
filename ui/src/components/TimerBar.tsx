import { useEffect, useRef, useState } from "react";

function TimerBar({
  totalSeconds,
  onTimeUp,
  running,
}: {
  totalSeconds: number;
  onTimeUp: () => void;
  running: boolean;
}) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const startTime = useRef<number>(Date.now());
  const pausedRemaining = useRef(totalSeconds);

  useEffect(() => {
    if (running) {
      startTime.current = Date.now();
    } else {
      pausedRemaining.current = remaining;
    }
  }, [running]);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
      const left = pausedRemaining.current - elapsed;
      if (left <= 0) {
        setRemaining(0);
        clearInterval(interval);
        onTimeUp();
      } else {
        setRemaining(left);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [running, onTimeUp]);

  const percent = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isLow = remaining <= 10;

  return (
    <div className="timer-bar-container">
      <div className="timer-bar">
        <div
          className={`timer-fill ${isLow ? "timer-low" : ""}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className={`timer-text ${isLow ? "timer-low-text" : ""}`}>
        {minutes}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  );
}

export default TimerBar;
