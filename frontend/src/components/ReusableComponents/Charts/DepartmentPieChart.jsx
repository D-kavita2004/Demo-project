import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import api from "@/api/axiosInstance";
import axios from "axios";
import { useEffect } from "react";

const COLORS = ["#F472B6", "#34D399", "#FBBF24", "#A78BFA"];
const RADIAN = Math.PI / 180;

// Example datasets for different time ranges
// const chartData = {
//   lastWeek: [
//     { name: "Part Area", value: 3 },
//     { name: "Fit Area", value: 1 },
//     { name: "Final Assembly", value: 4 },
//   ],
//   lastMonth: [
//     { name: "Part Area", value: 10 },
//     { name: "Fit Area", value: 5 },
//     { name: "Final Assembly", value: 8 },
//   ],
//   lastYear: [
//     { name: "Part Area", value: 50 },
//     { name: "Fit Area", value: 30 },
//     { name: "Final Assembly", value: 80 },
//   ],
// };

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, index, data }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const { name, value } = data[index];


  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill="#1E293B" className="text-[13px]">
      <tspan x={x} dy="-0.3em" className="italic font-semibold">
        {name}
      </tspan>
      <tspan x={x} dy="1.2em" className="font-bold text-[12px]">
        {value}
      </tspan>
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    const total = payload[0].payload.total || payload.reduce((sum, entry) => sum + entry.value, 0);
    const percent = ((value / total) * 100).toFixed(1);

    return (
      <div className="bg-white shadow-xl rounded-lg px-3 py-2 border border-gray-100" style={{ fontSize: "13px" }}>
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

const DepartmentPieChart = ({ isAnimationActive = true }) => {

  const [timeRange, setTimeRange] = useState("lastWeek");
  const [chartData,setChartData] = useState({});

  const getDepartmentWiseData = async()=>{
    try{
      const res = await api.get("/charts/department-wise-data",{withCredentials:true});
      console.log(res.data);
      setChartData(res.data);
    
    }
    catch(err){
      console.log(err);
    }
  }
  useEffect(()=>{
    getDepartmentWiseData();
  },[]);
  const data = chartData[timeRange] || [];
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithTotal = data.map((item) => ({ ...item, total }));

  const chartCardClass =
    "w-full h-[460px] rounded-3xl border border-gray-100 shadow-lg bg-gradient-to-br from-white via-slate-50 to-gray-100 flex flex-col";

  return (
    <Card className={chartCardClass}>
      <CardHeader className="pb-2 flex justify-between items-center">
        <CardTitle className="text-lg font-semibold text-slate-700">
          Department Quality Issue Breakdown
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
          <PieChart>
            <Pie
              data={dataWithTotal}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props) => renderCustomizedLabel({ ...props, data: dataWithTotal })}
              outerRadius={130}
              dataKey="value"
              isAnimationActive={isAnimationActive}
            >
              {dataWithTotal.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={3} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="triangle"
              wrapperStyle={{ paddingTop: "10px", fontSize: "13px", color: "#475569" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DepartmentPieChart;
