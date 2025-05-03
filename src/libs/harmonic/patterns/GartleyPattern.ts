// src/libs/harmonic/patterns/GartleyPattern.ts
import { HarmonicPatternBase } from './HarmonicPatternBase';
import Constants from '~constants/Constants';

/**
 * Mô hình Gartley
 * Tỉ lệ:
 * - B là 0.618 retracement của XA
 * - C là 0.382-0.886 retracement của AB
 * - D là 0.786 retracement của XC
 */
export class GartleyPattern extends HarmonicPatternBase {
    constructor() {
        super();
        this.name = 'GARTLEY';
    }
    
    getBullishPatternName(): string {
        return Constants.HARMONIC_PATTERN.BULLISH_GARTLEY;
    }
    
    getBearishPatternName(): string {
        return Constants.HARMONIC_PATTERN.BEARISH_GARTLEY;
    }
}
