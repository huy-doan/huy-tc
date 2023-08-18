import { CustomCandle } from '~interfaces/common.interface';
import { dragonflydoji } from './DragonFlyDoji';
import Constants from '~constants/Constants';
import { bearishmarubozu } from './BearishMarubozu';
import { bearishspinningtop } from './BearishSpinningTop';
import { bearishhammerstick } from './BearishHammerStick';
import { bearishinvertedhammerstick } from './BearishInvertedHammerStick';
import { bullishhammerstick } from './BullishHammerStick';
import { bullishinvertedhammerstick } from './BullishInvertedHammerStick';
import { bullishmarubozu } from './BullishMarubozu';
import { bullishspinningtop } from './BullishSpinningTop';
import { doji } from './Doji';
import { gravestonedoji } from './GraveStoneDoji';
export default class Candlestick {
    constructor() {}

    whoAmI(candle: CustomCandle): string {
        switch (true) {
            case dragonflydoji(candle): 
                return Constants.CANDLE_TYPE.DRAGONFLY_DOJI;
            case gravestonedoji(candle): 
                return Constants.CANDLE_TYPE.GRAVE_STONE_DOJI;
            case doji(candle): 
                return Constants.CANDLE_TYPE.DOJI;
            case bearishmarubozu(candle):
                return Constants.CANDLE_TYPE.BEARISH_MARUBORU;
            case bearishspinningtop(candle):
                return Constants.CANDLE_TYPE.BEARISH_SPRINNING_TOP;
            case bearishhammerstick(candle):
                return Constants.CANDLE_TYPE.BEARISH_HAMMER_STICK;
            case bearishinvertedhammerstick(candle):
                return Constants.CANDLE_TYPE.BEARISH_INVERT_HAMMER_STICK;
            case bullishhammerstick(candle):
                return Constants.CANDLE_TYPE.BULLISH_HAMMER_STICK;
            case bullishinvertedhammerstick(candle):
                return Constants.CANDLE_TYPE.BULLISH_INVERT_HAMMER_STICK;
            case bullishmarubozu(candle):
                return Constants.CANDLE_TYPE.BULLISH_MARUBORU;
            case bullishspinningtop(candle):
                return Constants.CANDLE_TYPE.BULLISH_SPRINNING_TOP;
        }
        return Constants.UNKNOWN;
    }
}