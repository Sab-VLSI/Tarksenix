"""
Service Request Route — EnergyNest
Handles homeowner service requests and vendor service management.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from database import (
    add_service_request, get_vendor_services, service_requests,
    vendor_orders, vendor_profiles, generate_id
)

router = APIRouter()


class ServiceRequestBody(BaseModel):
    user_id: str            # homeowner email
    service_type: str       # e.g. "Maintenance", "Repair", "Installation"
    description: str
    location: str
    preferred_time: Optional[str] = ""
    customer_name: Optional[str] = "Homeowner"


class ServiceStatusUpdate(BaseModel):
    request_id: str
    vendor_id: str          # vendor's email
    action: str             # "accept", "schedule", "complete"
    scheduled_time: Optional[str] = ""


@router.post("/service/request")
async def create_service_request(body: ServiceRequestBody):
    """
    POST /api/service/request
    Creates a homeowner service request and auto-matches a vendor.
    """
    try:
        request_data = {
            "id": generate_id("SR"),
            "user_id": body.user_id,
            "customer_name": body.customer_name,
            "email": body.user_id,
            "service_type": body.service_type,
            "description": body.description,
            "location": body.location,
            "preferred_time": body.preferred_time,
            "status": "Requested",
            "request_date": datetime.now().strftime("%Y-%m-%d"),
            "timestamp": datetime.now().isoformat(),
        }
        result = add_service_request(request_data)
        return {
            "message": "Service request submitted successfully",
            "request_id": result["id"],
            "status": result["status"],
            "assigned_vendor": result.get("assigned_vendor", None),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/service/requests/{user_id}")
async def get_user_service_requests(user_id: str):
    """GET /api/service/requests/{user_id} — All service requests by a homeowner."""
    user_requests = [r for r in service_requests if r.get("user_id") == user_id or r.get("email") == user_id]
    return user_requests


@router.get("/vendor/services/{vendor_id}")
async def get_vendor_service_requests(vendor_id: str):
    """GET /api/vendor/services/{vendor_id} — All service requests assigned to this vendor."""
    assigned = [r for r in service_requests if r.get("assigned_vendor") == vendor_id]
    vendor_order_list = vendor_orders.get(vendor_id, [])
    # Merge for full context
    return {
        "assigned_requests": assigned,
        "orders": vendor_order_list,
        "total": len(assigned) + len(vendor_order_list),
    }


@router.post("/vendor/service/update")
async def update_service_status(body: ServiceStatusUpdate):
    """
    POST /api/vendor/service/update
    Vendor accepts, schedules, or completes a service request.
    """
    # Find in service_requests
    for req in service_requests:
        if req.get("id") == body.request_id:
            if body.action == "accept":
                req["status"] = "Accepted"
                req["assigned_vendor"] = body.vendor_id
            elif body.action == "schedule":
                req["status"] = "Scheduled"
                req["scheduled_time"] = body.scheduled_time
            elif body.action == "complete":
                req["status"] = "Completed"
            return {"message": f"Request {body.request_id} updated to '{req['status']}'", "request": req}

    # Find in vendor orders
    for order in vendor_orders.get(body.vendor_id, []):
        if order.get("id") == body.request_id:
            if body.action == "accept":
                order["status"] = "Active"
            elif body.action == "schedule":
                order["status"] = "Scheduled"
                order["scheduled_time"] = body.scheduled_time
            elif body.action == "complete":
                order["status"] = "Completed"
                order["progress"] = 100
            return {"message": f"Order {body.request_id} updated to '{order['status']}'", "order": order}

    raise HTTPException(status_code=404, detail="Service request or order not found")


@router.get("/service/types")
async def get_service_types():
    """GET /api/service/types — Available service types."""
    return [
        {"id": "maintenance", "label": "Routine Maintenance", "description": "Scheduled checkup and cleaning"},
        {"id": "repair", "label": "Repair", "description": "Fix a malfunctioning component"},
        {"id": "installation", "label": "New Installation", "description": "Install new EaaS equipment"},
        {"id": "inspection", "label": "System Inspection", "description": "Full system health audit"},
        {"id": "meter", "label": "Smart Meter Setup", "description": "Connect IoT smart meter"},
        {"id": "billing", "label": "Billing Query", "description": "Resolve billing or credit issues"},
    ]
