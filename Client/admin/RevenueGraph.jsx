
import { LineChart, lineElementClasses } from '@mui/x-charts/LineChart';
import Box from '@mui/material/Box';

const margin = { right: 24 };
const uData = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
const pData = [2400, 1398, 9800, 3908, 4800, 3800, 4300];
const amtData = [2400, 2210, 0, 2000, 2181, 2500, 2100];
const xLabels = [
  'Page A',
  'Page B',
  'Page C',
  'Page D',
  'Page E',
  'Page F',
  'Page G',
];

export default function StackedAreaChart() {
  return (
    <Box sx={{ width: '100%', height: 300, backgroundColor: '#1C1F22', borderRadius: '1rem' }}>
      <LineChart
        series={[
          { data: uData, 
            label: 'Booking', 
            area: true, 
            stack: 'total',
             showMark: false ,

            color:'#FF7A00'},
          { 
            data: pData, 
            label: 'Profit', 
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
