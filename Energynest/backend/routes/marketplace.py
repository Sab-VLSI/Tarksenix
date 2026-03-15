"""
Marketplace Route — Community Solar Energy Trading
Handles buy/sell energy credits, market status, and transaction history.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from database import (
    energy_market, energy_wallets, energy_transactions,
    get_or_create_wallet, add_market_transaction
)

router = APIRouter()


class BuyRequest(BaseModel):
    user_id: str
    energy_kwh: float


class SellRequest(BaseModel):
    user_id: str
    energy_kwh: float


# ─── Market Status ──────────────────────────────────────────

@router.get("/marketplace/status")
async def get_market_status():
    """GET /api/marketplace/status — Current market price and available credits."""
    return {
        "market_price_per_kwh": energy_market["market_price_per_kwh"],
        "total_available_kwh": round(energy_market["total_available_kwh"], 2),
        "sellers_active": energy_market["sellers_active"],
        "buyers_active": energy_market["buyers_active"],
        "last_trade_price": energy_market["last_trade_price"],
        "price_trend": energy_market["price_trend"],
        "last_updated": energy_market["last_updated"],
    }


# ─── Wallet ─────────────────────────────────────────────────

@router.get("/wallet/{user_id}")
async def get_wallet(user_id: str):
    """GET /api/wallet/{user_id} — Energy wallet with credits and transactions."""
    wallet = get_or_create_wallet(user_id)

    # Fetch user-specific transactions
    txns = [t for t in energy_transactions if t.get("buyer_user_id") == user_id or t.get("seller_user_id") == user_id]
    txns_sorted = sorted(txns, key=lambda t: t["timestamp"], reverse=True)

    # Build ledger rows compatible with energy-wallet.html
    ledger = []
    for t in txns_sorted:
        is_buyer = t.get("buyer_user_id") == user_id
        ledger.append({
            "transaction_id": t["transaction_id"],
            "type": "market_buy" if is_buyer else "market_sell",
            "units": t["energy_kwh"] if is_buyer else -t["energy_kwh"],
            "price_per_kwh": t["price_per_kwh"],
            "total_price": t["total_price"],
            "timestamp": t["timestamp"],
            "description": f"Market {'purchase' if is_buyer else 'sale'} @ ₹{t['price_per_kwh']}/kWh",
        })

    # Also pull from the existing energy_wallet transactions (solar allocations etc.)
    from database import energy_wallet_db, energy_transactions_db
    existing_txns = energy_transactions_db.get(user_id, [])
    for t in existing_txns:
        ledger.append({
            "transaction_id": t.get("id", ""),
            "type": t.get("type", "solar_allocation"),
            "units": t.get("units", 0),
            "timestamp": t.get("timestamp", ""),
            "description": t.get("description", ""),
        })

    ledger.sort(key=lambda t: t.get("timestamp", ""), reverse=True)

    wallet_data = energy_wallet_db.get(user_id, {})
    return {
        "user_id": user_id,
        "credit_balance_kwh": wallet["balance"],
        "credits_available": wallet["balance"] + wallet_data.get("credits_available", 0),
        "credits_used": wallet_data.get("credits_used", 0),
        "credits_expiring": wallet_data.get("credits_expiring", 0),
        "expiry_date": wallet_data.get("expiry_date", ""),
        "transactions": ledger[:30],  # Return latest 30
    }


# ─── Buy Energy ─────────────────────────────────────────────

@router.post("/marketplace/buy")
async def buy_energy(body: BuyRequest):
    """POST /api/marketplace/buy — Purchase energy credits from the market pool."""
    if body.energy_kwh <= 0:
        raise HTTPException(status_code=400, detail="Energy amount must be positive")

    available = energy_market["total_available_kwh"]
    if body.energy_kwh > available:
        raise HTTPException(
            status_code=400,
            detail=f"Only {available:.1f} kWh available in the market pool"
        )

    price = energy_market["market_price_per_kwh"]
    total_cost = round(body.energy_kwh * price, 2)

    # Update market pool
    energy_market["total_available_kwh"] = round(available - body.energy_kwh, 2)
    energy_market["buyers_active"] += 1
    energy_market["last_updated"] = datetime.now().isoformat()

    # Update buyer wallet
    wallet = get_or_create_wallet(body.user_id)
    wallet["balance"] = round(wallet["balance"] + body.energy_kwh, 2)

    # Record transaction
    txn = add_market_transaction(
        buyer_user_id=body.user_id,
        seller_user_id="market_pool",
        energy_kwh=body.energy_kwh,
        price_per_kwh=price,
    )

    return {
        "success": True,
        "transaction_id": txn["transaction_id"],
        "energy_kwh": body.energy_kwh,
        "price_per_kwh": price,
        "total_cost": total_cost,
        "new_balance_kwh": wallet["balance"],
        "message": f"Purchased {body.energy_kwh} kWh for ₹{total_cost}",
    }


# ─── Sell Energy ─────────────────────────────────────────────

@router.post("/marketplace/sell")
async def sell_energy(body: SellRequest):
    """POST /api/marketplace/sell — List user's credits for sale on the market."""
    if body.energy_kwh <= 0:
        raise HTTPException(status_code=400, detail="Energy amount must be positive")

    wallet = get_or_create_wallet(body.user_id)
    if body.energy_kwh > wallet["balance"]:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient solar credits. You have {wallet['balance']:.1f} kWh available."
        )

    price = energy_market["market_price_per_kwh"]
    gross_earnings = round(body.energy_kwh * price, 2)
    platform_fee = round(gross_earnings * 0.02, 2)   # 2% platform fee
    net_earnings = round(gross_earnings - platform_fee, 2)

    # Deduct from seller wallet
    wallet["balance"] = round(wallet["balance"] - body.energy_kwh, 2)

    # Add to market pool
    energy_market["total_available_kwh"] = round(energy_market["total_available_kwh"] + body.energy_kwh, 2)
    energy_market["sellers_active"] += 1
    energy_market["last_updated"] = datetime.now().isoformat()

    # Record transaction
    txn = add_market_transaction(
        buyer_user_id="market_pool",
        seller_user_id=body.user_id,
        energy_kwh=body.energy_kwh,
        price_per_kwh=price,
    )

    return {
        "success": True,
        "transaction_id": txn["transaction_id"],
        "energy_kwh": body.energy_kwh,
        "price_per_kwh": price,
        "gross_earnings": gross_earnings,
        "platform_fee": platform_fee,
        "net_earnings": net_earnings,
        "updated_wallet_balance": wallet["balance"],
        "message": f"Listed {body.energy_kwh} kWh. Earnings: ₹{net_earnings} (after 2% fee)",
    }


# ─── Transaction History ─────────────────────────────────────

@router.get("/marketplace/history/{user_id}")
async def get_marketplace_history(user_id: str):
    """GET /api/marketplace/history/{user_id} — All marketplace transactions for a user."""
    user_txns = [
        t for t in energy_transactions
        if t.get("buyer_user_id") == user_id or t.get("seller_user_id") == user_id
    ]
    result = []
    for t in sorted(user_txns, key=lambda x: x["timestamp"], reverse=True):
        is_buy = t.get("buyer_user_id") == user_id
        result.append({
            "transaction_id": t["transaction_id"],
            "energy_kwh": t["energy_kwh"],
            "price_per_kwh": t["price_per_kwh"],
            "total_price": t["total_price"],
            "type": "buy" if is_buy else "sell",
            "date": t["timestamp"][:10],
            "timestamp": t["timestamp"],
        })
    return result


# ─── Company Overview ─────────────────────────────────────────

@router.get("/marketplace/overview")
async def get_marketplace_overview():
    """GET /api/marketplace/overview — Energy company-level marketplace analytics."""
    total_traded = sum(t["energy_kwh"] for t in energy_transactions)
    total_value = sum(t["total_price"] for t in energy_transactions)
    buy_txns = [t for t in energy_transactions if t.get("buyer_user_id") != "market_pool"]
    sell_txns = [t for t in energy_transactions if t.get("seller_user_id") != "market_pool"]
    return {
        "market_price_per_kwh": energy_market["market_price_per_kwh"],
        "total_available_kwh": round(energy_market["total_available_kwh"], 2),
        "total_credits_traded_kwh": round(total_traded, 2),
        "total_trade_value_inr": round(total_value, 2),
        "buy_transactions": len(buy_txns),
        "sell_transactions": len(sell_txns),
        "active_sellers": energy_market["sellers_active"],
        "active_buyers": energy_market["buyers_active"],
        "last_updated": energy_market["last_updated"],
    }
