declare interface OkexMessage<T> {
  readonly channel: string;
  readonly data: T;
}

declare interface OkexSpotPriceMessage extends OkexMessage<OkexSpotPrice> {}

declare interface OkexSpotPrice {
  readonly high: string;
  readonly vol: string;
  readonly last: string;
  readonly low: string;
  readonly buy: string;
  readonly change: string;
  readonly sell: string;
  readonly dayLow: string;
  readonly close: string;
  readonly dayHigh: string;
  readonly open: string;
  readonly timestamp: number;
}
