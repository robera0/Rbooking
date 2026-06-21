import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { bookingData, dateAxisFormatter } from "@/dataset/bookingData";
const xAxis = [
  {
    dataKey: "date",
    scaleType: "time",
    valueFormatter: dateAxisFormatter,
  },
];

const yAxis = [
  {
    valueFormatter: (value) => value.toString(),
  },
];

const series = [
  {
    dataKey: "rate",
    showMark: true,
    area: true, // enable area fill
    color: "#FF7A00", // line color
  },
];

export default function BookingChart() {
  return (
    <LineChart
      dataset={bookingData}
      xAxis={xAxis}
      yAxis={yAxis}
      series={series}
      height={300}
      grid={{ vertical: false, horizontal: true }}
      sx={{
        backgroundColor: '#1C1F22',
        "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel": {
          fill: "#fff",
        },
        "& .MuiLineElement-root": {
          strokeWidth: 2,
        },
        "& .MuiMarkElement-root": {
          stroke: "#FF7A00",
          strokeWidth: 2,
          fill: "#fff",
        },
        "& .MuiAreaElement-root": {
          fill: "rgba(255,122,0,0.15)",
          fillOpacity: 1,
        },
      }}
    />
  );
}

export const CustomLabels = () => {
  return (
    <BarChart
      height={350}
      margin={{ left: 0 }}
      series={[
        { data: [4, 2, 5, 4, 1], stack: "A", label: "Series A1" },
        { data: [2, 8, 1, 3, 1], stack: "A", label: "Series A2" },
        { data: [14, 6, 5, 8, 9], label: "Series B1" },
      ]}
      barLabel={(item, context) => {
        if ((item.value ?? 0) > 10) {
          return "High";
        }
        return context.bar.height < 60 ? null : item.value?.toString();
      }}
      // 👇 Add this part
      slotProps={{
        bar: {
          rx: 6, // horizontal border radius
          ry: 6, // vertical border radius
        },
      }}
    />
  );
};
