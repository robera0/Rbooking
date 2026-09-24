import { LineChart, lineElementClasses } from '@mui/x-charts/LineChart';
import Box from '@mui/material/Box';

const margin = { right: 24 };

export default function StackedAreaChart({ history = [] }) {
  const xLabels = history.map((h) => h.name);
  const revenueData = history.map((h) => h.revenue);
  const ticketsData = history.map((h) => h.tickets);

  return (
    <Box sx={{ width: '100%', height: 300, backgroundColor: '#1C1F22', borderRadius: '1rem' }}>
      <LineChart
        series={[
          { data: revenueData,
            label: 'Revenue',
            area: true,
            stack: 'total',
             showMark: false ,

            color:'#FF7A00'},
          {
            data: ticketsData,
            label: 'Tickets Sold',
            area: true,
            stack: 'total',
            showMark: false,
             color:'#FFA58A' },

        ]}
        xAxis={[{ scaleType: 'point', data: xLabels }]}
        yAxis={[{ width: 50 }]}
        sx={{
          [`& .${lineElementClasses.root}`]: {
            display: 'none',
          },
        }}
        margin={margin}
      />
    </Box>
  );
}
