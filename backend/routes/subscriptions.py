"""
Subscriptions Route — EnergyNest
Handles plan listing and activation.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_subscription_plans, activate_subscription

router = APIRouter()


class ActivateRequest(BaseModel):
    user_id: str   # user's email
    plan_name: str  # "basic", "standard", or "premium"


@router.get("/subscription/plans")
async def list_plans():
    """GET /api/subscription/plans — Returns all available subscription plans."""
    return get_subscription_plans()


@router.post("/subscription/activate")
async def activate_plan(req: ActivateRequest):
    """
    POST /api/subscription/activate
    Links the user to a subscription plan.
    """
    try:
        return activate_subscription(req.user_id, req.plan_name)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
