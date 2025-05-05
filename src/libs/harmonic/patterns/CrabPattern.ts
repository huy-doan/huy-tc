// src/libs/harmonic/patterns/CrabPattern.ts
import { HarmonicPatternBase } from './HarmonicPatternBase';
import Constants from '~constants/Constants';

/**
 * Mô hình Crab
 * Tỉ lệ:
 * - B là 0.382-0.618 retracement của XA
 * - C là 0.382-0.886 retracement của AB
 * - D là 1.618 extension của XA
 */
export class CrabPattern extends HarmonicPatternBase {
    constructor() {
        super();
        this.name = 'CRAB';
    }
    
    getBullishPatternName(): string {
        return Constants.HARMONIC_PATTERN.BULLISH_CRAB;
    }
    
    getBearishPatternName(): string {
        return Constants.HARMONIC_PATTERN.BEARISH_CRAB;
    }
}
