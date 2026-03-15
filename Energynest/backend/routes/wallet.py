"""
Energy Wallet Route — EnergyNest
Handles virtual net metering / energy credit wallet for homeowners.
"""
from fastapi import APIRouter, HTTPException
from database import get_wallet, get_transactions, energy_wallet_db, energy_transactions_db, _default_wallet, _default_transactions

router = APIRouter()


@router.get("/wallet/{user_id}")
async def get_energy_wallet(user_id: str):
    """
    GET /api/wallet/{user_id}
    Returns wallet credits, used, expiring, and full transaction ledger.
    user_id is treated as the user's email address.
    """
    try:
        wallet = get_wallet(user_id)
        return wallet
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/wallet/{user_id}/transactions")
async def get_wallet_transactions(user_id: str):
    """
    GET /api/wallet/{user_id}/transactions
    Returns only the transaction ledger.
    """
    try:
        return get_transactions(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
