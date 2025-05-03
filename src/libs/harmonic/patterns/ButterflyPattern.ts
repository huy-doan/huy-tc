// src/libs/harmonic/patterns/ButterflyPattern.ts
import { BaseHarmonicPattern } from '../HarmonicPattern';
import { PatternConfig } from '~interfaces/harmonic.interface';
import { HARMONIC_PATTERN, PATTERN_TYPE, HARMONIC_LEVELS } from '~config/harmonic.constants';

export class BullishButterflyPattern extends BaseHarmonicPattern {
  constructor() {
    super(
      HARMONIC_PATTERN.BUTTERFLY,
      PATTERN_TYPE.BULLISH,
      HARMONIC_LEVELS.BUTTERFLY
    );
  }
}

export class BearishButterflyPattern extends BaseHarmonicPattern {
  constructor() {
    super(
      HARMONIC_PATTERN.BUTTERFLY,
      PATTERN_TYPE.BEARISH,
      HARMONIC_LEVELS.BUTTERFLY
    );
  }
}
