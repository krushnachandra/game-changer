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
import { ChartComponent, ApexAxisChartSeries, ApexChart, ApexYAxis, ApexXAxis, ApexTitleSubtitle } from 'ng-apexcharts';
import { ChartOptions } from '../../shared/models/chart.model';
@Component({
    selector: 'app-watchlist',
    templateUrl: './watchlist.component.html',
    styleUrls: ['./watchlist.component.scss'],
    animations: [routerTransition()]
})
export class WatchlistComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('chart') chart: ChartComponent;
    public chartOptions: Partial<ChartOptions>;
    @ViewChild('dialogRef') dialogRef!: TemplateRef<any>;

    myFooList = ['Some Item', 'Item Second', 'Other In Row', 'What to write', 'Blah To Do'];

    public marketFeedList: MarketFeedData[];
    displayedColumns: string[] = [
        'symbol',
        'high',
        'low',
        'lastRate',
        'chgPcnt',
        'buy',
        'sell',
        'view'
    ];
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
    totalShareinPositive;
    itesForWatchlist: MarketFeedData[];
    totalShareinNegative: number;
    constructor(
        public fivePaisaService: FivePaisaService,
        private _snackBar: MatSnackBar,
        private matDialog: MatDialog
    ) {}

    ngOnInit() {
        // this.MarketFeed();
         this.requestDataFromMultipleSources();
        const now = new Date().getHours();
        /**
         *  check if value in now is between 9am and 4pm
         *  9am -> 9
         *  4pm -> 16
         */
        if (now >= 9 && now <= 15.3) {
            this.timerSubscription = timer(0, 3000)
                .pipe(
                    map(() => {
                        // this.MarketFeed(); // load data contains the http request
                         this.requestDataFromMultipleSources();
                    })
                )
                .subscribe();
        } else {
            console.log('Sorry! market is closed');
        }

        // chart code
    }
    requestDataFromMultipleSources() {
        this.fivePaisaService.requestDataFromMultipleSources().subscribe((data: any) => {
           const marketFeedList1: MarketFeedData[] =  [];
            data.forEach(item => {
                item.responseData.body.data.forEach(item1 => {
                    marketFeedList1.push(item1);
                });
            });
            this.marketFeedList = marketFeedList1;
            this.itesForWatchlist = this.marketFeedList
            .filter((x) => x.chgPcnt > 3 || x.chgPcnt < -1);
            this.dataSource.data = this.itesForWatchlist;
            // this.netPositionDetail = localStorage.getItem('netPositionDetail');
            // console.log(this.netPositionDetail)
            this.totalShareinPositive = this.marketFeedList.filter((x) => x.chgPcnt > 0).length;
            this.totalShareinNegative = this.marketFeedList.filter((x) => x.chgPcnt < 0).length;
            // localStorage.removeItem('totalShareinPositive');
            // localStorage.setItem('totalShareinPositive', this.totalShareinPositive);
        });
    }

    MarketFeed() {
        this.fivePaisaService.MarketFeed(this.tabNumber).subscribe((data: any) => {
            this.marketFeedList = data.responseData.body.data;
            this.itesForWatchlist = this.marketFeedList.filter((x) => x.chgPcnt > 1 || x.chgPcnt < -1);
            this.dataSource.data = this.itesForWatchlist;
            this.netPositionDetail = localStorage.getItem('netPositionDetail');
            // console.log(this.netPositionDetail)
            this.totalShareinPositive = this.marketFeedList.filter((x) => x.chgPcnt > 0).length;
            localStorage.removeItem('totalShareinPositive');
            localStorage.setItem('totalShareinPositive', this.totalShareinPositive);
        });
    }

    onTabChange(event: MatTabChangeEvent) {
        this.tabNumber = event.index;
        // this.MarketFeed();
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    buy(row: MarketFeedData) {
        if (row.lastRate < row.high) {
            this.fivePaisaService.OrderRequest(row, 'B').subscribe((data: any) => {
                const message = data.responseData.body.message;
                this._snackBar.open(message, 'Close', {
                    duration: 5000
                });
            });
        } else {
            alert('wait for day high');
        }
    }

    sell(row: MarketFeedData) {
        this.fivePaisaService.OrderRequest(row, 'S').subscribe((data: any) => {
            const message = data.responseData.body.message;
            this._snackBar.open(message, 'Close', {
                duration: 5000
            });
        });
    }

    getHistory(row: MarketFeedData) {
        // this.fivePaisaService.History(row.token,'5m').subscribe((data: any) => {
        //     this.historyCandles = data.data.candles;
        //     this.historyCandles = this.historyCandles.map(x => ({ x: new Date(x[0]), y: [x[1],x[2],x[3],x[4]] }));
        //     this.chartOptions = {
        //         series: [
        //           {
        //             name: "candle",
        //             data: this.historyCandles
        //           }
        //         ],
        //         chart: {
        //           type: 'candlestick',
        //           height: 350
        //         },
        //         title: {
        //           text: row.symbol,
        //           align: 'left'
        //         },
        //         xaxis: {
        //           type: 'datetime',
        //         },
        //         yaxis: {
        //           tooltip: {
        //             enabled: true
        //           }
        //         },

        //       };
        //       this.matDialog.open(DetailDialogComponent, {
        //         maxWidth: '100vw',
        //         maxHeight: '90vh',
        //         height: '100%',
        //         width: '100%',
        //         panelClass: 'full-screen-modal',
        //           data: {
        //               marketFeedData: row,
        //               chartData: this.chartOptions,
        //           },
        //         });
        // });

        this.matDialog.open(DetailDialogComponent, {
            // maxWidth: '100vw',
            maxHeight: '90vh',
            height: '80%',
            width: '80%',
            panelClass: 'full-screen-modal',
            data: {
                marketFeedData: row
            }
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
