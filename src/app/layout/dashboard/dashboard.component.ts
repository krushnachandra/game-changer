import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { routerTransition } from '../../router.animations';
import { webSocket } from "rxjs/webSocket";
import { JwtService } from '../../shared/services/jwt-service';
import { WebSocketData } from '../../shared/models/user.model';

import {ChartComponent,ApexAxisChartSeries,ApexChart,ApexYAxis,ApexXAxis,ApexTitleSubtitle} from "ng-apexcharts";
import { ChartOptions } from '../../shared/models/chart.model';
import { FivePaisaService } from '../../shared/services/Fivepaisa.service';






@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [routerTransition()]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('chart') chart: ChartComponent;
    public chartOptions: Partial<ChartOptions>;
    public alerts: Array<any> = [];
    public sliders: Array<any> = [];
    private missionAnnouncedSource = new Subject<any>();
    liveData$ = this.missionAnnouncedSource.asObservable();
    received : Array<any> = [];
    //subject;
    //subject = webSocket("wss://openfeed.5paisa.com/Feeds/api/chat?Value1=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjU2MTU5NDg1Iiwicm9sZSI6IkNsaWVudCIsIlN0YXRlIjoiIiwibmJmIjoxNjQ5NzM5ODcwLCJleHAiOjE2NDk3ODgxOTksImlhdCI6MTY0OTczOTg3MH0.8-PLuV7UbPVxCz0pywJFjmSMaM1yCVmYikmcTzNQvf0|56159485");
    
    SocketRequest= {
      "Method": "MarketFeedV3",
      "Operation": "Subscribe",
      "ClientCode": "56565401",
      "MarketFeedData": [
        {
          "Exch": "N",
          "ExchType": "C",
          "ScripCode": 1660
        }
        ,
        {
          "Exch": "N",
          "ExchType": "C",
          "ScripCode": 25
        },
        {
          "Exch": "N",
          "ExchType": "C",
          "ScripCode": 1661
        },
        {"Exch":"N","ExchType":"C","ScripCode":15083}, 
        {"Exch": "B","ExchType":"C","ScripCode":999901}, 
        {"Exch":"N","ExchType":"C","ScripCode":22}
      ]
    }
    data$: Subscription ; //Observable<WebSocketData>;
    subject;
    history: any;
    historyCandles: any;
    constructor(private jwtService: JwtService, private fivePaisaService: FivePaisaService) {
            //this.getHistory();
    }

    ngAfterViewInit() {

    }
    ngOnInit() {

        //this.getHistory();

        let socketUrl = 'wss://openfeed.5paisa.com/Feeds/api/chat?Value1=';
         // tslint:disable-next-line:max-line-length
         // subject = webSocket("wss://openfeed.5paisa.com/Feeds/api/chat?Value1=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjU2MTU5NDg1Iiwicm9sZSI6IkNsaWVudCIsIlN0YXRlIjoiIiwibmJmIjoxNjQ5NzM5ODcwLCJleHAiOjE2NDk3ODgxOTksImlhdCI6MTY0OTczOTg3MH0.8-PLuV7UbPVxCz0pywJFjmSMaM1yCVmYikmcTzNQvf0|56159485");
        const token = this.jwtService.getToken();
        const clientCode= '56159485';
        socketUrl = socketUrl + token + '|' + clientCode;
        this.subject = webSocket(socketUrl);
        this.subject.subscribe(data => {
              //this.data$= JSON.parse(data);
              let data1 = data[0];
              //console.log('message received: ' + data)
              this.received=[];
              this.received.push(data[0]);

              
              this.received = this.received.map(u => u.Token !== data[0].Token ? u : data[0]);

          
          }, // Called whenever there is a message from the server.
            err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
            () => console.log('complete') // Called when connection is closed (for whatever reason).
          );
          this.subject.next(this.SocketRequest);

    }
    getHistory() {
        this.fivePaisaService.History('').subscribe((data: any) => {
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
                  text: 'CandleStick Chart',
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
    public generateDayWiseTimeSeries(baseval, count, yrange) {
        var i = 0;
        var series = [];
        while (i < count) {
          var y =
            Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

          series.push([baseval, y]);
          baseval += 86400000;
          i++;
        }
        return series;
      }

}
