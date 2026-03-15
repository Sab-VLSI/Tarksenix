from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import razorpay
import os
import hmac
import hashlib
from database import payments_db, subscriptions_db, generate_id
from datetime import datetime

router = APIRouter()

from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

# Initialize Razorpay Client
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_YourTestKeyId")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "YourTestKeySecret")

try:
    client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
except Exception as e:
    client = None
    print(f"Warning: Failed to initialize Razorpay client: {e}")

class OrderRequest(BaseModel):
    amount: float
    user_id: str
    purpose: str = "general" # 'installation', 'subscription', 'bill'

@router.post("/payment/create-order")
async def create_order(req: OrderRequest):
    if not client:
        raise HTTPException(status_code=500, detail="Razorpay client is not initialized. Please configure valid API keys.")

    amount_in_paise = int(req.amount * 100)
    data = {
        "amount": amount_in_paise,
        "currency": "INR",
        "receipt": f"receipt_{generate_id()[0:8]}"
    }

    try:
        # Create a real order using Razorpay SDK
        payment = client.order.create(data=data)
        
        # Include the public key ID so the frontend can initialize Razorpay Checkout dynamically
        payment["key_id"] = RAZORPAY_KEY_ID 
        
        return payment
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class VerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    user_id: str
    amount: float
    purpose: str = "general"

@router.post("/payment/verify")
async def verify_payment(req: VerifyRequest):
    
    # Store payment record in our mock database
    payment_record = {
        "payment_id": req.razorpay_payment_id,
        "order_id": req.razorpay_order_id,
        "user_id": req.user_id,
        "amount": req.amount,
        "status": "failed",
        "purpose": req.purpose,
        "created_at": datetime.now().isoformat()
    }
    
    if not client:
        payment_record["status"] = "failed"
        payments_db.append(payment_record)
        raise HTTPException(status_code=500, detail="Razorpay client is not initialized.")

    # Actual Verification Logic
    try:
        # Create signature string
        msg = f"{req.razorpay_order_id}|{req.razorpay_payment_id}"
        
        # Calculate expected signature
        generated_signature = hmac.new(
            RAZORPAY_KEY_SECRET.encode('utf-8'),
            msg.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        if generated_signature == req.razorpay_signature:
            payment_record["status"] = "success"
            payments_db.append(payment_record)
            return {"status": "success"}
        else:
            payments_db.append(payment_record)
            return {"status": "failed", "message": "Signature mismatch"}
            
    except Exception as e:
        payments_db.append(payment_record)
        raise HTTPException(status_code=400, detail=str(e))
