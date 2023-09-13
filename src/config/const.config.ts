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
    },
    APP_ENV: process.env.APP_ENV,
    APP_KEY: process.env.APP_KEY,
    BACKEND_URL: process.env.BACKEND_URL,
    WEB_URL: process.env.WEB_URL,
};
