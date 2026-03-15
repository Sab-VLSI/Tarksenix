"""
Company Route — EnergyNest
Handles energy company dashboard: solar plants management, subscriber allocation, credit distribution.
"""
from fastapi import APIRouter, HTTPException
from typing import Optional
from database import solar_plants_db, users_db, subscriptions_db
from datetime import datetime

router = APIRouter()

# All registered subscribers (mock — in prod would be from DB)
_SUBSCRIBERS = [
    {"user_id": "owner@smartintelli.com", "name": "Rajan Kumar",      "subscribed_kw": 2.0, "plan": "standard", "user_type": "virtual_solar_user"},
    {"user_id": "user2@apartment.com",    "name": "Priya Sharma",     "subscribed_kw": 1.0, "plan": "basic",    "user_type": "virtual_solar_user"},
    {"user_id": "user3@pg.com",           "name": "Green PG Hostel",  "subscribed_kw": 3.0, "plan": "premium",  "user_type": "virtual_solar_user"},
    {"user_id": "user4@shop.com",         "name": "Durga Trendy Shop", "subscribed_kw": 1.5, "plan": "basic",   "user_type": "virtual_solar_user"},
    {"user_id": "user5@home.com",         "name": "Kavya Reddy",      "subscribed_kw": 4.0, "plan": "premium",  "user_type": "individual_home"},
    {"user_id": "user6@flat.com",         "name": "Flat 4B, Greenwood", "subscribed_kw": 2.0, "plan": "standard", "user_type": "virtual_solar_user"},
    {"user_id": "user7@office.com",       "name": "SriSoft Technologies", "subscribed_kw": 5.0, "plan": "premium", "user_type": "virtual_solar_user"},
    {"user_id": "user8@villa.com",        "name": "Raj Villa",        "subscribed_kw": 3.0, "plan": "premium",  "user_type": "individual_home"},
]


def _calc_solar_today(plant_capacity_kw: float) -> float:
    now = datetime.now()
    irradiance = {
        1: 0.88, 2: 0.90, 3: 0.95, 4: 0.98, 5: 0.92, 6: 0.82,
        7: 0.75, 8: 0.78, 9: 0.85, 10: 0.90, 11: 0.88, 12: 0.85
    }.get(now.month, 0.90)
    return round(plant_capacity_kw * 5.5 * irradiance * 0.8, 0)


# ── Solar Plants ──────────────────────────────────────────────

@router.get("/company/plants")
async def get_all_plants():
    """GET /api/company/plants — List all solar plants with live generation data."""
    plants = []
    for plant_id, plant in solar_plants_db.items():
        gen_today = _calc_solar_today(plant["plant_capacity_kw"])
        plants.append({
            "plant_id": plant_id,
            "plant_name": plant["plant_name"],
            "capacity_kw": plant["plant_capacity_kw"],
            "location": plant["location"],
            "active_subscribers": plant.get("active_subscribers", 0),
            "total_generation_today_kwh": gen_today,
            "monthly_generation_kwh": plant.get("monthly_generation_units", 0),
            "status": plant.get("status", "active"),
            "commissioned": plant.get("commissioned", "—"),
        })
    return {"plants": plants, "total": len(plants)}


@router.get("/company/plants/{plant_id}")
async def get_plant_detail(plant_id: str):
    """GET /api/company/plants/{plant_id} — Single plant detail."""
    plant = solar_plants_db.get(plant_id)
    if not plant:
        raise HTTPException(status_code=404, detail=f"Plant {plant_id} not found")
    gen_today = _calc_solar_today(plant["plant_capacity_kw"])
    return {**plant, "total_generation_today_kwh": gen_today}


# ── Credit Distribution ───────────────────────────────────────

@router.get("/company/credit-distribution/{plant_id}")
async def get_credit_distribution(plant_id: str):
    """
    GET /api/company/credit-distribution/{plant_id}

    Shows each subscriber's allocated solar units:
      user_share = subscribed_kw / plant_capacity_kw
      allocated_kwh = solar_generated_today * user_share
    """
    plant = solar_plants_db.get(plant_id)
    if not plant:
        raise HTTPException(status_code=404, detail=f"Plant {plant_id} not found")

    plant_capacity_kw = plant["plant_capacity_kw"]
    gen_today_kwh = _calc_solar_today(plant_capacity_kw)
    total_subscribed_kw = sum(s["subscribed_kw"] for s in _SUBSCRIBERS)

    distribution = []
    for sub in _SUBSCRIBERS:
        user_share = sub["subscribed_kw"] / plant_capacity_kw
        allocated_kwh = round(gen_today_kwh * user_share, 2)
        monthly_kwh = round(allocated_kwh * 28, 1)
        bill_reduction_pct = round(min(100, (monthly_kwh / 150.0) * 100), 1)
        distribution.append({
            "subscriber_id": sub["user_id"],
            "name": sub["name"],
            "subscribed_capacity_kw": sub["subscribed_kw"],
            "user_share_percent": round(user_share * 100, 3),
            "allocated_today_kwh": allocated_kwh,
            "monthly_credits_kwh": monthly_kwh,
            "subscription_plan": sub["plan"],
            "user_type": sub["user_type"],
            "bill_reduction_pct": bill_reduction_pct,
        })

    # Sort by allocated units descending
    distribution.sort(key=lambda x: x["allocated_today_kwh"], reverse=True)

    return {
        "plant_id": plant_id,
        "plant_name": plant["plant_name"],
        "plant_capacity_kw": plant_capacity_kw,
        "solar_generated_today_kwh": gen_today_kwh,
        "total_subscribed_kw": total_subscribed_kw,
        "subscriber_count": len(distribution),
        "distribution": distribution,
        "timestamp": datetime.now().isoformat(),
    }


# ── Subscriber Allocation ─────────────────────────────────────

@router.get("/company/subscribers")
async def get_all_subscribers():
    """GET /api/company/subscribers — All VSP subscribers with their allocations."""
    plant = solar_plants_db.get("PLANT-001", {})
    plant_capacity_kw = plant.get("plant_capacity_kw", 500.0)
    gen_today = _calc_solar_today(plant_capacity_kw)

    result = []
    for sub in _SUBSCRIBERS:
        user_share = sub["subscribed_kw"] / plant_capacity_kw
        result.append({
            **sub,
            "user_share_percent": round(user_share * 100, 3),
            "allocated_today_kwh": round(gen_today * user_share, 2),
            "monthly_credits_kwh": round(gen_today * user_share * 28, 1),
        })
    return {"subscribers": result, "total": len(result)}


# ── Grid Summary for Company Dashboard ───────────────────────

@router.get("/company/grid-summary")
async def get_grid_summary():
    """GET /api/company/grid-summary — High-level grid and generation metrics."""
    total_installed_kw = sum(p["plant_capacity_kw"] for p in solar_plants_db.values())
    total_gen = sum(_calc_solar_today(p["plant_capacity_kw"]) for p in solar_plants_db.values())
    total_subs = len(_SUBSCRIBERS)

    return {
        "connected_vendors": 156,
        "active_assets": int(total_installed_kw),
        "capacity_utilization": 87,
        "renewable_contribution": round((total_gen / (total_gen + 5000)) * 100, 1),
        "total_supply": total_installed_kw * 4,
        "total_demand": total_installed_kw * 3.5,
        "solar_plants": len(solar_plants_db),
        "active_subscribers": total_subs,
        "total_kw_subscribed": sum(s["subscribed_kw"] for s in _SUBSCRIBERS),
        "solar_generated_today_kwh": total_gen,
    }


# ── Energy Savings Analytics ──────────────────────────────────

@router.get("/energy/savings/{user_id}")
async def get_energy_savings(user_id: str):
    """
    GET /api/energy/savings/{user_id}

    Calculates solar savings impact:
      money_saved  = solar_units_used × tariff_rate (₹5.5/kWh)
      carbon_saved = solar_units_used × 0.82 (kg CO₂/kWh, India grid factor)
    """
    try:
        now = datetime.now()
        irradiance = {
            1: 0.88, 2: 0.90, 3: 0.95, 4: 0.98, 5: 0.92, 6: 0.82,
            7: 0.75, 8: 0.78, 9: 0.85, 10: 0.90, 11: 0.88, 12: 0.85
        }.get(now.month, 0.90)

        plant = solar_plants_db.get("PLANT-001", {})
        plant_capacity_kw = plant.get("plant_capacity_kw", 500.0)
        solar_gen_today = round(plant_capacity_kw * 5.5 * irradiance * 0.8, 0)

        # User VSP share (default standard 2 kW)
        subscribed_kw = 2.0
        user_share = subscribed_kw / plant_capacity_kw
        solar_units_today = round(solar_gen_today * user_share, 2)
        solar_units_monthly = round(solar_units_today * 28, 1)

        TARIFF_RATE = 5.5          # ₹/kWh DISCOM rate
        CARBON_FACTOR = 0.82       # kg CO₂/kWh (India grid average, CEA 2023)

        # Monthly figures
        money_saved = round(solar_units_monthly * TARIFF_RATE, 2)
        carbon_saved = round(solar_units_monthly * CARBON_FACTOR, 2)
        grid_avoided = solar_units_monthly   # 1:1 offset

        # Equivalences to make it tangible
        trees_equivalent = round(carbon_saved / 21.77, 1)   # 1 tree absorbs ~21.77 kg CO₂/yr
        km_equivalent = round(carbon_saved / 0.12, 0)       # avg car ~0.12 kg CO₂/km

        return {
            "user_id": user_id,
            "solar_units_used_kwh": solar_units_monthly,
            "solar_units_today_kwh": solar_units_today,
            "grid_units_avoided_kwh": grid_avoided,
            "money_saved_inr": money_saved,
            "carbon_saved_kg": carbon_saved,
            "tariff_rate": TARIFF_RATE,
            "carbon_factor": CARBON_FACTOR,
            "trees_equivalent": trees_equivalent,
            "km_car_equivalent": km_equivalent,
            "irradiance_factor": irradiance,
            "billing_cycle_days": 28,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Solar Generation Forecast ─────────────────────────────────

@router.get("/solar/forecast")
async def get_solar_forecast():
    """
    GET /api/solar/forecast

    24-hour solar output prediction using sunlight_factor model:
      solar_output_kw = plant_capacity_kw × sunlight_factor × irradiance_factor
    """
    try:
        now = datetime.now()
        irradiance = {
            1: 0.88, 2: 0.90, 3: 0.95, 4: 0.98, 5: 0.92, 6: 0.82,
            7: 0.75, 8: 0.78, 9: 0.85, 10: 0.90, 11: 0.88, 12: 0.85
        }.get(now.month, 0.90)

        plant = solar_plants_db.get("PLANT-001", {})
        plant_capacity_kw = plant.get("plant_capacity_kw", 500.0)

        # Sunlight factor profile (0–1 scale, India tropical irradiance curve)
        SUNLIGHT_FACTORS = {
            0: 0.0,  1: 0.0,  2: 0.0,  3: 0.0,  4: 0.0,  5: 0.02,
            6: 0.05, 7: 0.20, 8: 0.45, 9: 0.68, 10: 0.82, 11: 0.90,
            12: 0.95, 13: 0.92, 14: 0.87, 15: 0.78, 16: 0.62, 17: 0.38,
            18: 0.15, 19: 0.03, 20: 0.0, 21: 0.0, 22: 0.0, 23: 0.0,
        }

        hourly = []
        total_kwh = 0.0
        peak_kw = 0.0
        peak_hour_label = "12 PM"

        for h in range(24):
            sf = SUNLIGHT_FACTORS.get(h, 0.0)
            output_kw = round(plant_capacity_kw * sf * irradiance, 2)
            label = f"{h % 12 or 12} {'AM' if h < 12 else 'PM'}"
            hourly.append({
                "hour": h,
                "label": label,
                "sunlight_factor": sf,
                "output_kw": output_kw,
            })
            total_kwh += output_kw
            if output_kw > peak_kw:
                peak_kw = output_kw
                peak_hour_label = label

        return {
            "plant_capacity_kw": plant_capacity_kw,
            "irradiance_factor": irradiance,
            "peak_output_kw": round(peak_kw, 1),
            "total_daily_kwh": round(total_kwh, 0),
            "peak_hour": peak_hour_label,
            "hourly": hourly,
            "model": "output = plant_capacity × sunlight_factor × irradiance",
            "timestamp": now.isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── System Energy Flow (Platform Overview) ────────────────────

@router.get("/system/energy-flow")
async def get_system_energy_flow():
    """
    GET /api/system/energy-flow

    Returns aggregated system-level energy flow data for the overview page:
      solar_generation_today → solar_distributed → grid_export
      subscribers            → average_user_credit
      grid_import / grid_export / net_balance
    """
    try:
        now = datetime.now()
        irradiance = {
            1: 0.88, 2: 0.90, 3: 0.95, 4: 0.98, 5: 0.92, 6: 0.82,
            7: 0.75, 8: 0.78, 9: 0.85, 10: 0.90, 11: 0.88, 12: 0.85
        }.get(now.month, 0.90)

        # Aggregate across all plants
        total_capacity_kw = sum(p["plant_capacity_kw"] for p in solar_plants_db.values())
        solar_generation_today = round(total_capacity_kw * 5.5 * irradiance * 0.8, 0)

        # Distribution model:
        # 80% allocated to subscribers (VSP credits)
        # 20% surplus exported to DISCOM grid
        solar_distributed   = round(solar_generation_today * 0.80, 0)
        grid_export         = round(solar_generation_today * 0.20, 0)

        # Subscriber stats
        num_subscribers     = len(_SUBSCRIBERS)
        total_subscribed_kw = sum(s["subscribed_kw"] for s in _SUBSCRIBERS)

        # Average per-user credit (daily)
        if num_subscribers > 0:
            average_user_credit = round(solar_distributed / num_subscribers, 1)
        else:
            average_user_credit = 0.0

        # Monthly totals (28-day cycle)
        total_credits_distributed = round(solar_distributed * 28, 0)

        # Grid interaction
        # Grid import = total kWh consumed by subscribers from grid
        grid_import = round(num_subscribers * 150.0, 0)   # 150 kWh avg/user/month
        net_grid_balance = round(grid_export - grid_import, 0)

        # Bill reduction: avg_user_credit_monthly / grid_consumption_per_user
        monthly_user_credit  = round(average_user_credit * 28, 1)
        grid_consumption_avg = 150.0
        avg_bill_reduction   = round(min(100, (monthly_user_credit / grid_consumption_avg) * 100), 1)

        return {
            # Core flow metrics
            "solar_generation_today"    : int(solar_generation_today),
            "solar_distributed"         : int(solar_distributed),
            "grid_export"               : int(grid_export),
            "subscribers"               : num_subscribers,
            "average_user_credit"       : average_user_credit,
            # Expanded stats
            "solar_plants"              : len(solar_plants_db),
            "total_capacity_kw"         : total_capacity_kw,
            "total_subscribed_kw"       : total_subscribed_kw,
            "total_credits_distributed" : int(total_credits_distributed),
            "grid_import"               : int(grid_import),
            "net_grid_balance"          : int(net_grid_balance),
            "avg_bill_reduction_pct"    : avg_bill_reduction,
            "irradiance_factor"         : irradiance,
            "timestamp"                 : now.isoformat(),
            "note": (
                "solar_distributed = 80% of generation allocated to VSP subscribers; "
                "grid_export = 20% surplus to DISCOM pool"
            ),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Building / Zone allocation model ────────────────────────────
# Maps building names → subscriber list for building-level reporting
_BUILDINGS = [
    {
        "building_name": "Greenwood Apartments",
        "subscribers": 3,
        "subscribed_kw": 5.0,
        "grid_backup_factor": 0.12,   # 12% of demand comes from grid
    },
    {
        "building_name": "SriSoft Tech Park",
        "subscribers": 1,
        "subscribed_kw": 5.0,
        "grid_backup_factor": 0.08,
    },
    {
        "building_name": "Green PG Hostel",
        "subscribers": 1,
        "subscribed_kw": 3.0,
        "grid_backup_factor": 0.18,
    },
    {
        "building_name": "Durga Commercial Zone",
        "subscribers": 2,
        "subscribed_kw": 2.5,
        "grid_backup_factor": 0.20,
    },
    {
        "building_name": "Raj Residential Villa",
        "subscribers": 1,
        "subscribed_kw": 5.0,
        "grid_backup_factor": 0.05,
    },
]


# ── Energy Flow Summary ────────────────────────────────────────

@router.get("/company/energy-flow")
async def get_energy_flow():
    """
    GET /api/company/energy-flow
    Returns top-level daily energy flow summary for the company.
    """
    try:
        now = datetime.now()
        irradiance = {
            1: 0.88, 2: 0.90, 3: 0.95, 4: 0.98, 5: 0.92, 6: 0.82,
            7: 0.75, 8: 0.78, 9: 0.85, 10: 0.90, 11: 0.88, 12: 0.85
        }.get(now.month, 0.90)

        total_capacity_kw = sum(p["plant_capacity_kw"] for p in solar_plants_db.values())
        solar_generated_today = round(total_capacity_kw * 5.5 * irradiance * 0.8, 1)
        energy_allocated_today = round(solar_generated_today * 0.80, 1)
        grid_exported_today    = round(solar_generated_today * 0.20, 1)
        active_subscribers     = len(_SUBSCRIBERS)

        return {
            "solar_generated_today":  solar_generated_today,
            "energy_allocated_today": energy_allocated_today,
            "grid_exported_today":    grid_exported_today,
            "active_subscribers":     active_subscribers,
            "timestamp":              now.isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Real-Time Status ───────────────────────────────────────────

@router.get("/company/real-time-status")
async def get_real_time_status():
    """
    GET /api/company/real-time-status
    Returns live plant-level kW generation and grid interaction data.
    """
    try:
        now = datetime.now()
        hour = now.hour
        SUNLIGHT = {
            0:0,1:0,2:0,3:0,4:0,5:0.02,6:0.05,7:0.20,
            8:0.45,9:0.68,10:0.82,11:0.90,12:0.95,
            13:0.92,14:0.87,15:0.78,16:0.62,17:0.38,
            18:0.15,19:0.03,20:0,21:0,22:0,23:0,
        }
        irradiance = {
            1:0.88,2:0.90,3:0.95,4:0.98,5:0.92,6:0.82,
            7:0.75,8:0.78,9:0.85,10:0.90,11:0.88,12:0.85
        }.get(now.month, 0.90)

        total_capacity_kw = sum(p["plant_capacity_kw"] for p in solar_plants_db.values())
        sf = SUNLIGHT.get(hour, 0)
        plant_power_kw = round(total_capacity_kw * sf * irradiance, 1)

        # Total generated so far today (integral over hours 0..now)
        generated_kwh = sum(
            total_capacity_kw * SUNLIGHT.get(h, 0) * irradiance
            for h in range(hour + 1)
        )
        grid_net_export_kwh   = round(generated_kwh * 0.20, 1)
        subscriber_allocated  = round(generated_kwh * 0.80, 1)
        building_load_kw      = round(plant_power_kw * 0.75, 1)  # 75% of generation = building demand

        return {
            "plant_power_kw":         plant_power_kw,
            "grid_net_export_kwh":    grid_net_export_kwh,
            "building_load_kw":       building_load_kw,
            "subscriber_allocated_kwh": subscriber_allocated,
            "timestamp":              now.isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Building-Level Allocation ─────────────────────────────────

@router.get("/company/building-allocation")
async def get_building_allocation():
    """
    GET /api/company/building-allocation
    Returns per-building solar allocation and grid backup usage.
    """
    try:
        now = datetime.now()
        irradiance = {
            1:0.88,2:0.90,3:0.95,4:0.98,5:0.92,6:0.82,
            7:0.75,8:0.78,9:0.85,10:0.90,11:0.88,12:0.85
        }.get(now.month, 0.90)

        total_capacity_kw = sum(p["plant_capacity_kw"] for p in solar_plants_db.values())
        solar_today = total_capacity_kw * 5.5 * irradiance * 0.8

        result = []
        for b in _BUILDINGS:
            share = b["subscribed_kw"] / total_capacity_kw
            allocated_kwh  = round(solar_today * share * 0.80, 1)
            grid_backup    = round(allocated_kwh * b["grid_backup_factor"], 1)
            total_demand   = allocated_kwh + grid_backup
            efficiency_pct = round((allocated_kwh / total_demand) * 100, 1) if total_demand > 0 else 0
            result.append({
                "building_name":    b["building_name"],
                "subscribers":      b["subscribers"],
                "allocated_kwh":    allocated_kwh,
                "grid_backup_kwh":  grid_backup,
                "efficiency_percent": efficiency_pct,
            })

        # Sort by allocated descending
        result.sort(key=lambda x: x["allocated_kwh"], reverse=True)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Capacity Status ────────────────────────────────────────────

@router.get("/company/capacity-status")
async def get_capacity_status():
    """
    GET /api/company/capacity-status
    Returns plant vs subscribed capacity and allocation status.
    """
    try:
        plant_capacity_kw    = sum(p["plant_capacity_kw"] for p in solar_plants_db.values())
        subscribed_capacity  = sum(s["subscribed_kw"] for s in _SUBSCRIBERS)
        remaining            = round(plant_capacity_kw - subscribed_capacity, 1)
        utilization_pct      = round((subscribed_capacity / plant_capacity_kw) * 100, 1) if plant_capacity_kw > 0 else 0

        if utilization_pct > 95:
            status = "overloaded"
        elif utilization_pct > 80:
            status = "near_capacity"
        else:
            status = "balanced"

        return {
            "plant_capacity_kw":      plant_capacity_kw,
            "subscribed_capacity_kw": round(subscribed_capacity, 1),
            "remaining_capacity_kw":  remaining,
            "utilization_percent":    utilization_pct,
            "status":                 status,
            "timestamp":              datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Community Solar Overview ───────────────────────────────────

@router.get("/company/community-overview")
async def get_community_overview():
    """
    GET /api/company/community-overview
    Top-level daily solar snapshot for Community Solar Intelligence page.
    """
    try:
        now = datetime.now()
        irradiance = {
            1: 0.88, 2: 0.90, 3: 0.95, 4: 0.98, 5: 0.92, 6: 0.82,
            7: 0.75, 8: 0.78, 9: 0.85, 10: 0.90, 11: 0.88, 12: 0.85
        }.get(now.month, 0.90)

        total_capacity_kw  = sum(p["plant_capacity_kw"] for p in solar_plants_db.values())
        solar_generated    = round(total_capacity_kw * 5.5 * irradiance * 0.8, 1)
        allocated_today    = round(solar_generated * 0.80, 1)

        # Grid backup = sum of all building grid-backup usage
        grid_backup_total  = round(sum(
            (allocated_today * (b["subscribed_kw"] / total_capacity_kw) * 0.80) * b["grid_backup_factor"]
            for b in _BUILDINGS
        ), 1) if total_capacity_kw > 0 else 0

        return {
            "solar_generated_today": solar_generated,
            "allocated_today":       allocated_today,
            "grid_backup_today":     grid_backup_total,
            "active_buildings":      len(_BUILDINGS),
            "active_subscribers":    len(_SUBSCRIBERS),
            "timestamp":             now.isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Building Performance ───────────────────────────────────────

@router.get("/company/building-performance")
async def get_building_performance():
    """
    GET /api/company/building-performance
    Per-building solar allocation vs grid backup — same logic as building-allocation.
    """
    try:
        now = datetime.now()
        irradiance = {
            1: 0.88, 2: 0.90, 3: 0.95, 4: 0.98, 5: 0.92, 6: 0.82,
            7: 0.75, 8: 0.78, 9: 0.85, 10: 0.90, 11: 0.88, 12: 0.85
        }.get(now.month, 0.90)

        total_capacity_kw = sum(p["plant_capacity_kw"] for p in solar_plants_db.values())
        solar_today = total_capacity_kw * 5.5 * irradiance * 0.8

        result = []
        for b in _BUILDINGS:
            share         = b["subscribed_kw"] / total_capacity_kw if total_capacity_kw > 0 else 0
            allocated_kwh = round(solar_today * share * 0.80, 1)
            grid_kwh      = round(allocated_kwh * b["grid_backup_factor"], 1)
            total_demand  = allocated_kwh + grid_kwh
            efficiency    = round((allocated_kwh / total_demand) * 100, 1) if total_demand > 0 else 0
            result.append({
                "building_name":      b["building_name"],
                "subscribers":        b["subscribers"],
                "allocated_kwh":      allocated_kwh,
                "grid_kwh":           grid_kwh,
                "efficiency_percent": efficiency,
            })

        result.sort(key=lambda x: x["efficiency_percent"], reverse=True)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── 7-Day Solar Trend ─────────────────────────────────────────

@router.get("/company/solar-trend")
async def get_solar_trend():
    """
    GET /api/company/solar-trend
    Daily generated vs allocated for the past 7 days.
    """
    try:
        from datetime import timedelta
        now = datetime.now()

        # Monthly irradiance lookup
        IRRADIANCE = {
            1: 0.88, 2: 0.90, 3: 0.95, 4: 0.98, 5: 0.92, 6: 0.82,
            7: 0.75, 8: 0.78, 9: 0.85, 10: 0.90, 11: 0.88, 12: 0.85
        }

        total_capacity_kw = sum(p["plant_capacity_kw"] for p in solar_plants_db.values())

        # Day-of-week weather variation (±5%)
        DOW_FACTOR = {0: 0.97, 1: 0.98, 2: 1.00, 3: 1.01, 4: 0.99, 5: 0.96, 6: 0.95}

        trend = []
        for offset in range(6, -1, -1):
            day = now - timedelta(days=offset)
            ir  = IRRADIANCE.get(day.month, 0.90)
            dw  = DOW_FACTOR.get(day.weekday(), 1.0)
            generated = round(total_capacity_kw * 5.5 * ir * 0.8 * dw, 1)
            allocated = round(generated * 0.80, 1)
            trend.append({
                "date":      day.strftime("%Y-%m-%d"),
                "label":     day.strftime("%a"),        # Mon, Tue …
                "generated": generated,
                "allocated": allocated,
            })

        return trend
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Dashboard Overview (5 summary cards) ─────────────────────────

@router.get("/company/overview")
async def get_company_overview():
    """GET /api/company/overview — Top-level 5-card summary for Dashboard page."""
    try:
        now = datetime.now()
        irradiance = {
            1: 0.88, 2: 0.90, 3: 0.95, 4: 0.98, 5: 0.92, 6: 0.82,
            7: 0.75, 8: 0.78, 9: 0.85, 10: 0.90, 11: 0.88, 12: 0.85
        }.get(now.month, 0.90)

        total_capacity_kw = sum(p["plant_capacity_kw"] for p in solar_plants_db.values())
        solar_generated   = round(total_capacity_kw * 5.5 * irradiance * 0.8, 1)
        allocated_today   = round(solar_generated * 0.80, 1)
        grid_backup_total = round(sum(
            (allocated_today * (b["subscribed_kw"] / total_capacity_kw) * 0.80) * b["grid_backup_factor"]
            for b in _BUILDINGS
        ), 1) if total_capacity_kw > 0 else 0

        return {
            "solar_generated_today": solar_generated,
            "allocated_today":       allocated_today,
            "grid_backup_today":     grid_backup_total,
            "active_buildings":      len(_BUILDINGS),
            "active_subscribers":    len(_SUBSCRIBERS),
            "timestamp":             now.isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Solar Page Data (capacity + status) ──────────────────────────

@router.get("/company/solar-data")
async def get_solar_data():
    """GET /api/company/solar-data — Plant capacity summary for Solar page."""
    try:
        now = datetime.now()
        irradiance = {
            1: 0.88, 2: 0.90, 3: 0.95, 4: 0.98, 5: 0.92, 6: 0.82,
            7: 0.75, 8: 0.78, 9: 0.85, 10: 0.90, 11: 0.88, 12: 0.85
        }.get(now.month, 0.90)

        total_capacity_kw    = sum(p["plant_capacity_kw"] for p in solar_plants_db.values())
        subscribed_kw        = sum(b["subscribed_kw"] for b in _BUILDINGS)
        remaining_kw         = round(total_capacity_kw - subscribed_kw, 1)
        utilization_pct      = round((subscribed_kw / total_capacity_kw) * 100, 1) if total_capacity_kw > 0 else 0
        solar_generated_today = round(total_capacity_kw * 5.5 * irradiance * 0.8, 1)
        status = (
            "overloaded" if utilization_pct > 100
            else "near_capacity" if utilization_pct > 85
            else "balanced"
        )
        return {
            "plant_capacity_kw":     total_capacity_kw,
            "subscribed_capacity_kw": subscribed_kw,
            "remaining_capacity_kw": remaining_kw,
            "utilization_percent":   utilization_pct,
            "solar_generated_today": solar_generated_today,
            "active_plants":         len(solar_plants_db),
            "status":                status,
            "timestamp":             now.isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── AI Control Status ─────────────────────────────────────────────

@router.get("/company/ai-status")
async def get_ai_status():
    """GET /api/company/ai-status — Capacity utilisation + peak risk summary for AI Control page."""
    try:
        now = datetime.now()
        total_capacity_kw = sum(p["plant_capacity_kw"] for p in solar_plants_db.values())
        subscribed_kw     = sum(b["subscribed_kw"] for b in _BUILDINGS)
        utilization_pct   = round((subscribed_kw / total_capacity_kw) * 100, 1) if total_capacity_kw > 0 else 0

        current_hour = now.hour
        BASE = {
            6: 3.2, 7: 4.5, 8: 5.1, 9: 4.8, 10: 4.2, 11: 3.9,
            12: 4.0, 13: 4.3, 14: 5.0, 15: 5.2, 16: 5.4, 17: 5.8,
            18: 6.2, 19: 7.2, 20: 7.8, 21: 7.1, 22: 6.0, 23: 4.8,
            0: 3.8, 1: 3.2, 2: 2.9, 3: 2.8, 4: 2.7, 5: 3.0,
        }
        grid_cap = 8.5
        season_adj = 0.8 if 3 <= now.month <= 6 else (0.3 if now.month in [11, 12, 1, 2] else 0.0)
        load_now  = round((BASE.get(current_hour, 4.5) * 0.012) + 0.15 + season_adj, 2)
        ratio     = load_now / grid_cap
        risk      = "High" if ratio > 0.9 else ("Medium" if ratio > 0.7 else "Low")

        return {
            "capacity_utilization_percent": utilization_pct,
            "subscribed_kw":               subscribed_kw,
            "total_capacity_kw":           total_capacity_kw,
            "current_load_mw":             load_now,
            "grid_capacity_mw":            grid_cap,
            "peak_risk":                   risk,
            "solar_available":             6 <= current_hour <= 17,
            "timestamp":                   now.isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
