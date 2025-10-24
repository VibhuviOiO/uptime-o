// Chart.js global registration for react-chartjs-2 charts
import {
  Chart,
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);
