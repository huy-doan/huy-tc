// src/libs/harmonic/patterns/CypherPattern.ts
import { BaseHarmonicPattern } from '../HarmonicPattern';
import { PatternConfig } from '~interfaces/harmonic.interface';
import { HARMONIC_PATTERN, PATTERN_TYPE, HARMONIC_LEVELS } from '~config/harmonic.constants';

export class BullishCypherPattern extends BaseHarmonicPattern {
  constructor() {
    super(
      HARMONIC_PATTERN.CYPHER,
      PATTERN_TYPE.BULLISH,
      HARMONIC_LEVELS.CYPHER
    );
  }
}

export class BearishCypherPattern extends BaseHarmonicPattern {
  constructor() {
    super(
      HARMONIC_PATTERN.CYPHER,
      PATTERN_TYPE.BEARISH,
      HARMONIC_LEVELS.CYPHER
    );
  }
}
