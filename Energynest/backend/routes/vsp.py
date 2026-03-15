"""
Virtual Solar Plant Route — EnergyNest
Handles VSP subscription, credit allocation, and energy credit calculation.
"""
from fastapi import APIRouter, HTTPException
from database import get_vsp_subscription, solar_plants_db, users_db
from datetime import datetime

router = APIRouter()

# ── VSP Subscription ──────────────────────────────────────────

@router.get("/vsp/subscription/{user_id}")
async def get_vsp(user_id: str):
    """GET /api/vsp/subscription/{user_id} — Returns plant_capacity_kw, user_subscription_kw, estimated_monthly_units."""
    try:
        return get_vsp_subscription(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/vsp/plants")
async def list_solar_plants():
    """GET /api/vsp/plants — List all solar plants."""
    return list(solar_plants_db.values())


# ── VSP Credit Allocation Engine ──────────────────────────────

@router.get("/vsp/credit-allocation/{user_id}")
async def get_credit_allocation(user_id: str):
    """
    GET /api/vsp/credit-allocation/{user_id}

    Algorithm:
      user_share = subscribed_capacity_kw / plant_total_capacity_kw
      allocated_units_kwh = solar_generated_today_kwh * user_share

    Returns today's allocated units + monthly credits.
    """
    try:
        user = users_db.get(user_id, {})
        user_type = user.get("user_type", "virtual_solar_user")

        # Get user's subscription details
        subscription = get_vsp_subscription(user_id)
        subscribed_capacity_kw = subscription.get("user_subscription_kw", 2.0)

        # Get plant data (default to PLANT-001 as primary plant)
        plant = solar_plants_db.get("PLANT-001", {})
        plant_capacity_kw = plant.get("plant_capacity_kw", 500.0)
        plant_name = plant.get("plant_name", "SmartGrid Solar Hub")
        plant_location = plant.get("location", "Tamil Nadu, India")

        # Deterministic daily generation model (typical India irradiance: 5.5 peak sun hours)
        now = datetime.now()
        hour = now.hour
        month = now.month

        # Monthly irradiance factor (India)
        irradiance = {
            1: 0.88, 2: 0.90, 3: 0.95, 4: 0.98, 5: 0.92, 6: 0.82,
            7: 0.75, 8: 0.78, 9: 0.85, 10: 0.90, 11: 0.88, 12: 0.85
        }.get(month, 0.90)

        solar_generated_today_kwh = round(plant_capacity_kw * 5.5 * irradiance * 0.8, 0)  # 80% plant factor

        # CORE ALGORITHM: proportional credit allocation
        user_share = subscribed_capacity_kw / plant_capacity_kw
        allocated_units_today_kwh = round(solar_generated_today_kwh * user_share, 2)

        # Monthly projection (28-day billing cycle)
        monthly_credits_kwh = round(allocated_units_today_kwh * 28, 1)

        # Progress through day — partial generation if not end of day
        day_progress = min(hour / 18.0, 1.0) if hour <= 18 else 1.0  # Solar ends at ~18:00
        actual_today_kwh = round(allocated_units_today_kwh * day_progress, 2)

        # Grid consumption (estimated based on subscription tier)
        monthly_grid_kwh = max(0, 150.0 - monthly_credits_kwh * 0.85)  # 85% credit utilization

        return {
            "user_id": user_id,
            "user_type": user_type,
            "subscribed_capacity_kw": subscribed_capacity_kw,
            "plant_id": "PLANT-001",
            "plant_name": plant_name,
            "plant_location": plant_location,
            "plant_total_capacity_kw": plant_capacity_kw,
            "solar_generated_today_kwh": solar_generated_today_kwh,
            "user_share_percent": round(user_share * 100, 4),
            "user_allocated_units_today_kwh": actual_today_kwh,
            "user_allocated_units_kwh": allocated_units_today_kwh,  # full-day quota
            "monthly_credits_kwh": monthly_credits_kwh,
            "monthly_grid_kwh": round(monthly_grid_kwh, 1),
            "solar_contribution_pct": round(
                min(100, (monthly_credits_kwh / max(monthly_grid_kwh + monthly_credits_kwh, 1)) * 100), 1
            ),
            "bill_reduction_pct": round(min(100, (monthly_credits_kwh / 150.0) * 100), 1),
            "irradiance_factor": irradiance,
            "day_progress_pct": round(day_progress * 100, 0),
            "note": "Solar energy generated from remote plant is allocated as energy credits via DISCOM grid.",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
