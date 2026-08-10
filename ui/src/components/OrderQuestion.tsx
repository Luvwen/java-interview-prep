import { useState } from "react";

function OrderQuestion({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: number[];
  onChange: (order: number[]) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const items = value.map((idx) => ({ originalIndex: idx, text: options[idx] }));

  const moveUp = (pos: number) => {
    if (pos === 0) return;
    const next = [...value];
    [next[pos - 1], next[pos]] = [next[pos], next[pos - 1]];
    onChange(next);
  };

  const moveDown = (pos: number) => {
    if (pos >= value.length - 1) return;
    const next = [...value];
    [next[pos], next[pos + 1]] = [next[pos + 1], next[pos]];
    onChange(next);
  };

  const handleDragStart = (pos: number) => setDragIndex(pos);

  const handleDragOver = (e: React.DragEvent, pos: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === pos) return;
    const next = [...value];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(pos, 0, moved);
    setDragIndex(pos);
    onChange(next);
  };

  const handleDragEnd = () => setDragIndex(null);

  return (
    <ol className="order-list">
      {items.map((item, pos) => (
        <li
          key={`${item.originalIndex}-${pos}`}
          className={`order-item ${dragIndex === pos ? "dragging" : ""}`}
          draggable
          onDragStart={() => handleDragStart(pos)}
          onDragOver={(e) => handleDragOver(e, pos)}
          onDragEnd={handleDragEnd}
        >
          <span className="order-grip">:::</span>
          <span className="order-text">{item.text}</span>
          <span className="order-buttons">
            <button
              type="button"
              className="order-btn"
              disabled={pos === 0}
              onClick={() => moveUp(pos)}
            >
              ▲
            </button>
            <button
              type="button"
              className="order-btn"
              disabled={pos === value.length - 1}
              onClick={() => moveDown(pos)}
            >
              ▼
            </button>
          </span>
        </li>
      ))}
    </ol>
  );
}

export default OrderQuestion;
