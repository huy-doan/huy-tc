export function upFibonacciRetracement(low: number, high: number, level = 0): number {
    return high - ((high - low) * level);
}

export function downFibonacciRetracement(low: number, high: number, level = 0): number {
    return low + (high - low) * level;
}

export function upFibonacciExtention(low: number, high: number, level = 0): number {
    return high + (high - low) * level;
}

export function downFibonacciExtention(low: number, high: number, level = 0): number {
    return low - (high - low) * level;
}
// | '1m'
// | '3m'
// | '5m'
// | '15m'
// | '30m'
// | '1h'
// | '2h'
// | '4h'
// | '6h'
// | '8h'
// | '12h'
// | '1d'
// | '3d'
// | '1w'
// | '1M'