import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import api from "@/api/axiosInstance";
import { Label } from "@radix-ui/react-label";

const COLORS = ["#F472B6", "#34D399", "#FBBF24", "#A78BFA"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value, total } = payload[0].payload;
    const percent = ((value / total) * 100).toFixed(1);

    return (
      <div className="bg-white shadow-xl rounded-lg px-3 py-2 border border-gray-100 text-[13px]">
        <p className="font-semibold text-slate-700">{name}</p>
        <p className="text-slate-600">
          Issues: <span className="font-medium">{value}</span>
        </p>
        <p className="text-slate-500 text-xs">({percent}%)</p>
      </div>
    );
  }
  return null;
};

// Custom label outside the pie slices
const renderOuterLabel = ({ cx, cy, midAngle, outerRadius, payload }) => {
  if (!payload) return null;

  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 20; // distance outside the slice
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const { name, value } = payload;

  // Add padding: shift text a bit away from the line
  const padding = 8; // pixels
  const textAnchor = x > cx ? "start" : "end";
  const labelX = x + (x > cx ? padding : -padding);

  return (
    <text
      x={labelX}
      y={y}
      textAnchor={textAnchor}
      dominantBaseline="central"
      fill="#1E293B"
      className="text-[15px]"
    >
      {name}: {value}
    </text>
  );
};



const DepartmentPieChart = ({ isAnimationActive = true }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  // Format date as YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(formatDate(oneMonthAgo));
  const [endDate, setEndDate] = useState(formatDate(today));

  const getDepartmentWiseData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/charts/department-wise", {
        params: { startDate, endDate },
        withCredentials: true,
      });
      setChartData(res.data || []);
    } catch (err) {
      console.error("Error fetching department chart data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDepartmentWiseData();
  }, [startDate, endDate]);

  // Prevent startDate > endDate
  useEffect(() => {
    if (startDate && endDate && startDate > endDate) {
      setEndDate("");
    }
  }, [startDate]);

  // Calculate total for percentages in tooltip
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const dataWithTotal = chartData.map((item) => ({ ...item, total }));

  const chartCardClass =
    "w-full h-[500px] rounded-3xl border border-gray-100 shadow-lg bg-gradient-to-br from-white via-slate-50 to-gray-100 flex flex-col";

  return (
    <Card className={chartCardClass}>
      <CardHeader className="pb-2 flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 items-center justify-center">
          {/* Start Date */}
          <div className="flex items-center gap-2">
            <Label htmlFor="start-date" className="text-gray-600">
              Start Date:
            </Label>
            <input
              type="date"
              id="start-date"
              required
              max={formatDate(today)}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-gray-700"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center gap-2">
            <Label htmlFor="end-date" className="text-gray-600">
              End Date:
            </Label>
            <input
              type="date"
              id="end-date"
              required
              max={formatDate(today)}
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
            <PieChart>
              <Pie
                data={dataWithTotal}
                cx="50%"
                cy="50%"
                outerRadius={130}
                dataKey="value"
                isAnimationActive={isAnimationActive}
                labelLine={true} // show connecting lines
                label={(props) => renderOuterLabel(props, dataWithTotal)}
              >
                {dataWithTotal.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="white"
                    strokeWidth={3}
                  />
                ))}
              </Pie>

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
        )}
      </CardContent>
    </Card>
  );
};

export default DepartmentPieChart;
