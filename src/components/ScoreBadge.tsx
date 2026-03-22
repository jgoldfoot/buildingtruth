interface ScoreBadgeProps {
  score: number | null;
  size?: "sm" | "md" | "lg";
}

function getScoreConfig(score: number | null) {
  if (score === null || score === undefined) {
    return { color: "#64748B", label: "No Data" };
  }
  if (score >= 70) {
    return { color: "#10B981", label: "Good" };
  }
  if (score >= 40) {
    return { color: "#F59E0B", label: "Fair" };
  }
  return { color: "#EF4444", label: "Poor" };
}

const sizeMap = {
  sm: { outer: 56, stroke: 4, fontSize: "text-sm", labelSize: "text-[9px]" },
  md: { outer: 72, stroke: 5, fontSize: "text-lg", labelSize: "text-[10px]" },
  lg: { outer: 96, stroke: 6, fontSize: "text-2xl", labelSize: "text-xs" },
} as const;

export default function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const { color, label } = getScoreConfig(score);
  const { outer, stroke, fontSize, labelSize } = sizeMap[size];

  const radius = (outer - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score !== null ? score / 100 : 0;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={outer}
        height={outer}
        viewBox={`0 0 ${outer} ${outer}`}
        className="transform -rotate-90"
        aria-label={score !== null ? `Score: ${Math.round(score)}` : "No data"}
      >
        {/* Background ring */}
        <circle
          cx={outer / 2}
          cy={outer / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-white/10"
          strokeWidth={stroke}
        />
        {/* Foreground ring */}
        <circle
          cx={outer / 2}
          cy={outer / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-700 ease-out"
        />
        {/* Center text */}
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          className={`${fontSize} font-bold fill-[#F1F5F9]`}
          transform={`rotate(90, ${outer / 2}, ${outer / 2})`}
        >
          {score !== null ? Math.round(score) : "--"}
        </text>
      </svg>
      <span
        className={`${labelSize} font-medium uppercase tracking-wider`}
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}
