import { CustomCandle } from '~interfaces/common.interface';
import CandlestickFinder from './CandlestickFinder';

export default class BearishHammerStick extends CandlestickFinder {
    constructor() {
        super();
    }
    logic(candle: CustomCandle) {
        let daysOpen  = candle.openNum;
        let daysClose = candle.closeNum;
        let daysHigh  = candle.highNum;
        let daysLow   = candle.lowNum;

        let isBearishHammer = daysOpen > daysClose;
        isBearishHammer = isBearishHammer && this.approximateEqual(daysOpen, daysHigh);
        isBearishHammer = isBearishHammer && (daysOpen - daysClose) <= 2 * (daysClose - daysLow);

        return isBearishHammer;
    }
}

export function bearishhammerstick(candle: CustomCandle) {
  return new BearishHammerStick().hasPattern(candle);
}