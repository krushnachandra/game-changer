import { SelectionModel } from '@angular/cdk/collections';
import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable, timer } from 'rxjs';
import { NetPositionDetail, OrderBookDetail } from '../../../shared/models/user.model';
import { FivePaisaService } from '../../../shared/services/Fivepaisa.service';
import { ChartModelComponent } from '../chart-model/chart-model.component';
import { PriceModalComponent } from './price-modal/price-modal.component';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy, AfterViewInit {
    isActive: boolean;
    collapsed: boolean;
    showMenu: string;
    pushRightClass: string;
    @ViewChild('dialogRef') dialogRef!: TemplateRef<any>;
    dataSource = new MatTableDataSource<any>([]);
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild('positionSort') sort: MatSort;
    displayedColumns: string[] = [
        'scripName',
        'OrderType',
        'netQty',
        'ltp',
        'percentageOfProfit',
        'bookedPL',
        'action'
    ];

    dataSourceOrder = new MatTableDataSource<any>([]);
    @ViewChild(MatPaginator) paginatorOrder: MatPaginator;
    @ViewChild('orderSort') sortOrder: MatSort;
    displayedColumnsOrders: string[] = [
        'scripName',
        'buySell',
        'qty',
        'rate',
        'slTriggerRate',
        'brokerOrderTime',
        'orderStatus',
        'reason',
        'action'
    ];
    selection = new SelectionModel<NetPositionDetail>(true, []);

    @Output() collapsedEvent = new EventEmitter<boolean>();
    getNetPosition: any;
    totalProfitAndLoss: number;
    percentageOfProfit;
    OrderToBeModify: OrderBookDetail;
    timerSubscription: any;
    OrderBookDetails: any;
    PendingOrderBook: any;
    @ViewChild('firstNameInput') nameInputRef: ElementRef;
    pendingOrders: any;
    clappingSound = '../../assets/sound/clapping.mp3';
    StopLossOrder: any;

    constructor(
        private translate: TranslateService,
        public router: Router,
        public fivePaisaService: FivePaisaService,
        private _snackBar: MatSnackBar,
        private matDialog: MatDialog
    ) {
        this.router.events.subscribe((val) => {
            if (val instanceof NavigationEnd && window.innerWidth <= 992 && this.isToggled()) {
                this.toggleSidebar();
            }
        });
    }
    playAudio(audioName: string) {
        // let clapping = '../../assets/sound/clapping.mp3';
        const audio = new Audio(this.clappingSound);
        audio.load();
        audio.play();
    }

    ngOnInit() {
        // this.playAudio(this.clappingSound);
        this.isActive = false;
        this.collapsed = false;
        this.showMenu = '';
        this.pushRightClass = 'push-right';
        // this.getOrders();
        // this.getNetPositionNetWise();
        // this.requestDataForOrderAndPosition();

        const now = new Date().getHours();
        if (now >= 9 && now <= 16) {
            this.timerSubscription = timer(0, 5000)
                .pipe(
                    map(() => {
                        // this.getOrders();
                        //  this.getNetPositionNetWise(); // load data contains the http request
                        this.requestDataForOrderAndPosition();
                    })
                )
                .subscribe();
        } else {
            console.log('Sorry!! market is closed');
        }
    }
    requestDataForOrderAndPosition() {
        this.fivePaisaService.requestDataForOrderAndPosition().subscribe((data: any) => {
            // order processing
            this.OrderBookDetails = data[0].responseData.body.orderBookDetail
             .filter((obj) => obj.orderStatus === 'Pending' || obj.orderStatus === 'Modified');
            this.dataSourceOrder.data = this.OrderBookDetails;
            this.dataSource.sort = this.sortOrder;
            this.pendingOrders = this.OrderBookDetails.filter(
                (obj) => obj.orderStatus === 'Pending' || obj.orderStatus === 'Modified'
            );
             localStorage.removeItem('pending_Orders'); // store colors
             localStorage.setItem('pending_Orders', JSON.stringify(this.pendingOrders));
            // this.StopLossOrder = this.OrderBookDetails.filter((obj) => obj === 'Pending' || obj.orderStatus === 'Modified');


            // position procession
            this.getNetPosition = data[1].responseData.body.netPositionDetail
            .filter(obj => obj.netQty !== 0);
            this.dataSource.data = this.getNetPosition;
            // localStorage.setItem('netPositionDetail', JSON.stringify(this.getNetPosition));
            const stopLossRate = 0;

            // fetch all the pending orders from local storage
            // this.pendingOrders = JSON.parse(localStorage.getItem('pending_Orders'));

            this.totalProfitAndLoss = 0;
            // loop all the position
            this.getNetPosition.forEach((element) => {
                // check the quantity
                if (element.netQty !== 0) {
                    // if the position is Buy
                    if (element.buyQty > element.sellQty) {
                        // calculate total profit and loss
                        this.totalProfitAndLoss +=
                            element.netQty * (element.ltp - element.buyAvgRate) + element.bookedPL;
                        // set the ordertype to show in grid. From api it is not coming
                        element.OrderType = 'B';

                        // calculate points gain or loss
                        const profitPoints = element.ltp - element.buyAvgRate;

                        // set total profitOrLoss
                        element.profitOrLoss = (profitPoints * element.netQty).toFixed(2);

                        // calculate percentageOfProfit
                        this.percentageOfProfit = ((profitPoints / element.buyAvgRate) * 100).toFixed(2);

                        // localStorage.removeItem('pending_Orders'); // store colors
                        // localStorage.setItem('pending_Orders', JSON.stringify(this.pendingOrders));

                        // Seting percentageOfProfit to show in the grid and take action
                        element.percentageOfProfit = this.percentageOfProfit;

                        // check percentageOfProfit is 2 percent loss than exit the traid.
                        if (this.percentageOfProfit < -1) {
                             this.exitPosition(element);
                        }
                        // Trail the sl order when 1 percent
                        if (this.percentageOfProfit > 0.1) {
                             //this.trailStopLossOrderFromPosition(element);
                             //debugger;
                             //this.exitPosition(element);
                        }

                        let trailSL = 0;

                        const factor = this.percentageOfProfit / 0.3;
                        if (factor === 0) {
                            trailSL = stopLossRate + factor * 5;
                            if (stopLossRate < trailSL) {
                                alert(trailSL);
                                // this.TrailStopLossOrder(trailSL);
                            }
                        }

                    }
                    // if the position is Sell
                    if (element.sellQty > element.buyQty) {
                        this.totalProfitAndLoss +=
                            element.netQty * (element.ltp - element.sellAvgRate) + element.bookedPL;
                        element.OrderType = 'S';

                        const profitPoints = element.sellAvgRate - element.ltp;

                        this.percentageOfProfit = ((profitPoints / element.sellAvgRate) * 100).toFixed(2);

                        element.percentageOfProfit = this.percentageOfProfit;

                        if (this.percentageOfProfit < -1) {
                            this.exitPosition(element);
                        }
                        if (this.percentageOfProfit > 2) {
                             this.trailStopLossOrderFromPosition(element);
                        }
                        element.profitOrLoss = (profitPoints * element.netQty).toFixed(2);
                        let trailSL = 0;
                        let factor = profitPoints / 5;
                        if (profitPoints >= 2) {
                             factor = profitPoints / 5;
                            if (factor === 0) {
                                trailSL = stopLossRate - factor * 5;
                                if (stopLossRate > trailSL) {
                                    alert(trailSL);
                                    // this.TrailStopLossOrder(trailSL);
                                    // this.trailStopLossOrderFromPosition(element);
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
    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSourceOrder.sort = this.sortOrder;
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
    openTempDialog(row: any) {}
    closeDialog() {
        this.matDialog.closeAll();
    }
    getNetPositionNetWise() {
        this.fivePaisaService.NetPositionNetWise().subscribe((data: any) => {
            this.getNetPosition = data.responseData.body.netPositionDetail
            .filter(obj => obj.netQty !== 0);
            this.dataSource.data = this.getNetPosition;
            localStorage.setItem('netPositionDetail', JSON.stringify(this.getNetPosition));
            const stopLossRate = 0;

            // fetch all the pending orders from local storage
            this.pendingOrders = JSON.parse(localStorage.getItem('pending_Orders'));

            this.totalProfitAndLoss = 0;
            // loop all the position
            this.getNetPosition.forEach((element) => {
                // check the quantity
                if (element.netQty !== 0) {
                    debugger;
                    // if the position is Buy
                    if (element.buyQty > element.sellQty) {
                        // calculate total profit and loss
                        this.totalProfitAndLoss +=
                            element.netQty * (element.ltp - element.buyAvgRate) + element.bookedPL;
                        // set the ordertype to show in grid. From api it is not coming
                        element.OrderType = 'B';

                        // calculate points gain or loss
                        const profitPoints = element.ltp - element.buyAvgRate;

                        // set total profitOrLoss
                        element.profitOrLoss = (profitPoints * element.netQty).toFixed(2);

                        // calculate percentageOfProfit
                        this.percentageOfProfit = ((profitPoints / element.buyAvgRate) * 100).toFixed(2);

                        // Seting percentageOfProfit to show in the grid and take action
                        element.percentageOfProfit = this.percentageOfProfit;

                        // check percentageOfProfit is 2 percent loss than exit the traid.
                        if (this.percentageOfProfit > -1) {
                            this.exitPosition(element);
                        }
                        // Trail the sl order when 1 percent
                        if (this.percentageOfProfit > 0.5) {
                            // this.trailStopLossOrderFromPosition(element);
                            // this.exitPosition(element);
                            debugger;
                        }

                        let trailSL = 0;
                        if (profitPoints >= 2) {
                            const factor = profitPoints / 5;
                            if (factor === 0) {
                                trailSL = stopLossRate + factor * 5;
                                if (stopLossRate < trailSL) {
                                    alert(trailSL);
                                    // this.TrailStopLossOrder(trailSL);
                                }
                            }
                        }
                    }
                    // if the position is Sell
                    if (element.sellQty > element.buyQty) {
                        this.totalProfitAndLoss +=
                            element.netQty * (element.ltp - element.sellAvgRate) + element.bookedPL;
                        element.OrderType = 'S';

                        const profitPoints = element.sellAvgRate - element.ltp;

                        this.percentageOfProfit = ((profitPoints / element.sellAvgRate) * 100).toFixed(2);

                        element.percentageOfProfit = this.percentageOfProfit;

                        if (this.percentageOfProfit < -1.5) {
                            this.exitPosition(element);
                        }
                        if (this.percentageOfProfit > 0.5) {
                            // this.trailStopLossOrderFromPosition(element);
                            //this.exitPosition(element);
                            debugger;

                        }
                        element.profitOrLoss = (profitPoints * element.netQty).toFixed(2);
                        let trailSL = 0;
                        let factor = profitPoints / 5;
                        if (profitPoints >= 2) {
                             factor = profitPoints / 5;
                            if (factor === 0) {
                                trailSL = stopLossRate - factor * 5;
                                if (stopLossRate > trailSL) {
                                    alert(trailSL);
                                    // this.TrailStopLossOrder(trailSL);
                                    // this.trailStopLossOrderFromPosition(element);
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

    // modify stoploss order
    trailStopLossOrder(orderBookDetail: OrderBookDetail) {
        this.fivePaisaService.CancelOrderRequest(orderBookDetail.exchOrderID).subscribe((data: any) => {
            setTimeout(() => {
                this.addStopLoss(
                    orderBookDetail.scripCode,
                    orderBookDetail.slTriggerRate + 1,
                    orderBookDetail.buySell,
                    orderBookDetail.qty
                );
            }, 3000);
        });
    }

    ModifyStopLossOrder(orderType: string, scripCode: number, price: number, qty: number, exchOrderID: string) {
        if (orderType === 'B') {
            price = price - 1;
        } else {
            price = price + 1;
        }

        this.fivePaisaService.ModifyStopLossOrder(orderType, scripCode,  price, qty, exchOrderID).subscribe((data: any) => {
            const message = data.responseData.body.message;
            this._snackBar.open(message, 'Close', {
                duration: 5000
            });
        });
    }

    trailStopLossOrderFromPosition(netPositionDetail: NetPositionDetail) {
        if (this.pendingOrders.length > 0) {
            this.pendingOrders = JSON.parse(localStorage.getItem('pending_Orders'));
            this.OrderToBeModify = this.pendingOrders.find((x) => x.scripCode === netPositionDetail.scripCode);
            // check the sltrigger price is less than the current sl trigger price
            let previousStoplossPrice;
            if (!this.OrderToBeModify.slTriggerRate) {
            previousStoplossPrice = this.OrderToBeModify.slTriggerRate;

            } else {
            previousStoplossPrice = this.OrderToBeModify.slTriggerRate;
            }

            if (this.OrderToBeModify.buySell === 'B') {
                if (previousStoplossPrice < netPositionDetail.ltp) {
                    this.fivePaisaService
                        .CancelOrderRequest(this.OrderToBeModify.exchOrderID)
                        .subscribe((data: any) => {
                            setTimeout(() => {
                                // stoploss price will be slTriggerRate + trail percentage 0.5
                                this.addStopLoss(
                                    this.OrderToBeModify.scripCode,
                                    netPositionDetail.ltp + 1,
                                    this.OrderToBeModify.buySell,
                                    this.OrderToBeModify.qty
                                );
                            }, 1000);
                        });
                } else {
                    this.exitPosition(netPositionDetail);
                }
            }
            if (this.OrderToBeModify.buySell === 'S') {
                if (previousStoplossPrice > netPositionDetail.ltp) {
                    this.fivePaisaService
                        .CancelOrderRequest(this.OrderToBeModify.exchOrderID)
                        .subscribe((data: any) => {
                            setTimeout(() => {
                                // stoploss price will be slTriggerRate + trail percentage 0.5
                                this.addStopLoss(
                                    this.OrderToBeModify.scripCode,
                                    netPositionDetail.ltp,
                                    this.OrderToBeModify.buySell,
                                    this.OrderToBeModify.qty
                                );
                            }, 1000);
                        });
                } else {
                    this.exitPosition(netPositionDetail);
                }
            }
        }
    }

    // add a stop loss for that position
    addStopLoss(scripCode, price, orderType, quantity) {
        // let scripCode,price,orderType,quantity;
        if ((orderType = 'S')) {
            quantity = Math.abs(quantity);
        }
        this.fivePaisaService.addStopLoss(scripCode, price, orderType, quantity).subscribe((data: any) => {
            const message = data.responseData.body.message;
            this._snackBar.open(message, 'Close', {
                duration: 5000
            });
            // this.getOrders();
        });
    }

    // exit this position
    exitPosition(netPositionDetail: NetPositionDetail) {
        let qty;
        let orderType;
        if ((netPositionDetail.OrderType = 'S')) {
            qty = Math.abs(netPositionDetail.netQty);
            orderType = 'B';
        } else {
            qty = netPositionDetail.netQty;
            orderType = 'S';
        }
        this.fivePaisaService
            .exitPosition(netPositionDetail.scripCode, netPositionDetail.ltp, orderType, qty)
            .subscribe((data: any) => {
                const message = data.responseData.body.message;
                this._snackBar.open(message, 'Close', {
                    duration: 5000
                });
            });
        if (this.pendingOrders.length > 0) {
            this.OrderToBeModify = this.pendingOrders.find((x) => x.scripCode === netPositionDetail.scripCode);
            this.CancelOrderRequest(this.OrderToBeModify);
        }
        // this.getOrders();
    }
    // this is used when position wants to reverse instead of exit
    reversePosition(trailSlPrice: number) {
        this.OrderToBeModify.rate = trailSlPrice;
        this.fivePaisaService.reversePosition(this.OrderToBeModify).subscribe((data: any) => {
            const message = data.responseData.body.message;
            this._snackBar.open(message, 'Close', {
                duration: 5000
            });
        });
    }

    getOrders() {
        this.fivePaisaService.OrderBook().subscribe((data: any) => {
            this.OrderBookDetails = data.responseData.body.orderBookDetail
            // .filter((obj) => obj.orderStatus === 'Pending' || obj.orderStatus === 'Modified');
            this.dataSourceOrder.data = this.OrderBookDetails;
            this.dataSource.sort = this.sortOrder;
            this.PendingOrderBook = this.OrderBookDetails.filter(
                (obj) => obj.orderStatus === 'Pending' || obj.orderStatus === 'Modified'
            );
            localStorage.removeItem('pending_Orders'); // store colors
            localStorage.setItem('pending_Orders', JSON.stringify(this.PendingOrderBook));
            this.StopLossOrder = this.OrderBookDetails.filter((obj) => obj === 'Pending' || obj.orderStatus === 'Modified');
            // store colors
        });
    }

    ModifyOrderRequest(orderBookDetail: OrderBookDetail) {
        this.fivePaisaService.ModifyOrderRequest(orderBookDetail).subscribe((data: any) => {
            const message = data.responseData.body.message;
            this._snackBar.open(message, 'Close', {
                duration: 5000
            });
        });
    }
    CancelOrderRequest(orderBookDetail: OrderBookDetail) {
        this.fivePaisaService.CancelOrderRequest(orderBookDetail.exchOrderID).subscribe((data: any) => {
            const message = data.responseData.body.message;
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
    openModal(orderBookDetail: OrderBookDetail) {
        this.matDialog.open(PriceModalComponent, {
            // maxWidth: '100vw',
            maxHeight: '90vh',
            height: '80%',
            width: '80%',
            panelClass: 'full-screen-modal',
            data: {
                 marketFeedData: orderBookDetail
            }
        });
    }
    charModalOpen(orderBookDetail: OrderBookDetail) {
        this.matDialog.open(ChartModelComponent, {
            // maxWidth: '100vw',
            maxHeight: '90vh',
            height: '80%',
            width: '80%',
            panelClass: 'full-screen-modal',
            data: {
                 marketFeedData: orderBookDetail
            }
        });
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
        // return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
    }
}
