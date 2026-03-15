"""
Billing Route — EnergyNest
Handles bill generation integrating solar credit deduction, grid usage, and subscription cost.

Formula:
  final_bill_units = grid_units - solar_credits
  billable_units   = max(0, grid_units - solar_credits)
"""
from fastapi import APIRouter, HTTPException
from database import get_billing, solar_plants_db, users_db
from datetime import datetime

router = APIRouter()


@router.get("/billing/{user_id}")
async def get_user_billing(user_id: str):
    """
    GET /api/billing/{user_id}
    Returns grid_units, solar_credits, billable_units, subscription_cost, final_bill.
    """
    try:
        base = get_billing(user_id)

        # Enrich with VSP solar credit deduction
        now = datetime.now()
        irradiance = {
            1: 0.88, 2: 0.90, 3: 0.95, 4: 0.98, 5: 0.92, 6: 0.82,
            7: 0.75, 8: 0.78, 9: 0.85, 10: 0.90, 11: 0.88, 12: 0.85
        }.get(now.month, 0.90)

        plant = solar_plants_db.get("PLANT-001", {})
        plant_capacity_kw = plant.get("plant_capacity_kw", 500.0)
        solar_today_kwh = round(plant_capacity_kw * 5.5 * irradiance * 0.8, 0)

        # User subscription share
        user = users_db.get(user_id, {})
        subscribed_kw = 2.0  # default standard plan
        user_share = subscribed_kw / plant_capacity_kw
        monthly_solar_credits = round(solar_today_kwh * user_share * 28, 1)

        # Billing formula
        grid_units = float(base.get("grid_units", 150))
        solar_credits = monthly_solar_credits
        billable_units = max(0.0, round(grid_units - solar_credits, 1))

        tariff_rate = 5.5   # ₹/kWh DISCOM rate
        grid_cost = round(billable_units * tariff_rate, 2)
        subscription_cost = base.get("subscription_cost", 1299)
        final_bill = round(grid_cost + subscription_cost, 2)
        savings = round(solar_credits * tariff_rate, 2)

        return {
            **base,
            # Solar credit deduction fields
            "grid_units": grid_units,
            "solar_credits": solar_credits,
            "billable_units": billable_units,
            "tariff_per_unit": tariff_rate,
            "grid_cost": grid_cost,
            "subscription_cost": subscription_cost,
            "final_bill": final_bill,
            "solar_savings_inr": savings,
            "solar_coverage_pct": round(min(100, (solar_credits / max(grid_units, 1)) * 100), 1),
            "note": "Final bill = Grid units consumed − Solar credits received via VSP"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
