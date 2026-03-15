from pydantic import BaseModel, EmailStr
from typing import Optional, List

# Authentication Models
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str

class UserResponse(BaseModel):
    email: EmailStr
    role: str
    name: str
    message: str

class UserProfileDetail(BaseModel):
    email: EmailStr
    phone: str
    address: str
    two_factor_enabled: bool
    data_sharing_consent: bool
    privacy_policy_version: str = "IN-2024-V1"

# Homeowner Dashboard Models
class EnergySummary(BaseModel):
    solarGeneration: float
    gridConsumption: float
    batteryStatus: int
    monthlySavings: float
    solarChange: float
    gridChange: float
    savingsChange: float

class UsagePoint(BaseModel):
    label: str
    value: str
    height: str
    active: bool = False

class ApplianceUsage(BaseModel):
    name: str
    usage: float
    percentage: int
    icon: str

class AIRecommendationRequest(BaseModel):
    appliances: List[dict]

class AIRecommendationResponse(BaseModel):
    planName: str
    estimatedMonthlyUnits: int
    estimatedMonthlySavings: float
    solarCoverage: int
    solarUnits: int
    gridUnits: int

# Virtual Solar Models
class SubscriptionDetails(BaseModel):
    capacity: str
    monthly_units: int
    share: float
    status: str

class PlantDetails(BaseModel):
    size: str
    location: str
    members: int
    total_gen: int
    capacity: str = "500 kW"

class VirtualSolarResponse(BaseModel):
    plant: PlantDetails
    user: SubscriptionDetails

# Alert Model
class Alert(BaseModel):
    id: int
    type: str # warning, success, info
    title: str
    message: str
    time: str
    read: bool

class ProfileStats(BaseModel):
    member_since_days: int
    total_savings: float
    total_generated_kwh: float
    plan_name: str
    plan_price: float
    next_billing: str

# Vendor Models
class InstallationRequest(BaseModel):
    id: str
    email: EmailStr
    customer_name: str
    location: str
    system_size: Optional[str] = None # Optional for service only requests
    service_type: str = "Installation" # Installation, Maintenance, Repair, Cleaning
    description: Optional[str] = None
    status: str = "Requested" # Requested, Matching, Assigned, Installation, Completed
    request_date: str
    priority: str = "Medium"
    scheduled_date: Optional[str] = None
    date_status: Optional[str] = None # Proposed, Confirmed, Rejected
    preferred_date: Optional[str] = None
    assigned_vendor: Optional[EmailStr] = None

class VendorOrder(BaseModel):
    id: str
    title: str
    type: str # e.g. "Solar Installation"
    customer: str
    location: str
    status: str # Shortlisted, Active, Completed
    priority: str
    details: str
    progress: Optional[int] = 0
    system_size: Optional[str] = None
    customer_email: Optional[EmailStr] = None

class VendorAsset(BaseModel):
    id: str
    name: str
    category: str
    stock: int
    status: str
    location: str

class Payout(BaseModel):
    date: str
    amount: float
    status: str

class VendorRevenue(BaseModel):
    monthly_income: float
    active_orders: int
    completed_orders: int
    payouts: List[Payout]

class VendorSummary(BaseModel):
    eligible_requests: int
    active_orders: int
    total_assets: int
    monthly_revenue: float

class VendorProfileUpdate(BaseModel):
    businessName: str
    taxId: str
    phone: str
    address: str
    serviceAreas: Optional[List[str]] = None

class Certification(BaseModel):
    id: Optional[str] = None
    name: str
    uploadDate: Optional[str] = None
    fileName: Optional[str] = None
# Energy Company Models
class ClusterMetric(BaseModel):
    label: str
    value: str
    percentage: Optional[float] = None

class EnergyCluster(BaseModel):
    id: str
    name: str
    homes: int
    capacity: str
    output: str
    status: str # active, moderate, low
    progress: int

class TariffPolicy(BaseModel):
    residential_rate: float
    commercial_rate: float
    fit_rate: float

class CompanyGridSummary(BaseModel):
    total_vendors: int
    active_assets: int
    utilization_percent: int
    renewable_percent: int
    total_demand: float
    total_supply: float
    grid_balance: float
