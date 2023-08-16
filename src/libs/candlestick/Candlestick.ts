import { CustomCandle } from '~interfaces/common.interface';
import { dragonflydoji } from './DragonFlyDoji';
import Constants from '~constants/Constants';
export default class Candlestick {
    constructor() {}

    whoAmI(candle: CustomCandle): string {
        if (dragonflydoji(candle)) {
            return Constants.CANDLE_TYPE.DRAGONFLY_DOJI;
        }
        return Constants.UNKNOWN;
    }
}