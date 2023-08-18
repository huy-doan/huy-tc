import { CustomCandle } from '~interfaces/common.interface';
import CandlestickFinder from './CandlestickFinder';

export default class BullishSpinningTop extends CandlestickFinder {
    constructor() {
        super();
    }
    logic(candle: CustomCandle) {
        let daysOpen  = candle.openNum;
        let daysClose = candle.closeNum;
        let daysHigh  = candle.highNum;
        let daysLow   = candle.lowNum;

        let bodyLength           = Math.abs(daysClose-daysOpen);
        let upperShadowLength    = Math.abs(daysHigh-daysClose);
        let lowerShadowLength    = Math.abs(daysOpen-daysLow);
        let isBullishSpinningTop = bodyLength < upperShadowLength && 
                                 bodyLength < lowerShadowLength;

        return isBullishSpinningTop;
    }
}

export function bullishspinningtop(candle: CustomCandle) {
  return new BullishSpinningTop().hasPattern(candle);
}