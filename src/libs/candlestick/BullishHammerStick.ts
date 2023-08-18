import { CustomCandle } from '~interfaces/common.interface';
import CandlestickFinder from './CandlestickFinder';

export default class BullishHammerStick extends CandlestickFinder {
    constructor() {
        super();
    }
    logic(candle: CustomCandle) {
        let daysOpen  = candle.openNum;
        let daysClose = candle.closeNum;
        let daysHigh  = candle.highNum;
        let daysLow   = candle.lowNum;

        let isBullishHammer = daysClose > daysOpen;
        isBullishHammer = isBullishHammer && this.approximateEqual(daysClose, daysHigh);
        isBullishHammer = isBullishHammer && (daysClose - daysOpen) <= 2 * (daysOpen - daysLow);

        return isBullishHammer;
    }
}

export function bullishhammerstick(candle: CustomCandle) {
  return new BullishHammerStick().hasPattern(candle);
}