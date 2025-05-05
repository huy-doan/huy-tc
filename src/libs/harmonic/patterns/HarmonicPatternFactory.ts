// src/libs/harmonic/patterns/HarmonicPatternFactory.ts
import { HarmonicPatternBase } from './HarmonicPatternBase';
import { CypherPattern } from './CypherPattern';
import { BatPattern } from './BatPattern';
import { GartleyPattern } from './GartleyPattern';
import { ButterflyPattern } from './ButterflyPattern';
import { CrabPattern } from './CrabPattern';
import { SharkPattern } from './SharkPattern';

/**
 * Factory tạo các đối tượng mô hình hài hòa
 */
export class HarmonicPatternFactory {
    /**
     * Tạo đối tượng mô hình hài hòa
     * @param patternType Tên mô hình
     * @returns Đối tượng mô hình tương ứng
     */
    static createPattern(patternType: string): HarmonicPatternBase {
        switch (patternType.toUpperCase()) {
            case 'CYPHER':
                return new CypherPattern();
            case 'BAT':
                return new BatPattern();
            case 'GARTLEY':
                return new GartleyPattern();
            case 'BUTTERFLY':
                return new ButterflyPattern();
            case 'CRAB':
                return new CrabPattern();
            case 'SHARK':
                return new SharkPattern();
            default:
                throw new Error(`Không hỗ trợ mô hình: ${patternType}`);
        }
    }

    /**
     * Tạo tất cả các mô hình hài hòa được hỗ trợ
     * @returns Mảng các đối tượng mô hình
     */
    static createAllPatterns(): HarmonicPatternBase[] {
        return [
            new CypherPattern(),
            new BatPattern(),
            new GartleyPattern(),
            new ButterflyPattern(),
            new CrabPattern(),
            new SharkPattern()
        ];
    }
}
