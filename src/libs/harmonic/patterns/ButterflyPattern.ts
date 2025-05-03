// src/libs/harmonic/patterns/ButterflyPattern.ts
import { HarmonicPatternBase } from './HarmonicPatternBase';
import Constants from '~constants/Constants';

/**
 * Mô hình Butterfly
 * Tỉ lệ:
 * - B là 0.786 retracement của XA
 * - C là 0.382-0.886 retracement của AB
 * - D là 1.27-1.618 extension của XA
 */
export class ButterflyPattern extends HarmonicPatternBase {
    constructor() {
        super();
        this.name = 'BUTTERFLY';
    }
    
    getBullishPatternName(): string {
        return Constants.HARMONIC_PATTERN.BULLISH_BUTTERFLY;
    }
    
    getBearishPatternName(): string {
        return Constants.HARMONIC_PATTERN.BEARISH_BUTTERFLY;
    }
}
