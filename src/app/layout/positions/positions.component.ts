import { Component, OnDestroy, OnInit } from '@angular/core';
import { FivePaisaService } from '../../shared/services/Fivepaisa.service';
import { NetPositionDetail, OrderBookDetail, Slider } from '../../shared/models/user.model';
import { ChangeContext, Options } from '@angular-slider/ngx-slider';
import { map, timer } from 'rxjs';

@Component({
    selector: 'positions-page',
    templateUrl: './positions.component.html',
    styleUrls: ['./positions.component.scss']
})
export class PositionsComponent implements OnInit, OnDestroy {
    OrderBookDetails: any;
    holdings: any;
    getNetPosition: NetPositionDetail[];
    profitAndLoss: any;
    totalProfitAndLoss = 0;
    totalHoldingProfitAndLoss = 0;
    timerSubscription: any;
    pendingOrders: OrderBookDetail[];
    OrderToBeModify: OrderBookDetail;
    percentageOfProfit: number;
    constructor(public fivePaisaService: FivePaisaService) {}
    minValue: number;
    maxValue: number;

    ngOnInit() {
        this.getHolding();
        this.getNetPositionNetWise();
        const now = new Date().getHours();
    /**
     *  check if value in now is between 9am and 4pm
     *  9am -> 9
     *  6pm -> 18
     */
    if (now >= 9 && now <= 16) {
      this.timerSubscription = timer(0, 3000).pipe(
        map(() => {
          this.getNetPositionNetWise(); // load data contains the http request
        })
      ).subscribe();
    } else {
      console.log('Sorry!! market is closed');
    }

    }
    getNetPositionNetWise() {
        this.fivePaisaService.NetPositionNetWise().subscribe((data: any) => {
            this.getNetPosition = data.responseData.body.netPositionDetail;
            this.totalProfitAndLoss = 0;
            this.getNetPosition.forEach(element => {

              let stopLossRate: number;
            //   this.pendingOrders = JSON.parse(localStorage.getItem('pending_Orders'));
            //   if (!this.pendingOrders) {
            //     this.OrderToBeModify = this.pendingOrders.find(x => x.scripCode === element.scripCode);
            //     if (this.OrderToBeModify !== undefined) {
            //     stopLossRate = this.OrderToBeModify.slTriggerRate;
            //     } else {
            //         stopLossRate = 0;
            //         // place stop loss order
            //     }
            //   }

              const slider: Slider = {} as Slider;
              element = Object.assign(element, {slider});
              element.slider.minValue = 0;
              element.slider.rightToLeft = false;
              element.slider.floor = 0;
              element.slider.ceil = 250;
              element.slider.noSwitching = false;

               // this.totalProfitAndLoss += element.bodQty * (element.buyAvgRate - element.ltp);
               if (element.netQty !== 0) {

                // if the position is buy
                if (element.buyQty > element.sellQty) {
                    this.totalProfitAndLoss += element.netQty * (element.ltp - element.buyAvgRate) + element.bookedPL;

                    element.slider.floor = stopLossRate;
                    element.slider.ceil = +(element.buyAvgRate + element.buyAvgRate * 20 / 100).toFixed(2);
                    element.slider.minValue = element.buyAvgRate;
                    element.slider.maxValue = element.ltp;

                    const profitPoints = element.ltp - element.buyAvgRate;
                     this.percentageOfProfit = +(profitPoints / element.buyAvgRate * 100).toFixed(2);

                    let trailSL = 0;

                    if (profitPoints >= 2) {
                        const factor = profitPoints / 5;
                        // if(factor==0){
                            trailSL = stopLossRate + factor * 5;
                            if (stopLossRate < trailSL) {
                            this.trailStopLoss(trailSL);
                        // }
                    }
                    }
                }
                if (element.sellQty > element.buyQty) {
                    this.totalProfitAndLoss += element.netQty * (element.ltp - element.sellAvgRate) + element.bookedPL;
                    element.slider.rightToLeft = true;

                    element.slider.ceil = stopLossRate;
                    element.slider.floor =  +(element.sellAvgRate - (element.sellAvgRate * 20 / 100)).toFixed(2) ;
                    element.slider.maxValue =  element.ltp;
                    element.slider.minValue =  element.sellAvgRate;

                    const profitPoints =  element.sellAvgRate - element.ltp;
                    this.percentageOfProfit = +(profitPoints / element.sellAvgRate * 100).toFixed(2);
                    let trailSL = 0;
                    if (profitPoints >= 2) {
                        const factor = profitPoints / 5;
                        // if(factor==0){
                            trailSL = stopLossRate - factor * 5;
                            if (stopLossRate > trailSL) {
                            this.trailStopLoss(trailSL);
                            }
                        // }

                    }
                }

               } else {
                this.totalProfitAndLoss += element.bookedPL;
                element.slider.disabled = true;
               }
            });
            this.totalProfitAndLoss = +this.totalProfitAndLoss.toFixed(2);
          });
    }
    getHolding() {
        this.fivePaisaService.Holding().subscribe((data: any) => {
            this.holdings = data.responseData.body.data;
            this.totalHoldingProfitAndLoss = 0;
            this.holdings.forEach(element => {
                this.totalHoldingProfitAndLoss += element.bodQty * (element.buyAvgRate - element.ltp);
            });
            this.totalHoldingProfitAndLoss = +this.totalHoldingProfitAndLoss.toFixed(2);
          });
    }
    onUserChangeEnd(changeContext: ChangeContext, netPositionDetail: NetPositionDetail): void {
        console.log(changeContext, netPositionDetail);
        // if(changeContext.pointerType === 'Max'){

        // }
        // else {


        // }
        this.OrderToBeModify = this.pendingOrders.find(x => x.scripCode === netPositionDetail.scripCode);
        this.fivePaisaService.ModifyOrderRequest(this.OrderToBeModify).subscribe((data: any) => {
        });
        // call modify Order of that script
    }

    trailStopLoss (trailSlPrice: number) {
        this.OrderToBeModify.rate = trailSlPrice;
        this.fivePaisaService.ModifyOrderRequest(this.OrderToBeModify).subscribe((data: any) => {
    });

    }

    ngOnDestroy(): void {
        if (this.timerSubscription !== undefined) {
            this.timerSubscription.unsubscribe();
        }
    }
}
