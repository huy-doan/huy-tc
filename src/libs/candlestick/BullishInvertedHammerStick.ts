import { CustomCandle } from '~interfaces/common.interface';
import CandlestickFinder from './CandlestickFinder';

export default class BullishInvertedHammerStick extends CandlestickFinder {
    constructor() {
        super();
    }

    logic(candle: CustomCandle) {
        let daysOpen  = candle.openNum;
        let daysClose = candle.closeNum;
        let daysHigh  = candle.highNum;
        let daysLow   = candle.lowNum;

        let isBullishInvertedHammer = daysClose > daysOpen;
        isBullishInvertedHammer = isBullishInvertedHammer && this.approximateEqual(daysOpen, daysLow);
        isBullishInvertedHammer = isBullishInvertedHammer && (daysClose - daysOpen) <= 2 * (daysHigh - daysClose);

        return isBullishInvertedHammer;
    }
}

export function bullishinvertedhammerstick(candle: CustomCandle) {
  return new BullishInvertedHammerStick().hasPattern(candle);
}