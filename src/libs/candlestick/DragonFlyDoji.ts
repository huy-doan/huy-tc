import { CustomCandle } from '~interfaces/common.interface';
import CandlestickFinder from './CandlestickFinder';

export default class DragonFlyDoji extends CandlestickFinder {
    constructor() {
        super();
    }

    logic(candle: CustomCandle) {
        let isOpenEqualsClose = this.approximateEqual(candle.openNum, candle.closeNum);
        let isHighEqualsOpen = isOpenEqualsClose && this.approximateEqual(candle.openNum, candle.highNum);
        let isLowEqualsClose = isOpenEqualsClose && this.approximateEqual(candle.closeNum, candle.lowNum);
        return (isOpenEqualsClose && isHighEqualsOpen && !isLowEqualsClose);
    }
}

export function dragonflydoji(candle: CustomCandle) {
  return new DragonFlyDoji().hasPattern(candle);
}