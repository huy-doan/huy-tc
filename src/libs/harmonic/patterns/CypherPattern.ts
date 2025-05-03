// src/libs/harmonic/patterns/CypherPattern.ts
import { HarmonicPatternBase } from './HarmonicPatternBase';
import Constants from '~constants/Constants';

/**
 * Mô hình Cypher
 * Tỉ lệ:
 * - B là 0.382-0.618 retracement của XA
 * - C là 1.13-1.414 extension của AB
 * - D là 0.786 retracement của XC
 */
export class CypherPattern extends HarmonicPatternBase {
    constructor() {
        super();
        this.name = 'CYPHER';
    }
    
    getBullishPatternName(): string {
        return Constants.HARMONIC_PATTERN.BULLISH_CYPHER;
    }
    
    getBearishPatternName(): string {
        return Constants.HARMONIC_PATTERN.BEARISH_CYPHER;
    }
}
