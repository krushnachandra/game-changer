import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HistoryResponse, Holding,
     HoldingResponse, MarginResponse, MarketFeedData, MarketFeedResponse,
     ModifySMOOrderResponse, NetPositionDetail, NetPositionDetailResponse, OrderBookDetail,
      OrderBookResponse, OrderRequestResponse, OrdStatusResList,
      OrdStatusResponse, SMOOrderRequestResponse, TradeBookResponse, TradeInformationResponse } from '../models/user.model';

@Injectable()
export class FivePaisaService {

    baseUrl= environment.api_url;
  //baseUrl = 'https://localhost:44361/api/FivepaisaAPI/';
  // iis base url
  //baseUrl = 'https://localhost/api/FivepaisaAPI/';
  fivePaisaBaseUrl = 'https://Openapi.5paisa.com/VendorsAPI/Service1.svc/V4/LoginRequestMobileNewbyEmail';
  user = {
    'body': {
      'Email_id': 'Mi8B2sZQdm4Zos+QFr6ksCrqqBGaAhJibYIEcQu3+2I=',
      'Password': '7x5b4oKjBdxiTDWHQFGUH/HTANUBM3l4UiFxIABsWyE=',
      'LocalIP': '122.183.33.6',
      'PublicIP': '122.183.33.6',
      'HDSerailNumber': '',
      'MACAddress': '',
      'MachineID': '039377 ',
      'VersionNo': '1.7',
      'RequestNo': '1',
      'My2PIN': '7q+eamJL4aMBfnAZ8iI9Ng==',
      'ConnectionType': '1'
    },
    'head': {
      'appName': '5P56159485',
      'appVer': '1.0',
      'key': 'Wp3fKXyAsRbsL8EpgL5TjVjNOhxt5PuD',
      'osName': 'WEB',
      'requestCode': '5PLoginV4',
      'userId': 'WRREViJXizS',
      'password': 'bdnGlDDXOON'
    }
  };
    quantity: number = 10;
  constructor(private http: HttpClient) {}

  // private options = { headers: new HttpHeaders().set('Content-Type', 'application/json') };

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*' });
    private options = { headers: this.headers };

   Login(): Observable<any> {
    return this.http.post<any>(this.fivePaisaBaseUrl, this.user, this.options);
  }
  Holding(): Observable<HoldingResponse> {
        return this.http.get(this.baseUrl + 'Holding')
        .pipe((data: any) => {
            return data;
        });
  }

  NetPositionNetWise(): Observable<NetPositionDetailResponse> {
    return this.http.get(this.baseUrl + 'NetPositionNetWise')
    .pipe((data: any) => {
        return data;
    });
  }

  OrderStatus(): Observable<OrdStatusResponse> {
    return this.http.get(this.baseUrl + 'OrderStatus')
    .pipe((data: any) => {
        return data;
    });
  }

  TradeInformation(): Observable<TradeInformationResponse> {
    return this.http.get(this.baseUrl + 'TradeInformation')
    .pipe((data: any) => {
        return data;
    });
  }

  TradeBook(): Observable<TradeBookResponse> {
    return this.http.get(this.baseUrl + 'TradeBook')
    .pipe((data: any) => {
        return data;
    });
  }

  OrderBook(): Observable<OrderBookResponse> {
    return this.http.get(this.baseUrl + 'OrderBook')
    .pipe((data: any) => {
        return data;
    });
  }

  Margin(): Observable<MarginResponse> {
    return this.http.get(this.baseUrl + 'Margin')
    .pipe((data: any) => {
        return data;
    });
  }

  MarketFeed(tabNumber: number): Observable<MarketFeedResponse> {
    return this.http.get(this.baseUrl + 'MarketFeed?tabNumber=' + tabNumber)
    .pipe((data: any) => {
        return data;
    });
  }

  OrderRequest(marketFeedData: MarketFeedData, orderType: string): Observable<OrderRequestResponse> {
    return this.http.get(this.baseUrl + 'OrderRequest?scripCode=' + marketFeedData.token + '&price=' + marketFeedData.lastRate + '&quantity=' + this.quantity + '&orderType=' + orderType)
    .pipe((data: any) => {
        return data;
    });
  }

  ModifyOrderRequest(orderData: OrderBookDetail): Observable<OrderRequestResponse> {
    return this.http.get(this.baseUrl + 'ModifyOrderRequest?price=' + orderData.slTriggerRate + '&qty=' +
    orderData.qty + '&exchOrderID=' + orderData.exchOrderID)
    .pipe((data: any) => {
        return data;
    });
  }

  exitPosition(scripCode,price,orderType,quantity): Observable<any> {
    debugger;
    return this.http.get(this.baseUrl + 'ExitPosition?scripCode=' + scripCode + '&price=' + price + '&quantity=' + quantity + '&orderType=' + orderType)
    .pipe((data: any) => {
        return data;
    });
  }

  reversePosition(OrderToBeModify: any): Observable<any> {
    throw new Error('Method not implemented.');
  }

  addStopLoss(scripCode,price,orderType,quantity): Observable<any> {
    debugger;
    return this.http.get(this.baseUrl + 'StopLossOrderRequest?scripCode=' + scripCode + '&price=' + price  + '&quantity=' + quantity + '&orderType=' + orderType)
    .pipe((data: any) => {
        return data;
    });
  }

  trailStopLossOrder(scripCode,price,orderType,quantity) : Observable<OrderRequestResponse> {
    return this.http.get(this.baseUrl + 'TrailStopLossOrder?scripCode=' + scripCode + '&price=' + price  + '&quantity=' + quantity + '&orderType=' + orderType)
    .pipe((data: any) => {
        return data;
    });
}

  CancelOrderRequest(exchOrderID: string): Observable<OrderRequestResponse> {
    return this.http.get(this.baseUrl + 'CancelOrderRequest?exchOrderID=' + exchOrderID )
    .pipe((data: any) => {
        return data;
    });
  }
  SMOOrderRequest(): Observable<SMOOrderRequestResponse> {
    return this.http.get(this.baseUrl + 'SMOOrderRequest')
    .pipe((data: any) => {
        return data;
    });
  }

  ModifySMOOrder(): Observable<ModifySMOOrderResponse> {
    return this.http.get(this.baseUrl + 'ModifySMOOrder')
    .pipe((data: any) => {
        return data;
    });
  }
  History(scriptcode): Observable<HistoryResponse> {
    return this.http.get(this.baseUrl + 'Historical?scriptcode=' + scriptcode)
    .pipe((data: any) => {
        return data;
    });
  }
}
