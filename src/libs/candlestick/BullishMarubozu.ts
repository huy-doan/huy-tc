import { CustomCandle } from '~interfaces/common.interface';
import CandlestickFinder from './CandlestickFinder';

export default class BullishMarubozu extends CandlestickFinder {
    constructor() {
        super();
    }

    logic(candle: CustomCandle) {
        let daysOpen  = candle.openNum;
        let daysClose = candle.closeNum;
        let daysHigh  = candle.highNum;
        let daysLow   = candle.lowNum;

        let isBullishMarbozu =  this.approximateEqual(daysClose, daysHigh) && 
                                this.approximateEqual(daysLow, daysOpen) &&
                                daysOpen < daysClose && 
                                daysOpen < daysHigh;

        return (isBullishMarbozu);
    }
}

export function bullishmarubozu(candle: CustomCandle) {
  return new BullishMarubozu().hasPattern(candle);
}