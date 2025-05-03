// src/libs/harmonic/patterns/SharkPattern.ts
import { BaseHarmonicPattern } from '../HarmonicPattern';
import { PatternConfig } from '~interfaces/harmonic.interface';
import { HARMONIC_PATTERN, PATTERN_TYPE, HARMONIC_LEVELS } from '~config/harmonic.constants';

export class BullishSharkPattern extends BaseHarmonicPattern {
  constructor() {
    super(
      HARMONIC_PATTERN.SHARK,
      PATTERN_TYPE.BULLISH,
      HARMONIC_LEVELS.SHARK
    );
  }
}

export class BearishSharkPattern extends BaseHarmonicPattern {
  constructor() {
    super(
      HARMONIC_PATTERN.SHARK,
      PATTERN_TYPE.BEARISH,
      HARMONIC_LEVELS.SHARK
    );
  }
}
