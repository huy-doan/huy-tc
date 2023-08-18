import { CustomCandle } from '~interfaces/common.interface';
import CandlestickFinder from './CandlestickFinder';

export default class BearishInvertedHammerStick extends CandlestickFinder {
    constructor() {
        super();
    }

    logic(candle: CustomCandle) {
        let daysOpen  = candle.openNum;
        let daysClose = candle.closeNum;
        let daysHigh  = candle.highNum;
        let daysLow   = candle.lowNum;

        let isBearishInvertedHammer = daysOpen > daysClose;
        isBearishInvertedHammer = isBearishInvertedHammer && this.approximateEqual(daysClose, daysLow);
        isBearishInvertedHammer = isBearishInvertedHammer && (daysOpen - daysClose) <= 2 * (daysHigh - daysOpen);

        return isBearishInvertedHammer;
    }
}

export function bearishinvertedhammerstick(candle: CustomCandle) {
  return new BearishInvertedHammerStick().hasPattern(candle);
}