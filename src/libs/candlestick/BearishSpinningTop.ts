import { CustomCandle } from '~interfaces/common.interface';
import CandlestickFinder from './CandlestickFinder';

export default class BearishSpinningTop extends CandlestickFinder {
    constructor() {
        super();
    }
    logic(candle: CustomCandle) {
        let daysOpen  = candle.openNum;
        let daysClose = candle.closeNum;
        let daysHigh  = candle.highNum;
        let daysLow   = candle.lowNum;

        let bodyLength           = Math.abs(daysClose-daysOpen);
        let upperShadowLength    = Math.abs(daysHigh-daysOpen);
        let lowerShadowLength    = Math.abs(daysHigh-daysLow);
        let isBearishSpinningTop = bodyLength < upperShadowLength && 
                                 bodyLength < lowerShadowLength;

        return isBearishSpinningTop;
    }
}

export function bearishspinningtop(candle: CustomCandle) {
  return new BearishSpinningTop().hasPattern(candle);
}