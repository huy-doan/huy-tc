// src/helpers/fibonacci.helper.ts
import { FIBONACCI_ERROR_MARGIN } from '~config/harmonic.constants';

/**
 * Hàm tính toán Fibonacci retracement cho xu hướng tăng
 * @param low Giá thấp (điểm đầu)
 * @param high Giá cao (điểm cuối)
 * @param level Mức Fibonacci (0.382, 0.5, 0.618, v.v.)
 * @returns Giá trị tại mức Fibonacci retracement
 */
export function upFibonacciRetracement(low: number, high: number, level = 0): number {
  return +(high - ((high - low) * level)).toFixed(6);
}

/**
 * Hàm tính toán Fibonacci retracement cho xu hướng giảm
 * @param high Giá cao (điểm đầu)
 * @param low Giá thấp (điểm cuối)
 * @param level Mức Fibonacci (0.382, 0.5, 0.618, v.v.)
 * @returns Giá trị tại mức Fibonacci retracement
 */
export function downFibonacciRetracement(high: number, low: number, level = 0): number {
  return +(low + (high - low) * level).toFixed(6);
}

/**
 * Hàm tính toán Fibonacci extension cho xu hướng tăng
 * @param low Giá thấp (điểm đầu)
 * @param high Giá cao (điểm cuối)
 * @param level Mức Fibonacci (1.27, 1.618, v.v.)
 * @returns Giá trị tại mức Fibonacci extension
 */
export function upFibonacciExtension(low: number, high: number, level = 0): number {
  return +(high + (high - low) * level).toFixed(6);
}

/**
 * Hàm tính toán Fibonacci extension cho xu hướng giảm
 * @param high Giá cao (điểm đầu)
 * @param low Giá thấp (điểm cuối)
 * @param level Mức Fibonacci (1.27, 1.618, v.v.)
 * @returns Giá trị tại mức Fibonacci extension
 */
export function downFibonacciExtension(high: number, low: number, level = 0): number {
  return +(low - (high - low) * level).toFixed(6);
}

/**
 * Kiểm tra giá trị có nằm trong khoảng Fibonacci
 * @param value Giá trị cần kiểm tra
 * @param min Giới hạn dưới
 * @param max Giới hạn trên
 * @returns true nếu giá trị nằm trong khoảng (có tính cả sai số)
 */
export function isInFibonacciRange(value: number, min: number, max: number): boolean {
  const adjustedMin = min * (1 - FIBONACCI_ERROR_MARGIN);
  const adjustedMax = max * (1 + FIBONACCI_ERROR_MARGIN);
  return value >= adjustedMin && value <= adjustedMax;
}

/**
 * Tính giá trị Fibonacci với sai số
 * @param baseValue Giá trị cơ sở
 * @param fibLevel Mức Fibonacci
 * @param isMin Có phải là giới hạn dưới không
 * @returns Giá trị Fibonacci với sai số
 */
export function adjustFibonacci(baseValue: number, fibLevel: number, isMin: boolean): number {
  const adjustment = isMin 
    ? (1 - FIBONACCI_ERROR_MARGIN) 
    : (1 + FIBONACCI_ERROR_MARGIN);
  return baseValue * adjustment;
}
