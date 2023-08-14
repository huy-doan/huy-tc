export function upFibonacciRetracement(low: number, high: number, level = 0): number {
    return +(high - ((high - low) * level)).toFixed(6);
}

export function downFibonacciRetracement(low: number, high: number, level = 0): number {
    return +(low + (high - low) * level).toFixed(6);
}

export function upFibonacciExtention(low: number, high: number, level = 0): number {
    return +(high + (high - low) * level).toFixed(6);
}

export function downFibonacciExtention(low: number, high: number, level = 0): number {
    return +(low - (high - low) * level).toFixed(6);
}
