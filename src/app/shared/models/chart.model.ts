import {ChartComponent, ApexAxisChartSeries, ApexChart, ApexYAxis, ApexXAxis, ApexTitleSubtitle, ApexStroke} from 'ng-apexcharts';
export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    title: ApexTitleSubtitle;
    stroke: ApexStroke;
  };
