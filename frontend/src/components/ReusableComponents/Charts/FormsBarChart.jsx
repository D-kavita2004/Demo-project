import React, { useState } from "react";
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
import { useEffect } from "react";

const gradientColors = [
  { start: "#4f46e5", end: "#6366f1" }, // Blue
  { start: "#10b981", end: "#34d399" }, // Green
  { start: "#f59e0b", end: "#fbbf24" }, // Orange
  { start: "#f43f5e", end: "#fb7185" }, // Pink
  { start: "#8b5cf6", end: "#a78bfa" }, // Purple
];

// Example datasets for different time ranges
// const chartData = {
//   "lastWeek": [
//     { category: "Quality Review", count: 8 },
//     { category: "Part Area", count: 2 },
//     { category: "Fit Area", count: 1 },
//     { category: "Final Assembly", count: 5 },
//     { category: "Approved Forms", count: 15 },
//   ],
//   "lastMonth": [
//     { category: "Quality Review", count: 20 },
//     { category: "Part Area", count: 5 },
//     { category: "Fit Area", count: 4 },
//     { category: "Final Assembly", count: 12 },
//     { category: "Approved Forms", count: 50 },
//   ],
//   "lastYear": [
//     { category: "Quality Review", count: 400 },
//     { category: "Part Area", count: 300 },
//     { category: "Fit Area", count: 100 },
//     { category: "Final Assembly", count: 1000 },
//     { category: "Approved Forms", count: 200 },
//   ],
// };

const FormsBarChart = () => {

  const [timeRange, setTimeRange] = useState("lastWeek"); // default range
  const [chartData,setChartData] = useState([]);

   const getStatusWiseData = async()=>{
    try{
      const res = await api.get("/charts/status-wise",{withCredentials:true});
      console.log(res.data);
      setChartData(res.data);
    
    }
    catch(err){
      console.log(err);
    }
  }

  useEffect(()=>{
    getStatusWiseData();
  },[]);
  const chartCardClass =
    "w-full h-[460px] rounded-3xl border border-gray-100 shadow-lg bg-gradient-to-br from-white via-slate-50 to-gray-100 flex flex-col";

  return (
    <Card className={chartCardClass}>
      <CardHeader className="pb-2 flex justify-between items-center">
        <CardTitle className="text-lg font-semibold text-gray-700">
          Forms Status Overview
        </CardTitle>
        {/* Time Range Selector */}
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border border-gray-300 rounded-md p-1 text-gray-700"
        >
          <option value="lastWeek">Last Week</option>
          <option value="lastMonth">Last Month</option>
          <option value="lastYear">Last Year</option>
        </select>
      </CardHeader>
      <CardContent className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData[timeRange] || []} margin={{ top: 20, right: 20, left: 20, bottom: 60 }}>
            <defs>
              {gradientColors.map((grad, index) => (
                <linearGradient key={index} id={`colorGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
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
            <YAxis tick={{ fill: "#6b7280", fontSize: 14 }} axisLine={{ stroke: "#d1d5db" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "10px",
                fontSize: "14px",
              }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40} animationDuration={1000}>
              {(chartData[timeRange] || []).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`url(#colorGrad-${index % gradientColors.length})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default FormsBarChart;
