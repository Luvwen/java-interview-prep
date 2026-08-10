import { useState } from "react";

function FlipCard({
  front,
  back,
  onKnow,
  onDontKnow,
}: {
  front: string;
  back: string;
  onKnow: () => void;
  onDontKnow: () => void;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flip-container">
      <div
        className={`flip-card ${flipped ? "flipped" : ""}`}
        onClick={() => setFlipped(!flipped)}
      >
        <div className="flip-front">
          <p>{front}</p>
          <span className="flip-hint">Toca para voltear</span>
        </div>
        <div className="flip-back">
          <p>{back}</p>
        </div>
      </div>
      {flipped && (
        <div className="flip-actions">
          <button className="secondary" onClick={onDontKnow}>
            No sabia
          </button>
          <button className="primary" onClick={onKnow}>
            Sabia
          </button>
        </div>
      )}
    </div>
  );
}

export default FlipCard;
