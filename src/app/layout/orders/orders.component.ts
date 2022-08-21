import { Component, OnDestroy, OnInit } from '@angular/core';
import { FivePaisaService } from '../../shared/services/Fivepaisa.service';
import { routerTransition } from '../../router.animations';
import { NetPositionDetail, NetPositionDetailResponse, OrderBookDetail } from '../../shared/models/user.model';
import { map, timer } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-orders',
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss'],
    animations: [routerTransition()]
})
export class OrdersComponent implements OnInit,OnDestroy {
    OrderBookDetails: OrderBookDetail[];
    PendingOrderBook: OrderBookDetail[];

    holdings: any;
    getNetPosition: NetPositionDetail[];
    profitAndLoss: any;
    totalProfitAndLoss = 0;
    totalHoldingProfitAndLoss = 0;
    timerSubscription: any;
    constructor(public fivePaisaService: FivePaisaService, private _snackBar: MatSnackBar ) {}

    ngOnInit() {
        this.getOrders();
        const now = new Date().getHours();
        if (now >= 9 && now <= 16) {
          // this.timerSubscription = timer(0, 5000).pipe(
            // map(() => {
              this.getOrders(); // load data contains the http request
            // })
         // ).subscribe();
        } else {
          console.log('Sorry!! market is closed');
        }
    }


    getOrders() {
        this.fivePaisaService.OrderBook().subscribe((data: any) => {
            this.OrderBookDetails = data.responseData.body.orderBookDetail;
            // .filter(obj => obj.orderStatus === 'Pending' || obj.orderStatus === 'Modified');

            this.PendingOrderBook = this.OrderBookDetails.filter(obj => obj.orderStatus === 'Pending' || obj.orderStatus === 'Modified');
            localStorage.removeItem('pending_Orders'); // store colors
            localStorage.setItem('pending_Orders', JSON.stringify(this.PendingOrderBook));
            // store colors
          });
    }
    ModifyOrderRequest(orderBookDetail: OrderBookDetail) {
        this.fivePaisaService.ModifyOrderRequest(orderBookDetail).subscribe((data: any) => {
            this.getOrders();
          });
    }
    CancelOrderRequest(orderBookDetail: OrderBookDetail) {
        this.fivePaisaService.CancelOrderRequest(orderBookDetail.exchOrderID).subscribe((data: any) => {
            this.getOrders();
            let message= data.responseData.body.message;
            this._snackBar.open(message, 'Close', {
              duration: 5000
            });
          });
    }
    ngOnDestroy(): void {
        if (this.timerSubscription !== undefined) {
            this.timerSubscription.unsubscribe();
        }
      }
}
