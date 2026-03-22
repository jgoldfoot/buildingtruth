"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CategoryBarProps {
  data: any[];
  categoryField: string;
  title: string;
  color: string;
}

function groupByCategory(data: any[], categoryField: string) {
  const counts: Record<string, number> = {};

  for (const item of data) {
    const raw = item[categoryField];
    const label = raw ? String(raw).trim() : "Unknown";
    counts[label] = (counts[label] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 categories
}

export default function CategoryBar({
  data,
  categoryField,
  title,
  color,
}: CategoryBarProps) {
  const chartData = groupByCategory(data, categoryField);

  if (chartData.length === 0) {
    return (
      <div className="rounded-lg bg-[#1A1D27] p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">
          {title}
        </h3>
        <p className="text-sm text-[#94A3B8]">No category data available.</p>
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
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            layout="vertical"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#2D3348"
              horizontal={false}
            />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              axisLine={{ stroke: "#2D3348" }}
              tickLine={{ stroke: "#2D3348" }}
            />
            <YAxis
              type="category"
              dataKey="category"
              width={150}
              tick={{ fill: "#94A3B8", fontSize: 11 }}
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
            <Bar dataKey="count" fill={color} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
