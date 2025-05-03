// src/libs/harmonic/HarmonicPatternFactory.ts
import { HarmonicPattern } from '~interfaces/harmonic.interface';
import { HARMONIC_PATTERN, PATTERN_TYPE } from '~config/harmonic.constants';

// Import các pattern classes
import { BullishCypherPattern, BearishCypherPattern } from './patterns/CypherPattern';
import { BullishBatPattern, BearishBatPattern } from './patterns/BatPattern';
import { BullishGartleyPattern, BearishGartleyPattern } from './patterns/GartleyPattern';
import { BullishButterflyPattern, BearishButterflyPattern } from './patterns/ButterflyPattern';
import { BullishCrabPattern, BearishCrabPattern } from './patterns/CrabPattern';
import { BullishSharkPattern, BearishSharkPattern } from './patterns/SharkPattern';

/**
 * Factory class để tạo ra các mô hình Harmonic
 */
export class HarmonicPatternFactory {
  /**
   * Tạo pattern dựa trên tên và loại (bullish/bearish)
   * @param patternName Tên mô hình (CYPHER, BAT, GARTLEY, v.v.)
   * @param patternType Loại mô hình (BULLISH hoặc BEARISH)
   */
  static createPattern(patternName: string, patternType: string): HarmonicPattern | null {
    switch (patternName) {
      case HARMONIC_PATTERN.CYPHER:
        return patternType === PATTERN_TYPE.BULLISH 
          ? new BullishCypherPattern() 
          : new BearishCypherPattern();
          
      case HARMONIC_PATTERN.BAT:
        return patternType === PATTERN_TYPE.BULLISH 
          ? new BullishBatPattern() 
          : new BearishBatPattern();
          
      case HARMONIC_PATTERN.GARTLEY:
        return patternType === PATTERN_TYPE.BULLISH 
          ? new BullishGartleyPattern() 
          : new BearishGartleyPattern();
          
      case HARMONIC_PATTERN.BUTTERFLY:
        return patternType === PATTERN_TYPE.BULLISH 
          ? new BullishButterflyPattern() 
          : new BearishButterflyPattern();
          
      case HARMONIC_PATTERN.CRAB:
        return patternType === PATTERN_TYPE.BULLISH 
          ? new BullishCrabPattern() 
          : new BearishCrabPattern();
          
      case HARMONIC_PATTERN.SHARK:
        return patternType === PATTERN_TYPE.BULLISH 
          ? new BullishSharkPattern() 
          : new BearishSharkPattern();
          
      default:
        return null;
    }
  }
  
  /**
   * Tạo tất cả các mô hình harmonic được hỗ trợ
   */
  static createAllPatterns(): HarmonicPattern[] {
    const patterns: HarmonicPattern[] = [];
    
    // Thêm tất cả các mô hình
    const patternNames = Object.values(HARMONIC_PATTERN) as string[];
    const patternTypes = Object.values(PATTERN_TYPE) as string[];
    
    for (const name of patternNames) {
      for (const type of patternTypes) {
        const pattern = this.createPattern(name, type);
        if (pattern) {
          patterns.push(pattern);
        }
      }
    }
    
    return patterns;
  }
}
