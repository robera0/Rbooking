import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";

export default function ArcDesign({ value = 0 }) {
  const settings = {
    width: 150,
    height: 150,
    value,
  };
  return (
    <Gauge
      {...settings}
      cornerRadius="50%"
      sx={(theme) => ({
        [`& .${gaugeClasses.valueText}`]: {
          fontSize: 40,
          fill: "#ffffff",
        },
        [`& .${gaugeClasses.valueArc}`]: {
          fill: "#e1611cf0",
        },
        [`& .${gaugeClasses.referenceArc}`]: {
          fill: theme.palette.text.disabled,
        },
      })}
    />
  );
}
