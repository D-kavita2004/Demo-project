import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import api from "@/api/axiosInstance";

const gradColors = [
  // { start: "#4f46e5", end: "#818CF8" },  // Indigo → Light Indigo
  // { start: "#10b981", end: "#6EE7B7" },  // Emerald → Mint
  { start: "#f59e0b", end: "#FCD34D" },  // Amber → Yellow
  { start: "#ef4444", end: "#F87171" },  // Red → Light Red
  { start: "#8b5cf6", end: "#C4B5FD" },  // Violet → Lavender
  { start: "#14b8a6", end: "#5EEAD4" },  // Teal → Mint
  { start: "#f97316", end: "#FDBA74" },  // Orange → Light Orange
  { start: "#ec4899", end: "#F9A8D4" },  // Pink → Light Pink
  { start: "#3b82f6", end: "#93C5FD" },  // Blue → Light Blue
  { start: "#22c55e", end: "#86efac" },  // Green → Light Green
];


const StatusWiseChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const getStatusWiseData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/charts/status-wise", {
        withCredentials: true,
      });
      setChartData(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStatusWiseData();
  }, []);


  const total = chartData.reduce((sum, item) => sum + item.count, 0);

  const chartCardClass =
    "w-full h-[450px] rounded-3xl border border-gray-100 shadow-lg bg-gradient-to-br from-white via-slate-50 to-gray-100 flex flex-col";

  // Dynamic width: 70px per bar (adjust as needed)
  const chartWidth = chartData.length * 70;

  return (
    <Card className={chartCardClass}>
      <CardHeader className="pb-2 flex flex-col gap-4">
        <CardTitle>Status wise data</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            Loading chart data...
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            No data available for selected date range
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto">
            <div style={{ width: `${chartWidth}px`, minWidth: "100%", height: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 60 }}>
                  <defs>
                    {gradColors.map((grad, index) => (
                      <linearGradient
                        key={index}
                        id={`colorGrad-${index}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor={grad.start} stopOpacity={0.9} />
                        <stop offset="100%" stopColor={grad.end} stopOpacity={0.6} />
                      </linearGradient>
                    ))}
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                  <XAxis
                    dataKey="category"
                    tick={{ fill: "#6b7280", fontSize: 14 }}
                    axisLine={{ stroke: "#d1d5db" }}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                  />

                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 14 }}
                    axisLine={{ stroke: "#d1d5db" }}
                    allowDecimals={false}
                    label={{
                      value: "Number of Forms",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#334155",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "10px",
                      fontSize: "14px",
                    }}
                  />

                  <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40} animationDuration={900}>
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#colorGrad-${index % gradColors.length})`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {!loading && chartData.length > 0 && (
          <div className="mt-2 text-center text-sm font-semibold text-slate-700">
            Total Issues: <span className="text-slate-900">{total}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusWiseChart;
