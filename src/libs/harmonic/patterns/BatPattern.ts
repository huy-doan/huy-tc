// src/libs/harmonic/patterns/BatPattern.ts
import { BaseHarmonicPattern } from '../HarmonicPattern';
import { PatternConfig } from '~interfaces/harmonic.interface';
import { HARMONIC_PATTERN, PATTERN_TYPE, HARMONIC_LEVELS } from '~config/harmonic.constants';

export class BullishBatPattern extends BaseHarmonicPattern {
  constructor() {
    super(
      HARMONIC_PATTERN.BAT,
      PATTERN_TYPE.BULLISH,
      HARMONIC_LEVELS.BAT
    );
  }
}

export class BearishBatPattern extends BaseHarmonicPattern {
  constructor() {
    super(
      HARMONIC_PATTERN.BAT,
      PATTERN_TYPE.BEARISH,
      HARMONIC_LEVELS.BAT
    );
  }
}
