// src/libs/harmonic/patterns/BatPattern.ts
import { HarmonicPatternBase } from './HarmonicPatternBase';
import Constants from '~constants/Constants';

/**
 * Mô hình Bat
 * Tỉ lệ:
 * - B là 0.382-0.5 retracement của XA
 * - C là 0.382-0.886 retracement của AB
 * - D là 0.886 retracement của XA
 * - D cũng là 1.618-2.618 extension của BC
 */
export class BatPattern extends HarmonicPatternBase {
    constructor() {
        super();
        this.name = 'BAT';
    }
    
    getBullishPatternName(): string {
        return Constants.HARMONIC_PATTERN.BULLISH_BAT;
    }
    
    getBearishPatternName(): string {
        return Constants.HARMONIC_PATTERN.BEARISH_BAT;
    }
}
