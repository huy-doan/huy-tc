import { CustomCandle } from '~interfaces/common.interface';
import CandlestickFinder from './CandlestickFinder';

export default class BearishMarubozu extends CandlestickFinder {
    constructor() {
        super();
    }
    logic(candle: CustomCandle) {
        let daysOpen  = candle.openNum;
        let daysClose = candle.closeNum;
        let daysHigh  = candle.highNum;
        let daysLow   = candle.lowNum;

        let isBearishMarbozu =  this.approximateEqual(daysOpen, daysHigh) && 
                                this.approximateEqual(daysLow, daysClose) &&
                                daysOpen > daysClose && 
                                daysOpen > daysLow;

        return (isBearishMarbozu);
    }
}

export function bearishmarubozu(candle: CustomCandle) {
  return new BearishMarubozu().hasPattern(candle);
}