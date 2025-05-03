// src/libs/harmonic/patterns/SharkPattern.ts
import { HarmonicPatternBase } from './HarmonicPatternBase';
import Constants from '~constants/Constants';

/**
 * Mô hình Shark
 * Tỉ lệ:
 * - B là 0.382-0.618 retracement của XA
 * - C là 1.13-1.618 extension của XA
 * - D là 0.886 retracement của XC
 */
export class SharkPattern extends HarmonicPatternBase {
    constructor() {
        super();
        this.name = 'SHARK';
    }
    
    getBullishPatternName(): string {
        return Constants.HARMONIC_PATTERN.BULLISH_SHARK;
    }
    
    getBearishPatternName(): string {
        return Constants.HARMONIC_PATTERN.BEARISH_SHARK;
    }
}
