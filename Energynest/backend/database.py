"""
In-Memory Database — EnergyNest
Stores users, service requests, vendor data, company data, and EaaS collections.
Collections simulate: users, subscriptions, solar_plants, energy_usage,
vendor_orders, billing_records, energy_wallet, energy_transactions, grid_optimization_logs
"""

from datetime import datetime, timedelta
import random
import string
import json
import os

# =====================
# User Store
# =====================
DB_FILE = os.path.join(os.path.dirname(__file__), "users.json")
users_db: dict = {}   # email -> {name, email, password, role, ...}

# =====================
# Service Requests Store
# =====================
service_requests: list = []

# =====================
# Vendor Data Stores
# =====================
vendor_orders: dict = {}
vendor_assets: dict = {}
vendor_profiles: dict = {}
vendor_certifications: dict = {}

# =====================
# Company Data
# =====================
company_clusters: list = [
    {"id": "CL-001", "name": "Cluster-001", "homes": 0, "capacity": "0 MW", "output": "0 MW", "status": "active", "progress": 0},
    {"id": "CL-002", "name": "Cluster-002", "homes": 0, "capacity": "0 MW", "output": "0 MW", "status": "active", "progress": 0},
]

company_tariffs: dict = {
    "residential_rate": 6.5,
    "commercial_rate": 9.0,
    "fit_rate": 3.0,
    "peak_rate": 8.5,
    "off_peak_rate": 4.5,
    "tou_enabled": True,
    "net_metering": True,
    "last_updated": "2026-03-02",
}

# =====================
# EaaS — Subscriptions Collection
# =====================
subscriptions_db: dict = {
    "basic": {
        "plan_id": "PLAN-BASIC",
        "plan_name": "Basic",
        "solar_capacity_kw": 1.0,
        "monthly_price": 699,
        "estimated_units": 120,
        "description": "Ideal for 1–2 BHK homes with light energy usage",
        "features": ["120 kWh clean energy/month", "Virtual Net Metering", "Mobile App Access"],
    },
    "standard": {
        "plan_id": "PLAN-STD",
        "plan_name": "Standard",
        "solar_capacity_kw": 2.0,
        "monthly_price": 1299,
        "estimated_units": 250,
        "description": "Best for 2–3 BHK homes — most popular plan",
        "features": ["250 kWh clean energy/month", "Priority Grid Support", "Energy Wallet Credits", "Monthly Bill Report"],
    },
    "premium": {
        "plan_id": "PLAN-PREM",
        "plan_name": "Premium",
        "solar_capacity_kw": 4.0,
        "monthly_price": 2199,
        "estimated_units": 480,
        "description": "For high-consumption homes, villas & offices",
        "features": ["480 kWh clean energy/month", "Smart Grid Load Balancing", "Battery Optimization", "Priority Support"],
    },
}

# =====================
# EaaS — Solar Plants Collection
# =====================
solar_plants_db: dict = {
    "PLANT-001": {
        "plant_id": "PLANT-001",
        "plant_name": "SmartGrid Solar Hub — Phase 1",
        "plant_capacity_kw": 10000,
        "location": "Tamil Nadu, India",
        "active_subscribers": 248,
        "monthly_generation_units": 1200000,
        "commissioned": "2025-01-15",
        "status": "active",
    },
    "PLANT-002": {
        "plant_id": "PLANT-002",
        "plant_name": "GreenEdge Solar Farm — Phase 2",
        "plant_capacity_kw": 5000,
        "location": "Karnataka, India",
        "active_subscribers": 104,
        "monthly_generation_units": 580000,
        "commissioned": "2025-06-01",
        "status": "active",
    },
}

# =====================
# EaaS — Energy Wallet Collection
# =====================
# user email -> wallet record
energy_wallet_db: dict = {}

def _default_wallet(email: str) -> dict:
    return {
        "wallet_id": f"WLT-{email[:6].upper().replace('@', 'X')}",
        "user_id": email,
        "credits_available": 185.0,
        "credits_used": 65.0,
        "credits_expiring": 20.0,
        "expiry_date": (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d"),
        "last_updated": datetime.now().strftime("%Y-%m-%d"),
    }

def _default_transactions(email: str) -> list:
    today = datetime.now()
    return [
        {"transaction_id": "TXN-001", "user_id": email, "type": "solar_allocation",
         "units": 83.0, "timestamp": (today - timedelta(days=2)).isoformat(), "description": "Monthly solar allocation"},
        {"transaction_id": "TXN-002", "user_id": email, "type": "solar_allocation",
         "units": 102.0, "timestamp": (today - timedelta(days=32)).isoformat(), "description": "Previous month allocation"},
        {"transaction_id": "TXN-003", "user_id": email, "type": "home_consumption",
         "units": -38.0, "timestamp": (today - timedelta(days=15)).isoformat(), "description": "Home appliance consumption"},
        {"transaction_id": "TXN-004", "user_id": email, "type": "home_consumption",
         "units": -27.0, "timestamp": (today - timedelta(days=8)).isoformat(), "description": "Grid offset usage"},
        {"transaction_id": "TXN-005", "user_id": email, "type": "grid_export",
         "units": 12.0, "timestamp": (today - timedelta(days=5)).isoformat(), "description": "Export to community grid"},
    ]

# =====================
# EaaS — Energy Transactions Collection
# =====================
energy_transactions_db: dict = {}  # email -> [transactions]

# =====================
# EaaS — Billing Records Collection
# =====================
billing_db: dict = {}  # email -> billing record

# =====================
# EaaS — Payments Collection
# =====================
payments_db: list = []  # List of payment transaction records

# =====================
# Marketplace Collections
# =====================

# energy_market — current pool state and pricing
energy_market: dict = {
    "market_price_per_kwh": 5.20,          # ₹ per kWh
    "total_available_kwh": 1240.5,          # total units currently listed for sale
    "sellers_active": 38,                   # number of active sellers
    "buyers_active": 21,                    # number of active buyers
    "last_trade_price": 5.15,
    "price_trend": "up",                    # "up" | "down" | "stable"
    "last_updated": datetime.now().isoformat(),
}

# energy_wallets — marketplace-specific balance per user (separate from solar allocation credits)
energy_wallets: dict = {}   # user_id -> { "balance": float }

# energy_transactions — all buy/sell records
energy_transactions: list = []

# Seed demo transactions
_today = datetime.now()
energy_transactions.extend([
    {
        "transaction_id": "MKT-001",
        "seller_user_id": "solar_gen_1@smartintelli.com",
        "buyer_user_id": "owner@smartintelli.com",
        "energy_kwh": 30.0,
        "price_per_kwh": 5.20,
        "total_price": 156.0,
        "timestamp": (_today - timedelta(days=2)).isoformat(),
    },
    {
        "transaction_id": "MKT-002",
        "seller_user_id": "owner@smartintelli.com",
        "buyer_user_id": "market_pool",
        "energy_kwh": 15.0,
        "price_per_kwh": 5.20,
        "total_price": 78.0,
        "timestamp": (_today - timedelta(days=1)).isoformat(),
    },
    {
        "transaction_id": "MKT-003",
        "seller_user_id": "solar_gen_2@smartintelli.com",
        "buyer_user_id": "owner2@smartintelli.com",
        "energy_kwh": 20.0,
        "price_per_kwh": 5.15,
        "total_price": 103.0,
        "timestamp": (_today - timedelta(hours=5)).isoformat(),
    },
])


def get_or_create_wallet(user_id: str) -> dict:
    """Get or create a marketplace energy wallet for a user."""
    if user_id not in energy_wallets:
        # Seed with some default credits
        energy_wallets[user_id] = {
            "user_id": user_id,
            "balance": 42.0,           # kWh available to trade
            "last_updated": datetime.now().isoformat(),
        }
    return energy_wallets[user_id]


def add_market_transaction(buyer_user_id: str, seller_user_id: str, energy_kwh: float, price_per_kwh: float) -> dict:
    """Record a marketplace buy or sell transaction."""
    txn_id = f"MKT-{len(energy_transactions) + 1:04d}"
    txn = {
        "transaction_id": txn_id,
        "seller_user_id": seller_user_id,
        "buyer_user_id": buyer_user_id,
        "energy_kwh": round(energy_kwh, 2),
        "price_per_kwh": price_per_kwh,
        "total_price": round(energy_kwh * price_per_kwh, 2),
        "timestamp": datetime.now().isoformat(),
    }
    energy_transactions.append(txn)
    return txn


def _default_billing(email: str) -> dict:
    user = users_db.get(email, {})
    plan_key = user.get("subscription_plan", "standard")
    plan = subscriptions_db.get(plan_key, subscriptions_db["standard"])
    tariff = company_tariffs["residential_rate"]
    total_usage = 250.0
    solar_credits = energy_wallet_db.get(email, _default_wallet(email))["credits_used"]
    grid_units = max(0, total_usage - solar_credits)
    exported = 12.0
    subscription_cost = plan["monthly_price"]
    grid_cost = grid_units * tariff
    final_bill = subscription_cost + grid_cost - (exported * company_tariffs["fit_rate"])
    return {
        "billing_id": f"BILL-{email[:4].upper()}",
        "user_id": email,
        "billing_period": datetime.now().strftime("%B %Y"),
        "total_usage_kwh": total_usage,
        "solar_units_used": solar_credits,
        "grid_units_used": round(grid_units, 2),
        "exported_units": exported,
        "tariff_per_unit": tariff,
        "subscription_cost": subscription_cost,
        "grid_cost": round(grid_cost, 2),
        "export_credit": round(exported * company_tariffs["fit_rate"], 2),
        "final_bill": round(final_bill, 2),
        "plan_name": plan["plan_name"],
        "generated_date": datetime.now().strftime("%Y-%m-%d"),
    }

# =====================
# EaaS — Grid Optimization Logs Collection
# =====================
grid_logs_db: list = []

# =====================
# Helper Functions
# =====================

def save_db():
    try:
        with open(DB_FILE, "w") as f:
            json.dump(users_db, f, indent=4)
        print(f"Database saved to {DB_FILE}")
    except Exception as e:
        print(f"Error saving database: {e}")


def load_db():
    global users_db
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r") as f:
                users_db = json.load(f)
            print(f"Database loaded from {DB_FILE}")
        except Exception as e:
            print(f"Error loading database: {e}")
            users_db = {}
    else:
        print("No database file found, starting fresh.")
        users_db = {}


# Load on module import
load_db()


def generate_id(prefix: str = "SR") -> str:
    ts = datetime.now().strftime("%H%M%S")
    rand = ''.join(random.choices(string.digits, k=3))
    return f"{prefix}-{ts}{rand}"


def get_user(email: str) -> dict | None:
    return users_db.get(email)


def create_user(name: str, email: str, password: str, role: str, **extra) -> dict:
    user_id = generate_id("USR")
    user = {
        "user_id": user_id,
        "name": name,
        "email": email,
        "password": password,
        "role": role,
        "state": extra.get("location", ""),
        "subscription_plan": "standard",
        "subscription_id": "PLAN-STD",
        "created_at": datetime.now().isoformat(),
        "profile_pic": extra.get("profile_pic", ""),
        **extra,
    }
    users_db[email] = user
    save_db()

    # Auto-create vendor profile if vendor
    if role == "vendor":
        vendor_profiles[email] = {
            "businessName": extra.get("businessName", name),
            "taxId": "",
            "phone": "",
            "address": extra.get("location", ""),
            "serviceAreas": extra.get("serviceAreas", []),
            "capacity": extra.get("capacity", "50"),
        }
        vendor_orders[email] = []
        vendor_assets[email] = []
        vendor_certifications[email] = []

    # Initialize wallet and transactions for homeowners
    if role == "homeowner":
        energy_wallet_db[email] = _default_wallet(email)
        energy_transactions_db[email] = _default_transactions(email)

    return user


def add_service_request(request_data: dict) -> dict:
    request_data.setdefault("id", generate_id("SR"))
    request_data.setdefault("status", "Requested")
    request_data.setdefault("request_date", datetime.now().strftime("%Y-%m-%d"))
    service_requests.append(request_data)
    _auto_match_vendor(request_data)
    return request_data


def _auto_match_vendor(request: dict):
    location = request.get("location", "").lower()
    for email, profile in vendor_profiles.items():
        vendor_location = profile.get("address", "").lower()
        areas = [a.lower() for a in profile.get("serviceAreas", [])]
        if location in vendor_location or vendor_location in location or any(location in a or a in location for a in areas):
            request["status"] = "Assigned"
            request["assigned_vendor"] = email
            order = {
                "id": request["id"],
                "title": f"{request.get('service_type', 'Service')} — {request.get('customer_name', 'Customer')}",
                "type": request.get("service_type", "Installation"),
                "customer": request.get("customer_name", "Customer"),
                "location": request.get("location", ""),
                "status": "Shortlisted",
                "priority": request.get("priority", "Medium"),
                "details": request.get("description", "No description"),
                "progress": 0,
                "system_size": request.get("system_size"),
                "customer_email": request.get("email"),
            }
            vendor_orders.setdefault(email, []).append(order)
            return
    request["status"] = "Matching"


# =====================
# Homeowner Functions
# =====================

def get_homeowner_summary(email: str = None) -> dict:
    return {
        "solarGeneration": 0.0,
        "gridConsumption": 0.0,
        "batteryStatus": 0,
        "monthlySavings": 0,
        "solarChange": 0.0,
        "gridChange": 0.0,
        "savingsChange": 0.0,
        "note": "Data will appear after device integration"
    }


def get_homeowner_alerts(email: str) -> list:
    return [
        {"id": 1, "type": "success", "title": "Solar Credits Received", "message": "83 kWh solar credits added to your Energy Wallet.", "time": "2 days ago", "read": False},
        {"id": 2, "type": "info", "title": "Bill Generated", "message": "Your monthly energy bill is ready to view.", "time": "1 day ago", "read": False},
        {"id": 3, "type": "warning", "title": "Credits Expiring", "message": "20 kWh credits will expire in 10 days. Use them before they lapse.", "time": "3 days ago", "read": True},
    ]


# =====================
# Energy Usage & IoT
# =====================

def get_usage_data(period: str) -> list:
    return [{"label": "N/A", "value": "0.0 kWh", "height": "0%", "active": False,
             "note": "Waiting for smart meter connection"}]


def get_energy_usage_for_user(email: str) -> dict:
    """Simulated real-time energy usage for a user."""
    return {
        "solar_usage": 0.0,
        "grid_usage": 0.0,
        "total_usage": 0.0,
        "carbon_savings_kg": 0.0,
        "estimated_monthly_bill": 0,
        "note": "No device data connected yet. Connect your smart meter to see live data."
    }


def get_iot_energy(email: str) -> dict:
    """IoT smart meter data — returns empty state if not connected."""
    return {
        "connected": False,
        "real_time_power_kw": 0.0,
        "solar_production_kw": 0.0,
        "battery_percent": 0,
        "grid_import_kw": 0.0,
        "grid_export_kw": 0.0,
        "message": "Waiting for smart meter connection"
    }


# =====================
# Virtual Solar Plant
# =====================

def get_virtual_solar(email: str) -> dict:
    user = users_db.get(email, {})
    plan_key = user.get("subscription_plan", "standard")
    plan = subscriptions_db.get(plan_key, subscriptions_db["standard"])
    plant = solar_plants_db.get("PLANT-001", {})
    return {
        "plant": {
            "plant_id": plant.get("plant_id", "PLANT-001"),
            "size": f"{plant.get('plant_capacity_kw', 10000) / 1000:.0f} MW",
            "location": plant.get("location", "Smart Grid Hub"),
            "members": plant.get("active_subscribers", 0),
            "total_gen": plant.get("monthly_generation_units", 0),
            "capacity": f"{plant.get('plant_capacity_kw', 10000) / 1000:.0f} MW",
        },
        "user": {
            "capacity": f"{plan.get('solar_capacity_kw', 2)} kW",
            "monthly_units": plan.get("estimated_units", 250),
            "share": round((plan.get("solar_capacity_kw", 2) / plant.get("plant_capacity_kw", 10000)) * 100, 4),
            "status": "Active" if user else "Inactive",
            "plan_name": plan.get("plan_name", "Standard"),
        },
        "note": f"You are subscribed to the {plan.get('plan_name', 'Standard')} plan at {plan.get('solar_capacity_kw', 2)} kW allocation."
    }


def get_vsp_subscription(email: str) -> dict:
    user = users_db.get(email, {})
    plan_key = user.get("subscription_plan", "standard")
    plan = subscriptions_db.get(plan_key, subscriptions_db["standard"])
    plant = solar_plants_db.get("PLANT-001", {})
    return {
        "plant_capacity_kw": plant.get("plant_capacity_kw", 10000),
        "plant_name": plant.get("plant_name", "SmartGrid Solar Hub"),
        "plant_location": plant.get("location", "Tamil Nadu, India"),
        "user_subscription_kw": plan.get("solar_capacity_kw", 2),
        "estimated_monthly_units": plan.get("estimated_units", 250),
        "plan_name": plan.get("plan_name", "Standard"),
        "subscription_price": plan.get("monthly_price", 1299),
        "status": "Active",
    }


# =====================
# Energy Wallet
# =====================

def get_wallet(email: str) -> dict:
    if email not in energy_wallet_db:
        energy_wallet_db[email] = _default_wallet(email)
    if email not in energy_transactions_db:
        energy_transactions_db[email] = _default_transactions(email)
    wallet = energy_wallet_db[email]
    txns = energy_transactions_db[email]
    return {
        **wallet,
        "transactions": txns,
    }


def get_transactions(email: str) -> list:
    if email not in energy_transactions_db:
        energy_transactions_db[email] = _default_transactions(email)
    return energy_transactions_db[email]


# =====================
# Billing
# =====================

def get_billing(email: str) -> dict:
    if email not in billing_db:
        # Ensure wallet is initialized
        if email not in energy_wallet_db:
            energy_wallet_db[email] = _default_wallet(email)
        billing_db[email] = _default_billing(email)
    return billing_db[email]


# =====================
# Subscription Plans
# =====================

def get_subscription_plans() -> list:
    return list(subscriptions_db.values())


def activate_subscription(email: str, plan_key: str) -> dict:
    plan_key = plan_key.lower()
    if plan_key not in subscriptions_db:
        raise ValueError(f"Plan '{plan_key}' not found")
    user = users_db.get(email)
    if not user:
        raise ValueError("User not found")
    user["subscription_plan"] = plan_key
    user["subscription_id"] = subscriptions_db[plan_key]["plan_id"]
    save_db()
    # Invalidate billing cache so it recalculates
    if email in billing_db:
        del billing_db[email]
    return {"message": f"Subscription activated: {subscriptions_db[plan_key]['plan_name']}", "plan": subscriptions_db[plan_key]}


# =====================
# Smart Grid Load Balancing
# =====================

def run_grid_optimization(email: str, solar_gen: float = 0.0, demand: float = 3.5,
                           battery_soc: float = 45.0, peak_time: bool = True) -> dict:
    threshold = 30.0
    action = ""
    if solar_gen > demand:
        action = "Charging battery from surplus solar"
        battery_after = min(100, battery_soc + ((solar_gen - demand) * 10))
    elif peak_time and battery_soc > threshold:
        action = "Using battery to meet peak demand"
        battery_after = max(0, battery_soc - 10)
    elif peak_time and battery_soc <= threshold:
        action = "Drawing from grid (battery low)"
        battery_after = battery_soc
    else:
        action = "Using solar generation directly"
        battery_after = battery_soc

    score = min(100, int(battery_soc * 0.5 + (50 if not peak_time else 20) + (solar_gen * 5)))
    log = {
        "log_id": generate_id("LOG"),
        "user_id": email,
        "timestamp": datetime.now().isoformat(),
        "solar_gen": solar_gen,
        "demand": demand,
        "battery_soc": battery_soc,
        "action": action,
        "battery_after": round(battery_after, 1),
        "peak_avoidance_score": score,
    }
    grid_logs_db.append(log)
    return {
        "peak_usage_kw": demand,
        "battery_optimization_percent": round(battery_after, 1),
        "recommended_load_shift": "Shift washing machine and EV charging to 10am–2pm (solar peak)",
        "peak_avoidance_score": score,
        "action_taken": action,
        "solar_generation_kw": solar_gen,
        "status": "Optimized",
        "timestamp": log["timestamp"],
    }


def get_company_grid_optimization() -> dict:
    total_solar = sum(p.get("monthly_generation_units", 0) for p in solar_plants_db.values())
    total_subs = sum(p.get("active_subscribers", 0) for p in solar_plants_db.values())
    return {
        "total_solar_capacity_mw": sum(p.get("plant_capacity_kw", 0) for p in solar_plants_db.values()) / 1000,
        "total_subscribers": total_subs,
        "total_energy_generated_kwh": total_solar,
        "grid_export_kwh": round(total_solar * 0.12, 0),
        "total_demand_mw": 18.4,
        "solar_generation_mw": 14.2,
        "peak_reduction_percent": 22.5,
        "renewable_contribution_percent": 61.0,
        "plants": list(solar_plants_db.values()),
        "note": "Live data requires grid integration. Showing computed estimates."
    }


# =====================
# Vendor Functions
# =====================

def get_vendor_alerts(email: str) -> list:
    orders = vendor_orders.get(email, [])
    alerts = [
        {"id": 1, "type": "info", "title": "New Service Request", "message": "A new installation request has been matched to your profile.", "time": "1 hour ago", "read": False},
        {"id": 2, "type": "success", "title": "Payment Received", "message": "Payment of ₹15,000 has been credited to your account.", "time": "1 day ago", "read": False},
    ]
    if orders:
        alerts.insert(0, {"id": 3, "type": "warning", "title": "Order Update", "message": f"You have {len(orders)} active orders requiring attention.", "time": "30 min ago", "read": False})
    return alerts


def get_vendor_summary(email: str) -> dict:
    orders = vendor_orders.get(email, [])
    assets = vendor_assets.get(email, [])
    active = [o for o in orders if o["status"] in ("Shortlisted", "Active")]
    completed = [o for o in orders if o["status"] == "Completed"]
    return {
        "eligible_requests": len(active),
        "active_orders": len(active),
        "total_assets": len(assets),
        "monthly_revenue": len(completed) * 12500 + len(active) * 5000,
        "note": "Data will appear after device integration"
    }


def get_vendor_orders(email: str) -> list:
    return vendor_orders.get(email, [])


def get_vendor_services(email: str) -> list:
    """Get all service requests matched to this vendor."""
    return [r for r in service_requests if r.get("assigned_vendor") == email]


def get_vendor_revenue(email: str) -> dict:
    orders = vendor_orders.get(email, [])
    active = [o for o in orders if o["status"] in ("Shortlisted", "Active")]
    completed = [o for o in orders if o["status"] == "Completed"]
    return {
        "monthly_income": len(completed) * 12500 + len(active) * 5000,
        "active_orders": len(active),
        "completed_orders": len(completed),
        "payouts": [
            {"date": "2026-02-01", "amount": 15000, "status": "Completed"},
            {"date": "2026-01-15", "amount": 12500, "status": "Completed"},
            {"date": "2026-01-01", "amount": 18000, "status": "Completed"},
        ],
    }


# =====================
# Company Functions
# =====================

def get_company_grid_summary() -> dict:
    return {
        "total_vendors": len(vendor_profiles),
        "connected_vendors": len(vendor_profiles),
        "active_assets": sum(len(a) for a in vendor_assets.values()),
        "capacity_utilization": 68,
        "renewable_contribution": 61,
        "total_demand": 18.4,
        "total_supply": 14.2,
        "grid_balance": -4.2,
        "note": "Analytics will appear after grid integration"
    }


# =====================
# Profile Functions
# =====================

def get_user_profile(email: str) -> dict:
    user = users_db.get(email, {})
    plan_key = user.get("subscription_plan", "standard")
    plan = subscriptions_db.get(plan_key, subscriptions_db["standard"])
    profile = {
        "email": email,
        "name": user.get("name", "User"),
        "phone": user.get("phone", ""),
        "address": user.get("location", ""),
        "profile_pic": user.get("profile_pic", ""),
        "role": user.get("role", "homeowner"),
        "state": user.get("state", user.get("location", "")),
    }
    if profile["role"] == "homeowner":
        profile.update({
            "member_since_days": 120,
            "total_savings": 3450.0,
            "total_generated_kwh": 1240.5,
            "plan_name": plan.get("plan_name", "Standard"),
            "plan_price": plan.get("monthly_price", 1299),
            "next_billing": (datetime.now() + timedelta(days=15)).strftime("%Y-%m-%d"),
        })
    elif profile["role"] == "vendor":
        v_profile = vendor_profiles.get(email, {})
        profile.update(v_profile)
    return profile


def get_homeowner_profile(email: str) -> dict:
    return get_user_profile(email)


def update_user_profile(email: str, data: dict) -> dict:
    user = users_db.get(email)
    if not user:
        raise ValueError("User not found")
    if "name" in data: user["name"] = data["name"]
    if "phone" in data: user["phone"] = data["phone"]
    if "address" in data: user["location"] = data["address"]
    user["two_factor_enabled"] = data.get("two_factor_enabled", user.get("two_factor_enabled", False))
    user["data_sharing_consent"] = data.get("data_sharing_consent", user.get("data_sharing_consent", False))
    if "profile_pic" in data:
        user["profile_pic"] = data["profile_pic"]
    save_db()
    return user


# =====================
# Service Request Helpers
# =====================

def generate_id(prefix: str = "ID") -> str:
    """Generate a unique ID like SR-001, SR-002..."""
    import random, string
    num = len([r for r in service_requests if r.get("id", "").startswith(prefix)]) + 1
    return f"{prefix}-{num:03d}"


# Seed demo service requests at startup
_DEMO_VENDORS = ["vendor@smartintelli.com", "vendor2@smartintelli.com"]

service_requests.extend([
    {
        "id": "SR-001",
        "user_id": "owner@smartintelli.com",
        "customer_name": "Rajan Kumar",
        "email": "owner@smartintelli.com",
        "service_type": "Maintenance",
        "description": "Monthly scheduled maintenance for inverter and panels.",
        "location": "Chennai, Tamil Nadu",
        "preferred_time": "Morning (8–12 AM)",
        "status": "Requested",
        "request_date": "2026-03-01",
        "timestamp": "2026-03-01T09:00:00",
        "assigned_vendor": None,
    },
    {
        "id": "SR-002",
        "user_id": "owner2@smartintelli.com",
        "customer_name": "Priya Sharma",
        "email": "owner2@smartintelli.com",
        "service_type": "Smart Meter Setup",
        "description": "Need IoT smart meter connected to the EaaS platform.",
        "location": "Coimbatore, Tamil Nadu",
        "preferred_time": "Afternoon (12–4 PM)",
        "status": "Assigned",
        "request_date": "2026-03-01",
        "timestamp": "2026-03-01T11:00:00",
        "assigned_vendor": "vendor@smartintelli.com",
    },
    {
        "id": "SR-003",
        "user_id": "owner3@smartintelli.com",
        "customer_name": "Arun Mehta",
        "email": "owner3@smartintelli.com",
        "service_type": "Repair",
        "description": "Inverter showing error code E-04 since yesterday.",
        "location": "Bangalore, Karnataka",
        "preferred_time": "Evening (4–7 PM)",
        "status": "Scheduled",
        "request_date": "2026-02-28",
        "timestamp": "2026-02-28T14:00:00",
        "assigned_vendor": "vendor@smartintelli.com",
        "scheduled_time": "2026-03-05 Morning (8–12 AM)",
    },
])


def add_service_request(request_data: dict) -> dict:
    """Add a new service request. Auto-assigns a vendor if available."""
    # Auto-assign first available vendor (simple round-robin)
    vendor_email = _DEMO_VENDORS[len(service_requests) % len(_DEMO_VENDORS)]
    request_data["assigned_vendor"] = vendor_email
    request_data["status"] = "Assigned"
    # Also push into vendor_orders for that vendor
    if vendor_email not in vendor_orders:
        vendor_orders[vendor_email] = []
    vendor_orders[vendor_email].append({
        "id": request_data["id"],
        "service_type": request_data.get("service_type", "Service"),
        "customer_name": request_data.get("customer_name", "Homeowner"),
        "customer": request_data.get("customer_name", "Homeowner"),
        "location": request_data.get("location", ""),
        "status": "Active",
        "preferred_time": request_data.get("preferred_time", "Flexible"),
        "description": request_data.get("description", ""),
        "progress": 25,
    })
    service_requests.append(request_data)
    return request_data


def get_vendor_services(vendor_id: str) -> list:
    """Get all service requests assigned to a vendor."""
    return [r for r in service_requests if r.get("assigned_vendor") == vendor_id]
