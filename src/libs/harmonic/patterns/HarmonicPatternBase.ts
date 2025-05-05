import { CustomCandle, ChartResult, SwingResult } from '~interfaces/common.interface';
import { HARMONICS } from '~config/harmonics.config';
import { upFibonacciRetracement, downFibonacciRetracement } from '~helpers/formula.helper';
import { json } from 'stream/consumers';

export abstract class HarmonicPatternBase {
  protected name = '';

  protected debug = true;

    protected logDebug(...args: any[]) {
        if (this.debug) {
            console.debug(`[${this.name}]`, ...args);
        }
    }

  abstract getBullishPatternName(): string;
  abstract getBearishPatternName(): string;

  detectPattern(candles: CustomCandle[], swingResult: SwingResult): ChartResult[] {
    const bullish = this.detectBullishPattern(candles, swingResult)
      .map(r => ({ ...r, patternName: this.getBullishPatternName() }));
    const bearish = this.detectBearishPattern(candles, swingResult)
      .map(r => ({ ...r, patternName: this.getBearishPatternName() }));

    return [...bullish, ...bearish];
  }


  protected detectBullishPattern(candles: CustomCandle[], swingResult: SwingResult): ChartResult[] {
    return this.detectPatternInternal(candles, swingResult, true);
  }

  protected detectBearishPattern(candles: CustomCandle[], swingResult: SwingResult): ChartResult[] {
    return this.detectPatternInternal(candles, swingResult, false);
  }

  private detectPatternInternal(candles: CustomCandle[], { swingLows, swingHighs }: SwingResult, isBullish: boolean): ChartResult[] {
    console.log('Detecting pattern', this.name, isBullish ? 'Bullish' : 'Bearish');
    const results: ChartResult[] = [];
    const patternLevels = HARMONICS.PATTERNS[this.name as keyof typeof HARMONICS.PATTERNS];
    console.log('patternLevels', patternLevels);

    const swingsX = isBullish ? swingLows : swingHighs;
    const swingsA = isBullish ? swingHighs : swingLows;
    const swingsB = isBullish ? swingLows : swingHighs;
    const swingsC = isBullish ? swingHighs : swingLows;
    const swingsD = isBullish ? swingLows : swingHighs;

    for (const [index, pointX] of Object.entries(swingsX)) {
      if (Number(index) > 0 && !this.isExtremePoint(swingsX, Number(index), isBullish)) continue;

      const priceX = isBullish ? pointX.lowNum : pointX.highNum;
      const timeX = pointX.openTime;

      const candidatesA = swingsA.filter(a =>
        (isBullish ? a.highNum > priceX : a.lowNum < priceX) && a.openTime > timeX);
      if (candidatesA.length === 0) continue;

        this.logDebug('Valid pointX candidates', pointX.index);
        this.logDebug('Valid A candidates', candidatesA.map(a => a.index));

      for (const pointA of candidatesA) {
        if (!this.isValidXA(pointX, pointA, candles, isBullish, swingsX)) continue;
        // this.logDebug('Checking XA', { x: pointX, a: pointA });

    

        const priceA = isBullish ? pointA.highNum : pointA.lowNum;
        
        const [b1, b2] = isBullish
          ? [upFibonacciRetracement(priceX, priceA, patternLevels.B_MIN), upFibonacciRetracement(priceX, priceA, patternLevels.B_MAX)]
          : [downFibonacciRetracement(priceX, priceA, patternLevels.B_MIN), downFibonacciRetracement(priceX, priceA, patternLevels.B_MAX)];
        const bMin = Math.min(b1, b2);
        const bMax = Math.max(b1, b2);

            this.logDebug('pointA.index', pointA.index);
            this.logDebug('bMin', bMin);
            this.logDebug('bMax', bMax);
            console.log('priceA', priceA);
            console.log('priceX', priceX);
        const candidatesB = swingsB.filter(b =>
          this.isPointInRange(b, bMin, bMax, pointA.openTime, isBullish ? b.highNum <= priceA : b.lowNum >= priceA) &&
          this.noBreaksBetween(candles, pointA.index, b.index, pointA, b, isBullish)
        );
        if (candidatesB.length === 0) continue;

        this.logDebug('Valid B candidates', candidatesB.map(b => b.index));

        for (const pointB of candidatesB) {
            this.logDebug('Valid pointB candidates', pointB.index);

          const [c1, c2] = this.getCRange(pointA, pointB, isBullish, patternLevels);
          const cMin = Math.min(c1, c2);
          const cMax = Math.max(c1, c2);
        
            console.log('C range', cMin, cMax);

          const candidatesC = swingsC.filter(c =>
            c.openTime > pointB.openTime &&
            c.highNum >= cMin && c.highNum <= cMax
          );
          if (candidatesC.length === 0) continue;
          this.logDebug('Valid C candidates', candidatesC.map(b => b.index));

          for (const pointC of candidatesC) {
            if (!this.noBreaksBetween(candles, pointB.index, pointC.index, pointB, pointC, isBullish)) continue;

            const [d1, d2] = this.getDRange(pointX, pointA, pointB, pointC, isBullish, patternLevels);
            const dMin = Math.min(d1, d2);
            const dMax = Math.max(d1, d2);

            const [dBC1, dBC2] = this.getOptionalDRangeBC(pointB, pointC, isBullish, patternLevels);
            const dBCMin = dBC1 !== null ? Math.min(dBC1, dBC2) : null;
            const dBCMax = dBC1 !== null ? Math.max(dBC1, dBC2) : null;

            const candidatesD = swingsD.filter(d => {
              const price = isBullish ? d.lowNum : d.highNum;
              const inMainRange = price >= dMin && price <= dMax;
              const inBcRange = dBCMin !== null && dBCMax !== null
                ? price >= dBCMin && price <= dBCMax
                : true;
              return inMainRange && inBcRange &&
                d.openTime > pointC.openTime &&
                this.noBreaksBetween(candles, pointC.index, d.index, pointC, d, isBullish);
            });
            this.logDebug('Valid D candidates', candidatesD.map(b => b.index));

            if (candidatesD.length) {
              results.push({
                xPrice: pointX,
                aPrice: pointA,
                bPrice: pointB,
                cPrice: pointC,
                dPrices: candidatesD,
                patternName: '', // will be added later in detectPattern()
              });
            }
          }
        }
      }
    }

    return results;
  }

  private isExtremePoint(swings: any[], idx: number, isBullish: boolean): boolean {
    const current = swings[idx];
    const prev = swings[idx - 1];
    return isBullish ? current.lowNum < prev.lowNum : current.highNum > prev.highNum;
  }

  private isValidXA(x: any, a: any, candles: CustomCandle[], isBullish: boolean, swingsX: any[]): boolean {
    const priceX = isBullish ? x.lowNum : x.highNum;
    const priceA = isBullish ? a.highNum : a.lowNum;

    if ((isBullish && x.highNum > a.highNum) || (!isBullish && x.lowNum < a.lowNum)) return false;
    if (a.index - x.index < 10) return false;

    const hasBreak = candles.some(c => 
      c.openTime > x.openTime && c.openTime < a.openTime &&
      ((isBullish && (c.highNum > a.highNum || c.lowNum < x.lowNum)) ||
       (!isBullish && (c.highNum > x.highNum || c.lowNum < a.lowNum)))
    );
    if (hasBreak) return false;

    const invalidExtreme = swingsX.some(extreme => 
      extreme.index > x.index && extreme.index < a.index &&
      (isBullish ? extreme.lowNum < x.lowNum : extreme.highNum > x.highNum)
    );
    return !invalidExtreme;
  }

  private isPointInRange(point: any, min: number, max: number, afterTime: number, extraCondition: boolean): boolean {
    const price = point.lowNum ?? point.highNum;
    return price >= min && price <= max && point.openTime >= afterTime && extraCondition;
  }

  private noBreaksBetween(candles: CustomCandle[], startIdx: number, endIdx: number, start: any, end: any, isBullish: boolean): boolean {
    return !candles.some(c =>
      c.index > startIdx && c.index < endIdx &&
      ((isBullish && (c.lowNum < end.lowNum || c.highNum > start.highNum)) ||
       (!isBullish && (c.highNum > end.highNum || c.lowNum < start.lowNum)))
    );
  }

  private getCRange(a: any, b: any, isBullish: boolean, levels: any): [number, number] {
    if (['CYPHER', 'SHARK'].includes(this.name)) {
      const diff = a.highNum - b.lowNum;
      return [
        a.highNum + diff * levels.C_MIN,
        a.highNum + diff * levels.C_MAX,
      ];
    } else {
      return isBullish
        ? [downFibonacciRetracement(b.lowNum, a.highNum, levels.C_MIN), downFibonacciRetracement(b.lowNum, a.highNum, levels.C_MAX)]
        : [upFibonacciRetracement(a.lowNum, b.highNum, levels.C_MIN), upFibonacciRetracement(a.lowNum, b.highNum, levels.C_MAX)];
    }
  }

  private getDRange(x: any, a: any, b: any, c: any, isBullish: boolean, levels: any): [number, number] {
    if (['BUTTERFLY', 'CRAB'].includes(this.name)) {
      return isBullish
        ? [upFibonacciRetracement(x.lowNum, a.highNum, levels.D_MIN), upFibonacciRetracement(x.lowNum, a.highNum, levels.D_MAX)]
        : [downFibonacciRetracement(x.highNum, a.lowNum, levels.D_MIN), downFibonacciRetracement(x.highNum, a.lowNum, levels.D_MAX)];
    } else if (this.name === 'BAT') {
      return isBullish
        ? [upFibonacciRetracement(x.lowNum, a.highNum, levels.D_MIN), upFibonacciRetracement(x.lowNum, a.highNum, levels.D_MAX)]
        : [downFibonacciRetracement(x.highNum, a.lowNum, levels.D_MIN), downFibonacciRetracement(x.highNum, a.lowNum, levels.D_MAX)];
    } else {
      return isBullish
        ? [upFibonacciRetracement(x.lowNum, c.highNum, levels.D_MIN), upFibonacciRetracement(x.lowNum, c.highNum, levels.D_MAX)]
        : [downFibonacciRetracement(c.lowNum, x.highNum, levels.D_MIN), downFibonacciRetracement(c.lowNum, x.highNum, levels.D_MAX)];
    }
  }

  private getOptionalDRangeBC(b: any, c: any, isBullish: boolean, levels: any): [number | null, number | null] {
    if (this.name !== 'BAT' || !('D_BC_MIN' in levels)) return [null, null];

    return isBullish
      ? [upFibonacciRetracement(b.lowNum, c.highNum, levels.D_BC_MIN), upFibonacciRetracement(b.lowNum, c.highNum, levels.D_BC_MAX)]
      : [downFibonacciRetracement(c.lowNum, b.highNum, levels.D_BC_MIN), downFibonacciRetracement(c.lowNum, b.highNum, levels.D_BC_MAX)];
  }
}

