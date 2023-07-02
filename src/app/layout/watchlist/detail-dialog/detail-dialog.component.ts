import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChartOptions } from '../../../shared/models/chart.model';
import { ChartComponent, ApexAxisChartSeries, ApexChart, ApexYAxis, ApexXAxis, ApexTitleSubtitle } from 'ng-apexcharts';
import { MarketFeedData } from '../../../shared/models/user.model';
import { FivePaisaService } from '../../../shared/services/Fivepaisa.service';
import { map, timer } from 'rxjs';
import { StockChart } from '@amcharts/amcharts5/stock';
import * as Highcharts from 'highcharts/highstock';
import { Options } from 'highcharts/highstock';

import IndicatorsCore from 'highcharts/indicators/indicators';
import IndicatorZigzag from 'highcharts/indicators/zigzag';
IndicatorsCore(Highcharts);
IndicatorZigzag(Highcharts);

export interface DialogData {
    animal: string;
    name: string;
}
@Component({
    selector: 'app-detail-dialog',
    templateUrl: './detail-dialog.component.html',
    styleUrls: ['./detail-dialog.component.scss']
})
export class DetailDialogComponent implements OnInit {
    stock: StockChart;
    Highcharts: typeof Highcharts = Highcharts;

    chartData: string;
    name: string;

    action: string;
    local_data: any;
    public chartOptions: Partial<ChartOptions>;
    historyCandles: any;
    timerSubscription: any;
    marketFeedData: any;
    chartOptions1: Partial<Options>;
    historyCandles1: any;
    constructor(
        public dialogRef: MatDialogRef<DetailDialogComponent>,
        // @Optional() is used to prevent error if no data is passed
        @Optional() @Inject(MAT_DIALOG_DATA) public data,
        public fivePaisaService: FivePaisaService
    ) {
        this.local_data = { ...data };
        this.action = this.local_data.action;
        // this.chartOptions=data.chartData;

        this.marketFeedData = data.marketFeedData;
        // this.getHistory(data.marketFeedData.token);
    }

    doAction() {
        this.dialogRef.close({ event: this.action, data: this.local_data });
    }

    closeDialog() {
        this.dialogRef.close({ event: 'Cancel' });
    }

    getHistoryData(timeinterval) {
        this.fivePaisaService.History(this.marketFeedData.token, timeinterval).subscribe((data: any) => {
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

    ngOnInit() {
        this.getHistoryData('5m');
        this.fivePaisaService.History(this.marketFeedData.token, '15m').subscribe((data: any) => {
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
        const now = new Date().getHours();
        /**
         *  check if value in now is between 9am and 4pm
         *  9am -> 9
         *  4pm -> 16
         */
        if (now >= 9.07 && now <= 16.3) {
            this.timerSubscription = timer(0, 50000)
                .pipe(
                    map(() => {
                        this.getHistoryData('5m');
                    })
                )
                .subscribe();
        } else {
            console.log('Sorry! market is closed');
        }
    }

    close() {}
}
