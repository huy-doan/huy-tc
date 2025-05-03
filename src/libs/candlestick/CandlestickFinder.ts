// src/libs/candlestick/CandlestickFinder.ts
import { CustomCandle } from '~interfaces/common.interface';

export default abstract class CandlestickFinder {
    constructor() {}

    abstract logic(candle: CustomCandle): boolean;

    hasPattern(candle: CustomCandle) {
        return this.logic(candle);
    }

    /**
     * So sánh xem hai số có gần bằng nhau không, với sai số dựa vào giá trị
     * @param a - Giá trị thứ nhất
     * @param b - Giá trị thứ hai
     * @param tolerance - Tỉ lệ sai số (mặc định 0.1%)
     * @returns Boolean - true nếu a và b gần bằng nhau trong phạm vi sai số
     */
    approximateEqual(a: number, b: number, tolerance: number = 0.001): boolean {
        // Tính sai số tuyệt đối
        const absoluteDifference = parseFloat(Math.abs(a - b).toPrecision(6));
        
        // Tính sai số cho phép dựa trên giá trị lớn hơn để đảm bảo tỉ lệ chính xác
        const maxValue = Math.max(Math.abs(a), Math.abs(b));
        const allowedDifference = parseFloat((maxValue * tolerance).toPrecision(6));
        
        return absoluteDifference <= allowedDifference;
    }
}
