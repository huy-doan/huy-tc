// src/config/harmonic.constants.ts
export const HARMONIC_PATTERN = {
    CYPHER: 'CYPHER',
    BAT: 'BAT',
    GARTLEY: 'GARTLEY',
    BUTTERFLY: 'BUTTERFLY',
    CRAB: 'CRAB',
    SHARK: 'SHARK'
  };
  
  export const PATTERN_TYPE = {
    BULLISH: 'BULLISH',
    BEARISH: 'BEARISH'
  };
  
  export const FIBONACCI_ERROR_MARGIN = 0.02; // 2% sai số
  
  export const HARMONIC_LEVELS = {
    // Cypher pattern
    CYPHER: {
      B_MIN: 0.382,
      B_MAX: 0.618,
      C_MIN: 1.130,
      C_MAX: 1.414, 
      D_MIN: 0.786,
      D_MAX: 0.786,
    },
    // Bat pattern
    BAT: {
      B_MIN: 0.382,
      B_MAX: 0.500,
      C_MIN: 0.382,
      C_MAX: 0.886,
      D_MIN: 0.886,
      D_MAX: 0.886,
      D_BC_MIN: 1.618,
      D_BC_MAX: 2.618,
    },
    // Gartley pattern
    GARTLEY: {
      B_MIN: 0.618,
      B_MAX: 0.618,
      C_MIN: 0.382,
      C_MAX: 0.886,
      D_MIN: 0.786,
      D_MAX: 0.786,
      D_BC_MIN: 1.272,
      D_BC_MAX: 1.272,
    },
    // Butterfly pattern
    BUTTERFLY: {
      B_MIN: 0.786,
      B_MAX: 0.786,
      C_MIN: 0.382,
      C_MAX: 0.886,
      D_MIN: 1.270,
      D_MAX: 1.618,
      D_BC_MIN: 1.618,
      D_BC_MAX: 2.618,
    },
    // Crab pattern
    CRAB: {
      B_MIN: 0.382,
      B_MAX: 0.618,
      C_MIN: 0.382,
      C_MAX: 0.886,
      D_MIN: 1.618,
      D_MAX: 1.618,
      D_BC_MIN: 2.618,
      D_BC_MAX: 3.618,
    },
    // Shark pattern
    SHARK: {
      B_MIN: 0.446,
      B_MAX: 0.618,
      C_MIN: 1.130,
      C_MAX: 1.618,
      D_MIN: 0.886,
      D_MAX: 1.130,
      C_AB_MIN: 1.618,
      C_AB_MAX: 2.236,
    }
  };
  