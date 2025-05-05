export const CONSTANT = {
    LEVEL: {
        CYPHER: {
            B_MAX: 0.382,
            B_MIN: 0.618,
            C_MIN: 1.130,
            C_MAX: 1.414,
            D_MIN: 0.786,
            D_MAX: 0.787,
        },
        BAT:  {
            B_MAX: 0.382,
            B_MIN: 0.500,
            C_MIN: 0.382,
            C_MAX: 0.886,
            D_MIN: 0.885,
            D_MAX: 0.887,
            D_BC_MIN: 1.682,
            D_BC_MAX: 2.618,
        },
        GARTLEY: {
            // B là 0.618 của XA (với sai số)
            B_MIN: 0.61,
            B_MAX: 0.628,
            // C là retracement 0.382-0.886 của AB
            C_MIN: 0.382,
            C_MAX: 0.886,
            // D là retracement 0.786 của XC (với sai số)
            D_MIN: 0.782,
            D_MAX: 0.79,
        },
        BUTTERFLY: {
            // B là 0.786 của XA (với sai số)
            B_MIN: 0.78,
            B_MAX: 0.792,
            // C là retracement 0.382-0.886 của AB
            C_MIN: 0.382, 
            C_MAX: 0.886,
            // D là extension 1.27-1.618 của XA
            D_MIN: 1.27,
            D_MAX: 1.618,
        },
        CRAB: {
            // B nằm trong khoảng 0.382-0.618 của XA
            B_MIN: 0.382,
            B_MAX: 0.618,
            // C là retracement 0.382-0.886 của AB
            C_MIN: 0.382,
            C_MAX: 0.886,
            // D là extension 1.618 của XA (với sai số)
            D_MIN: 1.618,
            D_MAX: 1.628,
        },
        SHARK: {
            // B nằm trong khoảng 0.382-0.618 của XA
            B_MIN: 0.382,
            B_MAX: 0.618,
            // C là extension 1.13-1.618 của XA
            C_MIN: 1.13,
            C_MAX: 1.618,
            // D là retracement 0.886 của XC (với sai số)
            D_MIN: 0.88,
            D_MAX: 0.89,
        },
    },
    APP_ENV: process.env.APP_ENV,
    APP_KEY: process.env.APP_KEY,
    BACKEND_URL: process.env.BACKEND_URL,
    WEB_URL: process.env.WEB_URL,
    SWING_SETTINGS: {
        // Độ nhạy cho swing detection
        SENSITIVITY: 1,
        // Số nến tối thiểu giữa hai swing point
        MIN_CANDLES_BETWEEN_SWINGS: 3,
    }
};
