import { Chart } from "chart.js/auto";

export const createChart = (ctx: CanvasRenderingContext2D | null, chartCanvas: HTMLCanvasElement, chartLabels: any[], chartValues: number[]) => {
  ctx = chartCanvas.getContext('2d');
  if (!ctx) throw new Error('The chart item not found');
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartLabels,
      datasets: [
        {
          label: 'Revenue',
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          data: chartValues
        }
      ]
    }
  });
}