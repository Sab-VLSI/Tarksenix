export const STATE_TARIFFS = {
    DL: {
        name: "Delhi",
        baseRate: 6.0,
        calculateBill: (units) => {
            if (units <= 200) return 0; // Free up to 200 units
            const rawBill = units * 6.0;
            if (units <= 400) {
                // 50% subsidy (up to ₹800 max subsidy)
                const sub = Math.min(rawBill * 0.5, 800);
                return rawBill - sub;
            }
            return rawBill;
        }
    },
    KA: {
        name: "Karnataka",
        baseRate: 8.0,
        calculateBill: (units) => {
            // Gruha Jyothi scheme: up to 200 units free (assuming eligible)
            if (units <= 200) return 0;
            return (units - 200) * 8.0; // Simplification: pay for excess
        }
    },
    TN: {
        name: "Tamil Nadu",
        baseRate: 9.0,
        calculateBill: (units) => {
            // First 100 units free for all domestic consumers
            if (units <= 100) return 0;
            return (units - 100) * 9.0; // Simplification: flat rate above 100
        }
    },
    MH: {
        name: "Maharashtra",
        baseRate: 10.0,
        calculateBill: (units) => {
            // Limited/no blanket free units, progressive slab
            return units * 10.0;
        }
    }
};

export function calculateEstimatedBill(stateCode, units) {
    const stateData = STATE_TARIFFS[stateCode];
    if (!stateData) return units * 8.0; // Fallback
    return stateData.calculateBill(units);
}
