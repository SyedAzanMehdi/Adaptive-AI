import {
  Chart as ChartJS,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

// Chart.js's registry is a global singleton. Registering it once here (instead
// of each page partially re-registering overlapping elements on module load)
// avoids redundant repeat registration every time a chart-using route's lazy
// chunk loads.
ChartJS.register(
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend
);

export { ChartJS };
