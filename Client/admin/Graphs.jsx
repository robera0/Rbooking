import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";

const xAxis = [
  {
    dataKey: "name",
    scaleType: "band",
  },
];

const yAxis = [
  {
    valueFormatter: (value) => value.toString(),
  },
];

const series = [
  {
    dataKey: "revenue",
    showMark: true,
    area: true, // enable area fill
    color: "#FF7A00", // line color
  },
];

export default function BookingChart({ dataset = [] }) {
  return (
    <LineChart
      dataset={dataset}
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

export const CustomLabels = ({ dataset = [] }) => {
  return (
    <BarChart
      height={350}
      margin={{ left: 0 }}
      dataset={dataset}
      xAxis={[{ scaleType: "band", dataKey: "name" }]}
      series={[
        { dataKey: "tickets", label: "Tickets Sold", color: "#FF7A00" },
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
