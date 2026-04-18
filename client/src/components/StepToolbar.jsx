export default function StepToolbar({
  stepIndex,
  totalSteps,
  playing,
  onPrev,
  onNext,
  onReset,
  onPlayPause,
  speedMs = 650,
  onSpeedChange,
}) {
  const atStart = stepIndex <= 0;
  const atEnd = stepIndex >= totalSteps - 1;

  return (
    <div className="viz-toolbar">
      <button type="button" className="btn" onClick={onReset} disabled={atStart && stepIndex === 0}>
        Reset
      </button>
      <button type="button" className="btn" onClick={onPrev} disabled={atStart}>
        Prev
      </button>
      <button type="button" className="btn btn-primary" onClick={onPlayPause}>
        {playing ? "Pause" : "Play"}
      </button>
      <button type="button" className="btn" onClick={onNext} disabled={atEnd}>
        Next
      </button>
      <span className="pill mono">
        Step {Math.min(stepIndex + 1, Math.max(totalSteps, 1))} / {Math.max(totalSteps, 1)}
      </span>
      {typeof onSpeedChange === "function" ? (
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--muted)", fontSize: "0.85rem" }}>
          Speed
          <input
            type="range"
            min={200}
            max={1400}
            step={50}
            value={speedMs}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
          />
        </label>
      ) : null}
    </div>
  );
}
