// src/libs/harmonic/patterns/GartleyPattern.ts
import { BaseHarmonicPattern } from '../HarmonicPattern';
import { PatternConfig } from '~interfaces/harmonic.interface';
import { HARMONIC_PATTERN, PATTERN_TYPE, HARMONIC_LEVELS } from '~config/harmonic.constants';

export class BullishGartleyPattern extends BaseHarmonicPattern {
  constructor() {
    super(
      HARMONIC_PATTERN.GARTLEY,
      PATTERN_TYPE.BULLISH,
      HARMONIC_LEVELS.GARTLEY
    );
  }
}

export class BearishGartleyPattern extends BaseHarmonicPattern {
  constructor() {
    super(
      HARMONIC_PATTERN.GARTLEY,
      PATTERN_TYPE.BEARISH,
      HARMONIC_LEVELS.GARTLEY
    );
  }
}
