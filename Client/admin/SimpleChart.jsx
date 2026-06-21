import React from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { bookingData, dateAxisFormatter } from "@/dataset/bookingData";

const xAxis = [{
  dataKey: "date",
  scaleType: "time",
  valueFormatter: dateAxisFormatter,
}];

const yAxis = [{
  // format large numbers with commas
  valueFormatter: (value) => Number(value).toLocaleString(),
}];

const series = [{
  dataKey: "rate",
  showMark: true,
  area: true,
  color: "#FF7A00",
}];

const SimpleChart = ({ title }) => (
  <div className="bg-[#1C1F22] p-6 rounded-[2rem] shadow-xl">
    <h2 className="text-xl font-black text-white uppercase mb-4">{title}</h2>
    <LineChart
      dataset={bookingData}
      xAxis={xAxis}
      yAxis={yAxis}
      series={series}
      height={300}
      grid={{ vertical: false, horizontal: true }}
      sx={{
        backgroundColor: "#1C1F22",
        "& .MuiLineElement-root": { strokeWidth: 2 },
        "& .MuiMarkElement-root": { stroke: "#FF7A00", strokeWidth: 2, fill: "#fff" },
        "& .MuiAreaElement-root": { fill: "rgba(255,122,0,0.15)", fillOpacity: 1 },
        "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel": { fill: "#fff" },
        "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel": { fill: "#fff" },
      }}
    />
  </div>
);

export default SimpleChart;
