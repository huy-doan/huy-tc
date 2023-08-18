import { CustomCandle } from '~interfaces/common.interface';
import CandlestickFinder from './CandlestickFinder';

export default class Doji extends CandlestickFinder {
    constructor() {
        super();
    }
    logic(candle: CustomCandle) {
        let daysOpen = candle.openNum;
        let daysClose = candle.closeNum;
        let daysHigh =  candle.highNum;
        let daysLow =  candle.lowNum;
        let isOpenEqualsClose = this.approximateEqual(daysOpen, daysClose);
        let isHighEqualsOpen = isOpenEqualsClose && this.approximateEqual(daysOpen, daysHigh);
        let isLowEqualsClose = isOpenEqualsClose && this.approximateEqual(daysClose, daysLow);
        return (isOpenEqualsClose && isHighEqualsOpen == isLowEqualsClose);
    }
}

export function doji(candle: CustomCandle) {
  return new Doji().hasPattern(candle);
}