"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TimelineChartProps {
  data: any[];
  dateField: string;
  title: string;
  color: string;
}

function groupByYear(data: any[], dateField: string) {
  const counts: Record<string, number> = {};

  for (const item of data) {
    const raw = item[dateField];
    if (!raw) continue;
    const year = new Date(raw).getFullYear();
    if (isNaN(year)) continue;
    counts[year] = (counts[year] || 0) + 1;
  }

  const years = Object.keys(counts)
    .map(Number)
    .sort((a, b) => a - b);
  if (years.length === 0) return [];

  // Fill gaps so every year between min and max appears
  const result: { year: string; count: number }[] = [];
  for (let y = years[0]; y <= years[years.length - 1]; y++) {
    result.push({ year: String(y), count: counts[y] || 0 });
  }
  return result;
}

export default function TimelineChart({
  data,
  dateField,
  title,
  color,
}: TimelineChartProps) {
  const chartData = groupByYear(data, dateField);

  if (chartData.length === 0) {
    return (
      <div className="rounded-lg bg-[#1A1D27] p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">
          {title}
        </h3>
        <p className="text-sm text-[#94A3B8]">No timeline data available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-[#1A1D27] p-6">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">
        {title}
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2D3348" />
            <XAxis
              dataKey="year"
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              axisLine={{ stroke: "#2D3348" }}
              tickLine={{ stroke: "#2D3348" }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              axisLine={{ stroke: "#2D3348" }}
              tickLine={{ stroke: "#2D3348" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1D27",
                border: "1px solid #2D3348",
                borderRadius: "8px",
                color: "#F1F5F9",
              }}
              labelStyle={{ color: "#94A3B8" }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 3 }}
              activeDot={{ r: 5, fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
