import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FivePaisaService } from '../../../shared/services/Fivepaisa.service';
import { DetailDialogComponent } from '../../watchlist/detail-dialog/detail-dialog.component';
import * as Highcharts from 'highcharts/highstock';
import { Options } from 'highcharts/highstock';
import IndicatorsCore from 'highcharts/indicators/indicators';
import IndicatorZigzag from 'highcharts/indicators/zigzag';
import { ChartOptions } from '../../../shared/models/chart.model';
IndicatorsCore(Highcharts);
IndicatorZigzag(Highcharts);

@Component({
  selector: 'app-chart-model',
  templateUrl: './chart-model.component.html',
  styleUrls: ['./chart-model.component.scss']
})
export class ChartModelComponent implements OnInit {
  marketFeedData: any;
    historyCandles1: any;
    chartOptions1: Partial<Options>;
    public chartOptions: Partial<ChartOptions>;
    historyCandles: any;
    Highcharts: typeof Highcharts = Highcharts;
  constructor(
    public dialogRef: MatDialogRef<DetailDialogComponent>,
        // @Optional() is used to prevent error if no data is passed
        @Optional() @Inject(MAT_DIALOG_DATA) public data,
        public fivePaisaService: FivePaisaService
  ) {
    this.marketFeedData = data.marketFeedData;
   }

  ngOnInit() {
    this.getHistoryData('5m');

    this.fivePaisaService.History(this.marketFeedData.scripCode, '15m').subscribe((data: any) => {
        this.historyCandles1 = data.data.candles;
        this.chartOptions1 = {
            series: [
                {
                    type: 'candlestick',
                    id: 'base',
                    pointInterval: 24 * 3600 * 1000,
                    data: this.historyCandles1
                },
                {
                    type: 'zigzag',
                    showInLegend: true,
                    linkedTo: 'base'
                }
            ]
        };
    });
  }
  closeDialog() {
    this.dialogRef.close({ event: 'Cancel' });
}
  getHistoryData(timeinterval) {
    this.fivePaisaService.History(this.marketFeedData.scripCode, timeinterval).subscribe((data: any) => {
        this.historyCandles = data.data.candles;
        this.historyCandles = this.historyCandles.map((x) => ({ x: new Date(x[0]), y: [x[1], x[2], x[3], x[4]] }));
        this.chartOptions = {
            series: [
                {
                    name: 'candle',
                    data: this.historyCandles
                }
            ],
            chart: {
                type: 'line',
                height: 400
            },
            stroke: {
                curve: 'smooth',
              },
            title: {
                text: this.marketFeedData.symbol,
                align: 'left'
            },
            xaxis: {
                type: 'datetime'
            },
            yaxis: {
                tooltip: {
                    enabled: true
                }
            }
        };
    });
}
}
