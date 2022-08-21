import { Component, Inject, OnInit, Optional } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ChartOptions } from '../../../shared/models/chart.model';
import {ChartComponent, ApexAxisChartSeries, ApexChart, ApexYAxis, ApexXAxis, ApexTitleSubtitle} from 'ng-apexcharts';
import { MarketFeedData } from '../../../shared/models/user.model';
import { FivePaisaService } from '../../../shared/services/Fivepaisa.service';
import { map, timer } from 'rxjs';

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

  chartData: string;
  name: string;

  action:string;
  local_data:any;
  public chartOptions: Partial<ChartOptions>;
  historyCandles: any;
  timerSubscription: any;
  marketFeedData: any;

  constructor(
    public dialogRef: MatDialogRef<DetailDialogComponent>,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data,public fivePaisaService: FivePaisaService) {
    this.local_data = {...data};
    this.action = this.local_data.action;
    this.chartOptions=data.chartData;
    this.marketFeedData = data.marketFeedData;
    //this.getHistory(data.marketFeedData.token);
  }

  doAction(){
    this.dialogRef.close({event:this.action,data:this.local_data});
  }

  closeDialog(){
    this.dialogRef.close({event:'Cancel'});
  }

  ngOnInit() {
    const now = new Date().getHours();
      /**
       *  check if value in now is between 9am and 4pm
       *  9am -> 9
       *  4pm -> 16
       */
      if (now >= 9.07 && now <= 16.30) {
        this.timerSubscription = timer(0, 5000).pipe(
          map(() => {
            // this.getHistory(this.marketFeedData);
          })
        ).subscribe();
      } else {
        console.log('Sorry! market is closed');
      }

  }

  close() {}

  getHistory(row: MarketFeedData) {
    this.fivePaisaService.History(row.token).subscribe((data: any) => {
        this.historyCandles = data.data.candles;
        this.historyCandles = this.historyCandles.map(x => ({ x: new Date(x[0]), y: [x[1],x[2],x[3],x[4]] }));
        this.chartOptions = {
            series: [
              {
                name: "candle",
                data: this.historyCandles
              }
            ],
            chart: {
              type: 'candlestick',
              height: 350
            },
            title: {
              text: row.symbol,
              align: 'left'
            },
            xaxis: {
              type: 'datetime',

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
