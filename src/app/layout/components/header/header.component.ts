import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import { JwtService } from '../../../shared/services/jwt-service';
import { FivePaisaService } from '../../../shared/services/Fivepaisa.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    public pushRightClass: string;
    Margin: any;
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
      data$: Subscription ;
    subject: any;
    received: any[];
    userName: string;
    constructor(private translate: TranslateService, public router: Router,private jwtService: JwtService, private fivePaisaService: FivePaisaService) {
        this.router.events.subscribe((val) => {
            if (val instanceof NavigationEnd && window.innerWidth <= 992 && this.isToggled()) {
                this.toggleSidebar();
            }
        });
    }

    ngOnInit() {
        this.pushRightClass = 'push-right';
        this.userName = localStorage.getItem('userName')
        this.getMargins();
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

    isToggled(): boolean {
        const dom: Element = document.querySelector('body');
        return dom.classList.contains(this.pushRightClass);
    }

    toggleSidebar() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle(this.pushRightClass);
    }

    rltAndLtr() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle('rtl');
    }

    onLoggedout() {
        localStorage.removeItem('isLoggedin');
    }

    changeLang(language: string) {
        this.translate.use(language);
    }
    getMargins() {
        this.fivePaisaService.Margin().subscribe((data: any) => {
            this.Margin = data.responseData.body.equityMargin[0].availableMargin;
          });
    }
}
