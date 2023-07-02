
  export interface User {
    allowBseCash: string;
    allowBseDeriv: string;
    allowBseMF: string;
    allowMCXComm: string;
    allowMcxSx: string;
    allowNSECurrency: string;
    allowNSEL: string;
    allowNseCash: string;
    allowNseComm: string;
    allowNseDeriv: string;
    allowNseMF: string;
    bulkOrderAllowed: number;
    cleareDt: string;
    clientCode: string;
    clientName: string;
    clientType: number;
    demoTrial: string;
    emailId: string;
    interactiveLocalIP: string;
    interactivePort: number;
    interactivePublicIP: string;
    isIDBound: number;
    isIDBound2: number;
    isOnlyMF: string;
    isPLM: number;
    isPLMDefined: number;
    lastAccessedTime: string;
    lastLogin: string;
    jwtToken: string;
    lastPasswordModify: string;
    message: string;
    oTPCredentialID: string;
    pLMsAllowed: number;
    pOAStatus: string;
    passwordChangeFlag: number;
    passwordChangeMessage: string;
    runningAuthorization: number;
    serverDt: string;
    status: number;
    tCPBCastPort: number;
    tCPBcastLocalIP: string;
    tCPBcastPublicIP: string;
    uDPBCastPort: number;
    uDPBcastIP: string;
    versionChanged: number;
}

export interface NetPositionDetail {
  bodQty: number;
  bookedPL: number;
  buyAvgRate: number;
  buyQty: number;
  buyValue: number;
  exch: string;
  exchType: string;
  ltp: number;
  mTOM: number;
  multiplier: number;
  netQty: number;
  orderFor: string;
  previousClose: number;
  scripCode: number;
  scripName: string;
  sellAvgRate: number;
  sellQty: number;
  sellValue: number;
  slider: Slider;
  OrderType: string;
}

export interface Slider {
  maxValue: number;
  minValue: number;
  floor: number;
  ceil: number;
  step: number;
  showTicks: boolean;
  rightToLeft: boolean;
  disabled: boolean;
  noSwitching: boolean;
}
export interface NetPositionDetailResponse {
  message: string;
  netPositionDetail: NetPositionDetail[];
  status: number;
}

export interface Holding {
  avgRate: number;
  bseCode: number;
  currentPrice: number;
  dPQty: number;
  exch: string;
  exchType: string;
  fullName: string;
  nseCode: number;
  pOASigned: string;
  poolQty: number;
  quantity: number;
  scripMultiplier: number;
  symbol: string;
}

export interface OrdStatusResList {
  exch: string;
  exchOrderID: number;
  exchOrderTime: string;
  exchType: string;
  orderQty: number;
  orderRate: number;
  pendingQty: number;
  scripCode: number;
  status: string;
  symbol: string;
  tradedQty: number;
}

export interface OrdStatusResponse {
  message: string;
  ordStatusReqList: OrdStatusResList[];
  status: number;
}

export interface HoldingResponse {
  cacheTime: number;
  data: Holding[];
  message: string;
  status: number;
}

export interface OrderBookDetail {
  aHProcess: string;
  afterHours: string;
  atMarket: string;
  brokerOrderId: number;
  brokerOrderTime: string;
  buySell: string;
  delvIntra: string;
  disClosedQty: number;
  exch: string;
  exchOrderID: string;
  exchOrderTime: string;
  exchType: string;
  marketLot: number;
  oldorderQty: number;
  orderRequesterCode: string;
  orderStatus: string;
  orderValidUpto: string;
  orderValidity: number;
  pendingQty: number;
  qty: number;
  rate: number;
  reason: string;
  requestType: string;
  slTriggerRate: number;
  slTriggered: string;
  sMOProfitRate: number;
  sMOSLLimitRate: number;
  sMOSLTriggerRate: number;
  sMOTrailingSL: number;
  scripCode: number;
  scriptName: string;
  terminalId: number;
  tradedQty: number;
  withSL: string;
}

export interface OrderBookResponse {
  message: string;
  orderBookDetail: OrderBookDetail[];
  status: number;
}

export interface EquityMargin {
  aLB: number;
  adhoc: number;
  availableMargin: number;
  gHV: number;
  gHVPer: number;
  grossMargin: number;
  mgn4PendOrd: number;
  mgn4Position: number;
  optionsMtoMLoss: number;
  pDHV: number;
  payments: number;
  receipts: number;
  tHV: number;
}

export interface MarginResponse {
  clientCode: string;
  equityMargin: EquityMargin[];
  message: string;
  status: number;
  timeStamp: string;
}

export interface TradeBookDetail {
  buySell: string;
  delvIntra: string;
  exch: string;
  exchOrderID: string;
  exchType: string;
  exchangeTradeID: string;
  exchangeTradeTime: string;
  multiplier: number;
  orgQty: number;
  pendingQty: number;
  qty: number;
  rate: number;
  scripCode: number;
  scripName: string;
  tradeType: string;
}

export interface TradeBookResponse {
  message: string;
  status: number;
  tradeBookDetail: TradeBookDetail[];
}

export interface MarketData {
  exch: string;
  exchType: string;
  high: number;
  lastRate: number;
  low: number;
  pClose: number;
  tickDt: string;
  time: number;
  token: number;
  totalQty: number;
}
export interface TradeInformation {
  pClose: number;
  tickDt: string;
  time: number;
  token: number;
}

export interface TradeInformationResponse {
  message: string;
  status: number;
  tradeInformation: TradeInformation[];
}
export interface MarketFeedData {
  exch: string;
  exchType: string;
  high: number;
  lastRate: number;
  low: number;
  pClose: number;
  tickDt: string;
  time: number;
  token: number;
  totalQty: number;
  symbol: string;
  chgPcnt: number;
  chg: number;
}

export interface MarketFeedResponse {
  cacheTime: number;
  data: MarketFeedData[];
  message: string;
  status: number;
  timeStamp: string;
}

export interface OrderRequestResponse {
  brokerOrderID: number;
  clientCode: string;
  exch: string;
  exchOrderID: string;
  exchType: string;
  localOrderID: number;
  message: string;
  rMSResponseCode: number;
  scripCode: number;
  status: number;
  time: string;
}

export interface SMOOrderRequestResponse {
  addReqMgn: number;
  avlbMgn: number;
  brokerOrderIDNormal: number;
  brokerOrderIDProfit: number;
  brokerOrderIDSL: number;
  clientCode: string;
  exch: string;
  exchOrderID: number;
  exchType: string;
  firstOrderPrice: number;
  firstOrderTriggerPrice: number;
  localOrderIDNormal: number;
  localOrderIDProfit: number;
  localOrderIDSL: number;
  message: string;
  profitPrice: number;
  rMSResponseCode: number;
  rMSStatus: number;
  sLOrderPrice: number;
  sLOrderTriggerPrice: number;
  time: number;
  trailingSL: number;
}

export interface ModifySMOOrderResponse {
  addReqMgn: number;
  avlbMgn: number;
  brokerOrderID: number;
  clientCode: string;
  exch: any;
  exchOrderID: number;
  exchType: any;
  localOrderID: number;
  message: string;
  rMSResponseCode: number;
  scripCode: number;
  status: number;
  time: string;
}

export interface LoginCheckResponse {
  message: string;
  status: number;
}

export interface WebSocketData {
  Exch:     string;
  ExchType: string;
  Token:    number;
  LastRate: number;
  LastQty:  number;
  TotalQty: number;
  High:     number;
  Low:      number;
  OpenRate: number;
  PClose:   number;
  AvgRate:  number;
  Time:     number;
  BidQty:   number;
  BidRate:  number;
  OffQty:   number;
  OffRate:  number;
  TBidQ:    number;
  TOffQ:    number;
  TickDt:   string;
  ChgPcnt:  number;
}
export interface Candles {
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface HistoryResponse {
    status: string;
    data: Candles[];
}
