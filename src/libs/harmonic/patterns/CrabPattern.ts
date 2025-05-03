// src/libs/harmonic/patterns/CrabPattern.ts
import { BaseHarmonicPattern } from '../HarmonicPattern';
import { PatternConfig } from '~interfaces/harmonic.interface';
import { HARMONIC_PATTERN, PATTERN_TYPE, HARMONIC_LEVELS } from '~config/harmonic.constants';

export class BullishCrabPattern extends BaseHarmonicPattern {
  constructor() {
    super(
      HARMONIC_PATTERN.CRAB,
      PATTERN_TYPE.BULLISH,
      HARMONIC_LEVELS.CRAB
    );
  }
}

export class BearishCrabPattern extends BaseHarmonicPattern {
  constructor() {
    super(
      HARMONIC_PATTERN.CRAB,
      PATTERN_TYPE.BEARISH,
      HARMONIC_LEVELS.CRAB
    );
  }
}
