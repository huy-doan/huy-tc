// src/config/harmonics.config.ts
export const HARMONICS = {
    // Tỉ lệ Fibonacci được tối ưu cho các mô hình
    PATTERNS: {
        // Cypher Pattern
        CYPHER: {
            // Tỉ lệ B nằm trong khoảng 0.382-0.618 của XA
            B_MIN: 0.382,
            B_MAX: 0.618,
            // Tỉ lệ C là extension 1.13-1.414 của AB
            C_MIN: 1.13,
            C_MAX: 1.414,
            // Tỉ lệ D là retracement 0.786 của XC (với sai số nhỏ)
            D_MIN: 0.782,
            D_MAX: 0.79,
        },
        // Bat Pattern
        BAT: {
            // Tỉ lệ B nằm trong khoảng 0.382-0.5 của XA
            B_MIN: 0.382,
            B_MAX: 0.5,
            // Tỉ lệ C là retracement 0.382-0.886 của AB
            C_MIN: 0.382,
            C_MAX: 0.886,
            // Tỉ lệ D là retracement 0.886 của XA (với sai số nhỏ)
            D_MIN: 0.88,
            D_MAX: 0.89,
            // Tỉ lệ D là extension 1.618-2.618 của BC
            D_BC_MIN: 1.618,
            D_BC_MAX: 2.618,
        },
        // Gartley Pattern
        GARTLEY: {
            // Tỉ lệ B nằm trong khoảng 0.618 của XA (với sai số)
            B_MIN: 0.61,
            B_MAX: 0.628,
            // Tỉ lệ C là retracement 0.382-0.886 của AB
            C_MIN: 0.382,
            C_MAX: 0.886,
            // Tỉ lệ D là retracement 0.786 của XC (với sai số)
            D_MIN: 0.782,
            D_MAX: 0.79,
        },
        // Butterfly Pattern
        BUTTERFLY: {
            // Tỉ lệ B nằm trong khoảng 0.786 của XA (với sai số)
            B_MIN: 0.78,
            B_MAX: 0.792,
            // Tỉ lệ C là retracement 0.382-0.886 của AB
            C_MIN: 0.382, 
            C_MAX: 0.886,
            // Tỉ lệ D là extension 1.27-1.618 của XA
            D_MIN: 1.27,
            D_MAX: 1.618,
        },
        // Crab Pattern
        CRAB: {
            // Tỉ lệ B nằm trong khoảng 0.382-0.618 của XA
            B_MIN: 0.382,
            B_MAX: 0.618,
            // Tỉ lệ C là retracement 0.382-0.886 của AB
            C_MIN: 0.382,
            C_MAX: 0.886,
            // Tỉ lệ D là extension 1.618 của XA (với sai số)
            D_MIN: 1.618,
            D_MAX: 1.628,
        },
        // Shark Pattern
        SHARK: {
            // Tỉ lệ B nằm trong khoảng 0.382-0.618 của XA
            B_MIN: 0.382,
            B_MAX: 0.618,
            // Tỉ lệ C là extension 1.13-1.618 của XA
            C_MIN: 1.13,
            C_MAX: 1.618,
            // Tỉ lệ D là retracement 0.886 của XC (với sai số)
            D_MIN: 0.88,
            D_MAX: 0.89,
        },
    },
    // Cài đặt cho việc xác định swing points
    SWING_SETTINGS: {
        // Độ nhạy cho swing detection
        SENSITIVITY: 1,
        // Số nến tối thiểu giữa hai swing point
        MIN_CANDLES_BETWEEN_SWINGS: 3,
    }
};
