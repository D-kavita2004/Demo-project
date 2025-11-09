import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Chart data
const data = [
  { name: "Part Area", value: 5 },
  { name: "Fit Area", value: 3 },
  { name: "Final Assembly", value: 8 },
// { name: "Hello", value: 1 },
];

// Soft pastel colors
const COLORS = ["#F472B6", "#34D399", "#FBBF24", "#A78BFA",];

const RADIAN = Math.PI / 180;

// Fixed label: center-aligned, two-line layout
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  index,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const { name, value } = data[index];

  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fill="#1E293B"
      className="text-[13px]"
    >
      <tspan x={x} dy="-0.3em" className="italic font-semibold">
        {name}
      </tspan>
      <tspan x={x} dy="1.2em" className="font-bold text-[12px]">
        {value}
      </tspan>
    </text>
  );
};

// Custom Tooltip: shows value + percentage
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];

    // Calculate total of all slices
    const total = payload[0].payload.total || payload.reduce((sum, entry) => sum + entry.value, 0);

    // Calculate percentage
    const percent = ((value / total) * 100).toFixed(1);

    return (
      <div
        className="bg-white shadow-xl rounded-lg px-3 py-2 border border-gray-100"
        style={{ fontSize: "13px" }}
      >
        <p className="font-semibold text-slate-700">{name}</p>
        <p className="text-slate-600">
          Defects: <span className="font-medium">{value}</span>
        </p>
        <p className="text-slate-500 text-xs">({percent}%)</p>
      </div>
    );
  }
  return null;
};

const DepartmentPieChart = ({ isAnimationActive = true }) => {
  // Precompute total for tooltip
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithTotal = data.map(item => ({ ...item, total }));

  return (
    <Card className="w-full max-w-xl mx-auto rounded-3xl border border-gray-100 shadow-lg bg-gradient-to-br from-white via-slate-50 to-gray-100">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-700 tracking-tight">
          Department Quality Issue Breakdown
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center">
        <div className="w-full h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {/* Subtle shadow */}
                <filter id="shadow" height="130%">
                  <feDropShadow
                    dx="0"
                    dy="5"
                    stdDeviation="4"
                    floodColor="rgba(0, 0, 0, 0.08)"
                  />
                </filter>
              </defs>

              <Pie
                data={dataWithTotal}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={130}
                dataKey="value"
                isAnimationActive={isAnimationActive}
                style={{ filter: "url(#shadow)" }}
              >
                {dataWithTotal.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="white"
                    strokeWidth={3}
                  />
                ))}
              </Pie>

              {/* Tooltip */}
              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="triangle"
                wrapperStyle={{
                  paddingTop: "10px",
                  fontSize: "13px",
                  color: "#475569",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-slate-500 mt-4 text-center">
          Visualizing number of quality issues reported by each department
        </p>
      </CardContent>
    </Card>
  );
};

export default DepartmentPieChart;
