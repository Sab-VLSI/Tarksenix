from fastapi import FastAPI, HTTPException, APIRouter, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr
import os

# Import internal modules
from database import (
    users_db, create_user, get_user, add_service_request,
    get_homeowner_summary, get_homeowner_alerts, get_vendor_alerts,
    get_vendor_summary, get_vendor_orders, get_vendor_services, get_vendor_revenue,
    get_company_grid_summary, get_homeowner_profile, get_usage_data,
    get_virtual_solar, company_clusters, company_tariffs, service_requests,
    update_user_profile, get_user_profile,
    get_energy_usage_for_user, get_iot_energy,
    get_subscription_plans, activate_subscription,
    get_billing, get_wallet, get_vsp_subscription,
    run_grid_optimization, get_company_grid_optimization,
)
from routes import wallet as wallet_router
from routes import vsp as vsp_router
from routes import billing as billing_router
from routes import grid as grid_router
from routes import subscriptions as subscriptions_router
from routes import service as service_router
from routes import marketplace as marketplace_router
from routes import company as company_router
from routes import payment as payment_router

app = FastAPI(title="EnergyNest API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================
# Register Routers
# =====================
app.include_router(wallet_router.router, prefix="/api", tags=["Wallet"])
app.include_router(vsp_router.router, prefix="/api", tags=["VSP"])
app.include_router(billing_router.router, prefix="/api", tags=["Billing"])
app.include_router(grid_router.router, prefix="/api", tags=["Grid"])
app.include_router(subscriptions_router.router, prefix="/api", tags=["Subscriptions"])
app.include_router(service_router.router, prefix="/api", tags=["Service"])
app.include_router(marketplace_router.router, prefix="/api", tags=["Marketplace"])
app.include_router(company_router.router, prefix="/api", tags=["Company"])
app.include_router(payment_router.router, prefix="/api", tags=["Payment"])

# =====================
# Auth Routes
# =====================

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/auth/login")
async def login(req: LoginRequest):
    user = get_user(req.email)
    if not user or user["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {
        "message": "Login successful",
        "user_id": user.get("user_id", user["email"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "state": user.get("state", user.get("location", "")),
    }

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    location: Optional[str] = ""
    houseType: Optional[str] = ""
    capacity: Optional[str] = ""

@app.post("/auth/signup")
async def signup(req: SignupRequest):
    if get_user(req.email):
        raise HTTPException(status_code=400, detail="User already exists")
    user = create_user(
        name=req.name,
        email=req.email,
        password=req.password,
        role=req.role,
        location=req.location,
        houseType=req.houseType,
        capacity=req.capacity
    )
    return {"message": "User registered successfully", "email": user["email"]}

# =====================
# Homeowner Routes
# =====================

@app.get("/homeowner/summary")
async def homeowner_dashboard(email: str):
    return get_homeowner_summary(email)

@app.get("/homeowner/alerts")
async def homeowner_alerts(email: str):
    return get_homeowner_alerts(email)

@app.post("/homeowner/service-request")
async def create_service_request(request: dict):
    return add_service_request(request)

@app.post("/homeowner/profile/update")
async def update_profile(data: dict = Body(...)):
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    try:
        updated_user = update_user_profile(email, data)
        return {"message": "Profile updated successfully", "user": updated_user}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/homeowner/energy/usage")
async def get_energy_usage_period(period: str = "daily"):
    return get_usage_data(period)

# New canonical endpoint — used by dashboard-home.html
@app.get("/api/energy/usage/{user_id}")
async def get_energy_usage(user_id: str):
    return get_energy_usage_for_user(user_id)

@app.get("/api/iot/energy/{user_id}")
async def get_iot_energy_data(user_id: str):
    return get_iot_energy(user_id)

@app.get("/homeowner/solar/virtual")
async def get_solar_stats(email: str):
    return get_virtual_solar(email)

# =====================
# Vendor Routes
# =====================

@app.get("/vendor/dashboard")
async def vendor_dashboard(email: str):
    return get_vendor_summary(email)

@app.get("/vendor/alerts")
async def vendor_alerts(email: str):
    return get_vendor_alerts(email)

@app.get("/vendor/orders")
async def vendor_orders_list(email: str):
    return get_vendor_orders(email)

@app.get("/vendor/revenue")
async def vendor_revenue(email: str):
    return get_vendor_revenue(email)

# New canonical endpoints — /api/vendor/
@app.get("/api/vendor/orders/{vendor_id}")
async def api_vendor_orders(vendor_id: str):
    return get_vendor_orders(vendor_id)

@app.get("/api/vendor/services/{vendor_id}")
async def api_vendor_services(vendor_id: str):
    return get_vendor_services(vendor_id)

@app.get("/api/vendor/revenue/{vendor_id}")
async def api_vendor_revenue(vendor_id: str):
    return get_vendor_revenue(vendor_id)

@app.post("/vendor/profile/update")
async def update_vendor_profile_route(data: dict = Body(...)):
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    try:
        updated_user = update_user_profile(email, data)
        return {"message": "Profile updated successfully", "user": updated_user}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# =====================
# Company Routes
# =====================

@app.get("/company/dashboard")
async def company_dashboard():
    return get_company_grid_summary()

@app.get("/company/grid/clusters")
async def get_grid_clusters():
    return company_clusters


@app.get("/api/company/plants")
async def get_company_plants():
    from database import solar_plants_db
    return list(solar_plants_db.values())

@app.post("/company/profile/update")
async def update_company_profile_route(data: dict = Body(...)):
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    try:
        updated_user = update_user_profile(email, data)
        return {"message": "Profile updated successfully", "user": updated_user}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# =====================
# Serve Frontend Files
# =====================

# Get the directory of the current script
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
frontend_dir = os.path.join(base_dir, "frontend", "src")

# Mount components
app.mount("/components", StaticFiles(directory=os.path.join(frontend_dir, "components")), name="components")

# Mount pages subdirectories
app.mount("/pages/shared", StaticFiles(directory=os.path.join(frontend_dir, "pages", "shared"), html=True), name="shared_pages")
app.mount("/pages/homeowner", StaticFiles(directory=os.path.join(frontend_dir, "pages", "homeowner"), html=True), name="homeowner_pages")
app.mount("/pages/vendor", StaticFiles(directory=os.path.join(frontend_dir, "pages", "vendor"), html=True), name="vendor_pages")
app.mount("/pages/company", StaticFiles(directory=os.path.join(frontend_dir, "pages", "company"), html=True), name="company_pages")

# Mount the root to the shared pages (so / goes to index.html if possible)
app.mount("/", StaticFiles(directory=os.path.join(frontend_dir, "pages", "shared"), html=True), name="root_pages")

# =====================
# Main Execution
# =====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
