import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable, timer } from 'rxjs';
import { NetPositionDetail, OrderBookDetail } from '../../../shared/models/user.model';
import { FivePaisaService } from '../../../shared/services/Fivepaisa.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, AfterViewInit {
    isActive: boolean;
    collapsed: boolean;
    showMenu: string;
    pushRightClass: string;
    dataSource = new MatTableDataSource<any>([]);
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild('positionSort') sort: MatSort;
    displayedColumns: string[] = [ 'select','scripName', 'OrderType', 'netQty', 'ltp', 'percentageOfProfit','bookedPL' , 'action'];

    dataSourceOrder = new MatTableDataSource<any>([]);
    @ViewChild(MatPaginator) paginatorOrder: MatPaginator;
    @ViewChild('orderSort') sortOrder: MatSort;
    displayedColumnsOrders: string[] = [ 'scripName', 'buySell', 'qty', 'slTriggerRate', 'brokerOrderTime','orderStatus','reason' , 'action'];
    selection = new SelectionModel<NetPositionDetail>(true, []);


    @Output() collapsedEvent = new EventEmitter<boolean>();
    getNetPosition: any;
    totalProfitAndLoss: number;
    percentageOfProfit;
    OrderToBeModify: OrderBookDetail;
    timerSubscription: any;
    OrderBookDetails: any;
    PendingOrderBook: any;
    @ViewChild('firstNameInput') nameInputRef:ElementRef;
    pendingOrders: any;
    constructor(private translate: TranslateService, public router: Router,
        public fivePaisaService: FivePaisaService, private _snackBar: MatSnackBar ) {
        this.router.events.subscribe((val) => {
            if (val instanceof NavigationEnd && window.innerWidth <= 992 && this.isToggled()) {
                this.toggleSidebar();
            }
        });
    }
    playAudio(){
        let src = '../../assets/sound/clapping.mp3';
        let audio = new Audio(src);
        audio.load();
        audio.play();
    }

    ngOnInit() {
        //this.playAudio();
        this.isActive = false;
        this.collapsed = false;
        this.showMenu = '';
        this.pushRightClass = 'push-right';
        this.getOrders();
        this.getNetPositionNetWise();
        const now = new Date().getHours();
        if (now >= 9 && now <= 16) {
           this.timerSubscription = timer(0, 5000).pipe(
             map(() => {
              this.getOrders();
              this.getNetPositionNetWise(); // load data contains the http request
             })
          ).subscribe();
       } else {
         console.log('Sorry!! market is closed');
        }
    }
    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSourceOrder.sort= this.sortOrder;
      }
    eventCalled() {
        this.isActive = !this.isActive;
    }

    addExpandClass(element: any) {
        if (element === this.showMenu) {
            this.showMenu = '0';
        } else {
            this.showMenu = element;
        }
    }

    toggleCollapsed() {
        this.collapsed = !this.collapsed;
        this.collapsedEvent.emit(this.collapsed);
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

    changeLang(language: string) {
        this.translate.use(language);
    }

    onLoggedout() {
        localStorage.removeItem('isLoggedin');
    }
    getNetPositionNetWise() {
        this.fivePaisaService.NetPositionNetWise().subscribe((data: any) => {
            this.getNetPosition = data.responseData.body.netPositionDetail;
            this.dataSource.data =this.getNetPosition;
            localStorage.setItem('netPositionDetail', JSON.stringify(data.responseData.body.netPositionDetail));
            let stopLossRate=0;

            // fetch all the pending orders from local storage
            this.pendingOrders = JSON.parse(localStorage.getItem('pending_Orders'));

            this.totalProfitAndLoss = 0;
            // loop all the position
            this.getNetPosition.forEach(element => {
               // check the quantity
               if (element.netQty !== 0) {
                // if the position is Buy
                if (element.buyQty > element.sellQty) {
                    // calculate total profit and loss
                    this.totalProfitAndLoss += element.netQty * (element.ltp - element.buyAvgRate) + element.bookedPL;
                    //set the ordertype to show in grid. From api it is not coming
                    element.OrderType="B"

                    // calculate points gain or loss
                    const profitPoints = element.ltp - element.buyAvgRate;

                    // set total profitOrLoss
                    element.profitOrLoss = (profitPoints * element.netQty).toFixed(2);

                    // calculate percentageOfProfit
                     this.percentageOfProfit = (profitPoints / element.buyAvgRate * 100).toFixed(2);

                     //Seting percentageOfProfit to show in the grid and take action
                     element.percentageOfProfit = this.percentageOfProfit;

                     // check percentageOfProfit is 2 percent loss than exit the traid.
                     if (this.percentageOfProfit > -2) {
                        this.exitPosition(element);
                    }
                    // Trail the sl order when 1 percent
                    if (this.percentageOfProfit > 0.5) {
                        this.trailStopLossOrderFromPosition(element);
                    }

                    let trailSL = 0;
                    if (profitPoints >= 2) {
                        const factor = profitPoints / 5;
                        if(factor==0){
                            trailSL = stopLossRate + factor * 5;
                            if (stopLossRate < trailSL) {
                                alert(trailSL);
                                //this.TrailStopLossOrder(trailSL);
                            }
                        }
                    }
                }
                // if the position is Sell
                if (element.sellQty > element.buyQty) {

                    this.totalProfitAndLoss += element.netQty * (element.ltp - element.sellAvgRate) + element.bookedPL;

                    element.OrderType="S"

                    const profitPoints =  element.sellAvgRate - element.ltp;

                    this.percentageOfProfit = (profitPoints / element.sellAvgRate * 100).toFixed(2);

                    element.percentageOfProfit = this.percentageOfProfit;

                    if (this.percentageOfProfit < -2) {
                        this.exitPosition(element);
                    }

                    if (this.percentageOfProfit < 0.5) {
                        this.trailStopLossOrderFromPosition(element);
                    }

                    element.profitOrLoss = (profitPoints * element.netQty).toFixed(2);
                    let trailSL = 0;
                    const factor = profitPoints / 5;
                    if (profitPoints >= 2) {
                        const factor = profitPoints / 5;
                         if(factor==0){
                            trailSL = stopLossRate - factor * 5;
                            if (stopLossRate > trailSL) {
                                alert(trailSL);
                               //this.TrailStopLossOrder(trailSL);
                            }
                         }
                    }
                }

               } else {
                this.totalProfitAndLoss += element.bookedPL;
               }
            });
            this.totalProfitAndLoss = +this.totalProfitAndLoss.toFixed(2);
          });
    }

    trailStopLossOrder(orderBookDetail: OrderBookDetail) {
    this.fivePaisaService.CancelOrderRequest(orderBookDetail.exchOrderID).subscribe((data: any) => {
        this.fivePaisaService.addStopLoss(orderBookDetail.scripCode,orderBookDetail.slTriggerRate,orderBookDetail.buySell,orderBookDetail.qty).subscribe((data: any) => {
            let message= data.responseData.body.message;
            this._snackBar.open(message, 'Close', {
              duration: 5000
            });
       });
      });
    }

    trailStopLossOrderFromPosition(netPositionDetail: NetPositionDetail) {
        if (!this.pendingOrders) {
            this.OrderToBeModify = this.pendingOrders.find(x => x.scripCode === netPositionDetail.scripCode);
            if (this.OrderToBeModify !== undefined) {
                this.fivePaisaService.CancelOrderRequest(this.OrderToBeModify.exchOrderID).subscribe((data: any) => {
                    // stoploss price will be slTriggerRate + trail percentage 0.5
                    this.fivePaisaService.addStopLoss(this.OrderToBeModify.scripCode,this.OrderToBeModify.slTriggerRate,this.OrderToBeModify.buySell,this.OrderToBeModify.qty).subscribe((data: any) => {
                        let message= data.responseData.body.message;
                        this._snackBar.open(message, 'Close', {
                          duration: 5000
                        });
                   });
                });
            }
            else {
                //stopLossRate = 0;
                // place stop loss order
            }
          }
    }

    // add a stop loss for that position
    addStopLoss (scripCode,price,orderType,quantity) {
        //let scripCode,price,orderType,quantity;

        this.fivePaisaService.addStopLoss(scripCode,price,orderType,quantity).subscribe((data: any) => {
            let message= data.responseData.body.message;
            this._snackBar.open(message, 'Close', {
              duration: 5000
            });
       });
    }

    // exit this position
    exitPosition(positionDetail:NetPositionDetail) {
        let qty;
        if (positionDetail.OrderType='S') {
            qty=  Math.abs(positionDetail.netQty);
        }
        else {
            qty= positionDetail.netQty
        }
        this.fivePaisaService.exitPosition(positionDetail.scripCode,positionDetail.ltp,positionDetail.OrderType,qty).subscribe((data: any) => {
            let message= data.responseData.body.message;
            this._snackBar.open(message, 'Close', {
              duration: 5000
            });
       });
    }
    // this is used when position wants to reverse instead of exit
    reversePosition(trailSlPrice: number) {
        this.OrderToBeModify.rate = trailSlPrice;
        this.fivePaisaService.reversePosition(this.OrderToBeModify).subscribe((data: any) => {
            let message= data.responseData.body.message;
            this._snackBar.open(message, 'Close', {
              duration: 5000
            });
       });
    }

    getOrders() {
        this.fivePaisaService.OrderBook().subscribe((data: any) => {
            this.OrderBookDetails = data.responseData.body.orderBookDetail
             .filter(obj => obj.orderStatus === 'Pending' || obj.orderStatus === 'Modified' || obj.orderStatus === 'Fully Executed');
             this.dataSourceOrder.data= this.OrderBookDetails;
             this.dataSource.sort = this.sortOrder;
             this.PendingOrderBook = this.OrderBookDetails.filter(obj => obj.orderStatus === 'Pending' || obj.orderStatus === 'Modified');
            localStorage.removeItem('pending_Orders'); // store colors
            localStorage.setItem('pending_Orders', JSON.stringify(this.PendingOrderBook));
            // store colors
          });
    }

    ModifyOrderRequest(orderBookDetail: OrderBookDetail) {
        this.fivePaisaService.ModifyOrderRequest(orderBookDetail).subscribe((data: any) => {
            let message= data.responseData.body.message;
            this._snackBar.open(message, 'Close', {
              duration: 5000
            });
          });
    }
    CancelOrderRequest(orderBookDetail: OrderBookDetail)  {
        this.fivePaisaService.CancelOrderRequest(orderBookDetail.exchOrderID).subscribe((data: any) => {
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

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: NetPositionDetail): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    //return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

}
