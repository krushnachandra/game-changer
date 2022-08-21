import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MarketFeedData, MarketFeedResponse } from '../../shared/models/user.model';
import { routerTransition } from '../../router.animations';
import { FivePaisaService } from '../../shared/services/Fivepaisa.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { map, Subscription, timer } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { FivePaisaClient } from '5paisajs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DetailDialogComponent } from './detail-dialog/detail-dialog.component';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5stock from '@amcharts/amcharts5/stock';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import {ChartComponent, ApexAxisChartSeries, ApexChart, ApexYAxis, ApexXAxis, ApexTitleSubtitle} from 'ng-apexcharts';
import { ChartOptions } from '../../shared/models/chart.model';
@Component({
    selector: 'app-watchlist',
    templateUrl: './watchlist.component.html',
    styleUrls: ['./watchlist.component.scss'],
    animations: [routerTransition()]
})
export class WatchlistComponent implements OnInit, AfterViewInit , OnDestroy {


    @ViewChild('chart') chart: ChartComponent;
    public chartOptions: Partial<ChartOptions>;
    @ViewChild('dialogRef')
    dialogRef!: TemplateRef<any>;

    myFooList = ['Some Item', 'Item Second', 'Other In Row', 'What to write', 'Blah To Do'];

    marketFeedList: MarketFeedData[];
    displayedColumns: string[] = [ 'symbol', 'high', 'low', 'pClose', 'lastRate', 'chgPcnt', 'chg', 'buy', 'sell', 'view' ];
    dataSource = new MatTableDataSource<any>([]);
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild('tabs') tabGroup: MatTabGroup;
    timerSubscription: Subscription;
    tabNumber = 0;
    diameter = 20;

  tabs = ['Nifty-50', 'Watchlist-1', 'Watchlist-2', 'Watchlist-3', 'Watchlist-4'];
    historyCandles: any;
    netPositionDetail: string;
    totalShareinPositive: number;
    constructor(public fivePaisaService: FivePaisaService, private _snackBar: MatSnackBar , private matDialog: MatDialog) {}

    ngOnInit() {
      this.MarketFeed();

      const now = new Date().getHours();
      /**
       *  check if value in now is between 9am and 4pm
       *  9am -> 9
       *  4pm -> 16
       */
      if (now >= 9 && now <= 15.30) {
        this.timerSubscription = timer(0, 3000).pipe(
          map(() => {
            this.MarketFeed(); // load data contains the http request
          })
        ).subscribe();
      } else {
        console.log('Sorry! market is closed');
      }

      // chart code


    }

    MarketFeed() {
        this.fivePaisaService.MarketFeed(this.tabNumber).subscribe((data: any) => {
          this.marketFeedList = data.responseData.body.data;
          this.dataSource.data = this.marketFeedList;
          this.netPositionDetail = localStorage.getItem('netPositionDetail');
           //console.log(this.netPositionDetail)
           this.totalShareinPositive= this.marketFeedList.filter(x => x.chgPcnt > 0).length;
        });
      }

      onTabChange(event: MatTabChangeEvent) {
        this.tabNumber = event.index;
        this.MarketFeed();
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

    }

    buy(row: MarketFeedData) {
        this.fivePaisaService.OrderRequest(row, 'B').subscribe((data: any) => {
            let message= data.responseData.body.message;
            this._snackBar.open(message, 'Close', {
              duration: 5000
            });

        });
    }

    sell(row: MarketFeedData) {
        this.fivePaisaService.OrderRequest(row, 'S').subscribe((data: any) => {
            let message= data.responseData.body.message;
            this._snackBar.open(message, 'Close', {
              duration: 5000
            });
        });
    }

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
                },

              };
              this.matDialog.open(DetailDialogComponent, {
                maxWidth: '100vw',
                maxHeight: '90vh',
                height: '100%',
                width: '100%',
                panelClass: 'full-screen-modal',
                  data: {
                      marketFeedData: row,
                      chartData: this.chartOptions,
                  },
                });
        });

    }
    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

      }
      ngOnDestroy(): void {
        if (this.timerSubscription !== undefined) {
          this.timerSubscription.unsubscribe();
       }
    }
    openTempDialog(row: MarketFeedData) {
        this.getHistory(row);
      }
      closeDialog() {
        this.matDialog.closeAll();
    }

}
