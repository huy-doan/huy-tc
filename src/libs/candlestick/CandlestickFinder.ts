import { CustomCandle } from '~interfaces/common.interface';
export default abstract class CandlestickFinder {
    constructor() {}

    abstract logic(candle: CustomCandle):boolean;

    hasPattern(candle: CustomCandle) {
        return this.logic(candle);
    }

    approximateEqual(a:number, b:number):boolean {
        let left = parseFloat(Math.abs(a - b).toPrecision(4)) * 1;
        let right = parseFloat((a * 0.001).toPrecision(4)) * 1; 
        return  left <= right;
    }
}