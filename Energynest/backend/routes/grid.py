"""
Grid Optimization Route — EnergyNest
Handles smart grid load balancing for homeowners and grid-level analytics for energy companies.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from database import run_grid_optimization, get_company_grid_optimization

router = APIRouter()


class GridOptimizeRequest(BaseModel):
    user_id: str
    solar_generation_kw: Optional[float] = 0.0
    current_demand_kw: Optional[float] = 3.5
    battery_soc_percent: Optional[float] = 45.0
    is_peak_time: Optional[bool] = True


@router.post("/grid/optimize-load")
async def optimize_load(req: GridOptimizeRequest):
    """
    POST /api/grid/optimize-load
    Runs peak shaving / load balancing algorithm.
    """
    try:
        return run_grid_optimization(
            email=req.user_id,
            solar_gen=req.solar_generation_kw,
            demand=req.current_demand_kw,
            battery_soc=req.battery_soc_percent,
            peak_time=req.is_peak_time,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/company/grid-optimization")
async def company_grid_optimization():
    """GET /api/company/grid-optimization — Company-level grid analytics."""
    try:
        return get_company_grid_optimization()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/grid/prediction")
async def grid_prediction():
    """
    GET /api/grid/prediction
    Deterministic AI grid stability prediction.

    Algorithm:
      base_load    = BEE hourly residential demand profile (India standard)
      predicted    = base_load * scale + growth_rate + season_adjustment
      grid_risk    = predicted_load / grid_capacity
      risk_level   = High (>0.9) | Medium (>0.7) | Low
    """
    try:
        now = datetime.now()
        current_hour = now.hour
        month = now.month
        grid_capacity_mw = 8.5

        # Season adjustment: summer (Mar–Jun) +0.8 MW cooling load, winter +0.3 MW heating
        season_adj = 0.8 if 3 <= month <= 6 else (0.3 if month in [11, 12, 1, 2] else 0.0)

        # BEE-standard hourly residential load profile (base kW per 1000 homes, India)
        BASE_LOAD_PROFILE = {
            6: 3.2, 7: 4.5, 8: 5.1, 9: 4.8, 10: 4.2, 11: 3.9,
            12: 4.0, 13: 4.3, 14: 5.0, 15: 5.2, 16: 5.4, 17: 5.8,
            18: 6.2, 19: 7.2, 20: 7.8, 21: 7.1, 22: 6.0, 23: 4.8,
            0: 3.8, 1: 3.2, 2: 2.9, 3: 2.8, 4: 2.7, 5: 3.0,
        }

        # Grid serves ~12,000 homes → scale to MW
        SCALE = 12.0 / 1000.0
        GROWTH_RATE = 0.15   # MW correction for annual grid growth

        # Forecast next 8 hours starting at 3 PM (or current hour if past 3 PM)
        start_hour = max(current_hour, 15)
        hourly_forecast = []
        for i in range(8):
            h = (start_hour + i) % 24
            base = BASE_LOAD_PROFILE.get(h, 4.5)
            load_mw = round((base * SCALE * 1000) + GROWTH_RATE + season_adj, 2)
            load_mw = max(2.5, min(load_mw, grid_capacity_mw * 0.98))
            ratio = load_mw / grid_capacity_mw
            risk = "High" if ratio > 0.9 else ("Medium" if ratio > 0.7 else "Low")
            hour_label = f"{h % 12 or 12} {'AM' if h < 12 else 'PM'}"
            hourly_forecast.append({
                "time": hour_label,
                "hour": h,
                "load_mw": load_mw,
                "risk": risk,
            })

        # Peak = maximum predicted hour
        peak_entry = max(hourly_forecast, key=lambda x: x["load_mw"])
        predicted_load = peak_entry["load_mw"]
        grid_risk_ratio = predicted_load / grid_capacity_mw

        if grid_risk_ratio > 0.9:
            risk_level = "High"
        elif grid_risk_ratio > 0.7:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        solar_available = 6 <= current_hour <= 17
        solar_dropping = 16 <= current_hour <= 19

        # Dynamic AI alerts based on grid state
        alerts = []
        if risk_level == "High":
            alerts.append({
                "message": f"⚠️ Peak demand expected at {peak_entry['time']} — {predicted_load:.1f} MW approaching capacity limit.",
                "severity": "high", "time": peak_entry["time"],
            })
        if solar_dropping:
            alerts.append({
                "message": "🌇 Solar generation declining after sunset — battery discharge recommended from 6 PM.",
                "severity": "medium", "time": "6 PM onwards",
            })
        if not solar_available:
            alerts.append({
                "message": "🌙 No solar generation available — grid running on conventional sources only.",
                "severity": "medium", "time": "Night",
            })
        if risk_level in ("Medium", "High"):
            alerts.append({
                "message": "🔋 Battery discharge recommended to reduce peak grid load.",
                "severity": "medium", "time": peak_entry["time"],
            })
        if grid_risk_ratio < 0.6:
            alerts.append({
                "message": "✅ Grid load within safe range. Optimal battery charging window available.",
                "severity": "low", "time": "Now",
            })
        alerts.append({
            "message": f"📊 Annual grid growth rate: +{GROWTH_RATE} MW/season. Capacity expansion recommended for Q3.",
            "severity": "info", "time": "Planning",
        })

        return {
            "predicted_load": predicted_load,
            "grid_capacity": grid_capacity_mw,
            "risk_level": risk_level,
            "grid_risk_ratio": round(grid_risk_ratio, 3),
            "peak_hour": peak_entry["time"],
            "season_adjustment_mw": season_adj,
            "growth_rate_mw": GROWTH_RATE,
            "solar_available": solar_available,
            "hourly_forecast": hourly_forecast,
            "alerts": alerts,
            "timestamp": now.isoformat(),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
