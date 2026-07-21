type WallProps = {
  rows: Array<Array<"done" | "now" | "empty">>;
  dark?: boolean;
  maxWidth?: number;
};

export function CornerstoneWall({ rows, maxWidth }: WallProps) {
  return (
    <div className="wall" style={maxWidth ? { maxWidth } : undefined}>
      {rows.map((row, i) => (
        <div key={i} className="course-row">
          {row.map((state, j) => (
            <i key={j} className={`brick${state === "done" ? " done" : state === "now" ? " now" : ""}`} />
          ))}
        </div>
      ))}
    </div>
  );
}
