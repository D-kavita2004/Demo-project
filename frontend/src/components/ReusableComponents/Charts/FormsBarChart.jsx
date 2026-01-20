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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import api from "@/api/axiosInstance";
import { Label } from "@radix-ui/react-label";

const gradientColors = [
  { start: "#4f46e5", end: "#6366f1" },
  { start: "#10b981", end: "#34d399" },
  { start: "#f59e0b", end: "#fbbf24" },
  { start: "#f43f5e", end: "#fb7185" },
  { start: "#8b5cf6", end: "#a78bfa" },
];

const FormsBarChart = () => {
  const [chartData, setChartData] = useState([]); 
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  // Format as YYYY-MM-DD for input[type="date"]
  const formatDate = (date) => date.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(formatDate(oneMonthAgo));
  const [endDate, setEndDate] = useState(formatDate(today));

  const getStatusWiseData = async () => {
    try {
      setLoading(true);

      const res = await api.get("/charts/status-wise", {
        params: {
          startDate,
          endDate,
        },
        withCredentials: true,
      });

      // ✅ Normalize response
      setChartData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStatusWiseData();
  }, [startDate, endDate]);

  // Prevent invalid date range
  useEffect(() => {
    if (startDate && endDate && startDate > endDate) {
      setEndDate("");
    }
  }, [startDate]);

  const chartCardClass =
    "w-full h-[500px] rounded-3xl border border-gray-100 shadow-lg bg-gradient-to-br from-white via-slate-50 to-gray-100 flex flex-col";

  return (
    <Card className={chartCardClass}>
      <CardHeader className="pb-2 flex flex-col gap-4">
        {/* <CardTitle className="text-lg font-semibold text-gray-700">
          Forms Status Overview
        </CardTitle> */}

        <div className="flex flex-wrap gap-4 items-center justify-center">
          {/* Start Date */}
          <div className="flex items-center gap-2">
            <Label htmlFor="start-date" className="text-gray-600">
              Start Date
            </Label>
            <input
              type="date"
              id="start-date"
              required
              value={startDate}
              max={formatDate(today)}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-gray-700"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center gap-2">
            <Label htmlFor="end-date" className="text-gray-600">
              End Date
            </Label>
            <input
              type="date"
              id="end-date"
              max={formatDate(today)}
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-gray-700"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            Loading chart data...
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            No data available for selected date range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
            >
              <defs>
                {gradientColors.map((grad, index) => (
                  <linearGradient
                    key={index}
                    id={`colorGrad-${index}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={grad.start} stopOpacity={0.9} />
                    <stop
                      offset="100%"
                      stopColor={grad.end}
                      stopOpacity={0.6}
                    />
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

              <Bar
                dataKey="count"
                radius={[8, 8, 0, 0]}
                barSize={40}
                animationDuration={900}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#colorGrad-${
                      index % gradientColors.length
                    })`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default FormsBarChart;
