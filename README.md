# ⚡ Tarksenix — Smart Intelli Energy Suite

> A **digital Energy-as-a-Service (EaaS) platform** that transforms solar energy from a **CAPEX product into an OPEX subscription service.**

Smart Intelli Energy Suite connects **customers, solar vendors, and energy providers** through a unified platform while enabling **real-time electricity monitoring using IoT devices**.

Users can:

✔ Analyze electricity usage  
✔ Receive **AI-based personalized solar plans**  
✔ Choose vendors from a marketplace  
✔ Subscribe to solar energy within **5 minutes**

---

# 🌍 Problem

Solar adoption is still difficult for many users due to:

⚠ **High upfront installation costs (CAPEX)**  
⚠ Limited rooftop access for **apartments, PGs, and commercial spaces**  
⚠ Lack of **real-time energy monitoring**  
⚠ Difficulty finding **trusted solar vendors**

As a result, millions of potential users cannot benefit from renewable energy.

---

# 🚀 Our Solution

Smart Intelli Energy Suite converts solar energy into a **subscription-based service**.

Instead of purchasing expensive solar infrastructure, users can simply **subscribe to solar plans through the application.**

### Key Capabilities

⚡ AI-generated solar plans  
⚡ Vendor marketplace  
⚡ IoT-based energy monitoring  
⚡ Smart billing insights  
⚡ Energy optimization strategies

---

# 🧠 Key Features

## ⚡ Energy Monitoring Dashboard

Users can track energy flows in real time:

• Solar power generation  
• Grid electricity usage  
• Household energy consumption  
• Battery storage levels  

Data is collected through an **ESP32-based IoT monitoring node**.

---

## 🤖 AI-Based Solar Plan Recommendation

The platform analyzes:

✔ User electricity consumption  
✔ State electricity slab rates  
✔ Solar generation potential  
✔ Vendor installation costs  

Using this data, the system generates **personalized solar subscription plans**.

---

## 🏪 Vendor Marketplace

Solar vendors can register their services including:

• Solar installation  
• Battery systems  
• Maintenance services  

Users can compare vendors based on:

✔ Pricing  
✔ Service quality  
✔ Response time

This creates a **transparent ecosystem connecting vendors and customers**.

---

## 💰 ROI Optimization

The platform calculates **Return on Investment (ROI)** for vendors based on regional electricity economics.

ROI varies by:

• State electricity tariffs  
• Customer category (Residential / PG / Commercial)

Example insights:

📍 **Tamil Nadu** → Higher ROI for **PG & commercial installations**  
📍 **Delhi & Karnataka** → Higher ROI for **residential installations**

This ensures solar adoption remains **economically sustainable**.

---

# 🔌 IoT Energy Monitoring System

The hardware prototype includes:

✔ ESP32 microcontroller  
✔ ACS712 current sensors  
✔ Battery voltage monitoring  
✔ Smart relay switching system

The system automatically:

⚡ Stops battery charging at **90%**  
⚡ Switches to grid power when battery drops below **15%**

This helps extend **battery lifespan and ensures uninterrupted power**.

---

## 🧩 Project Architecture

```
Smart Intelli Energy Suite

Frontend
├── React + Vite
├── TailwindCSS
├── Dashboard UI
├── Vendor Marketplace
├── Solar Plan Interface
├── Billing Analyzer
└── Service Requests

Backend
├── FastAPI
├── Billing System
├── Vendor Management
├── Grid Monitoring
├── Subscription Plans
├── Wallet System
└── Payment Integration

IoT Layer
├── ESP32 Energy Controller
├── Solar Current Sensors
├── Grid Monitoring Sensors
├── Battery Monitoring
└── Smart Power Switching
```

---

# ⚙️ Technology Stack

### Frontend
- React
- TypeScript
- Vite
- TailwindCSS
- React Router

### Backend
- Python
- FastAPI
- REST APIs

### Hardware
- ESP32
- ACS712 Current Sensors
- Battery Voltage Divider
- Smart Relay Switching

---

# 📊 Business Model

The platform operates on an **Energy-as-a-Service (EaaS)** model.

Instead of buying solar infrastructure:

Users subscribe to **solar energy capacity plans**.

Revenue streams include:

• Subscription plans  
• Vendor service fees  
• Installation partnerships  
• Platform analytics services  

Vendor investments are typically recovered within **3-5 years**.

---

# 🔮 Future Roadmap

### 🗺 Vendor Map Interface
Interactive map showing **nearby solar vendors and installations**.

### 🏠 AI Rooftop Analysis
Satellite-based rooftop analysis to estimate:

• Rooftop size  
• Solar capacity potential  
• Installation feasibility

---

# ⚠ Prototype Note

The data currently shown in the application is **simulation data**.

Once the IoT hardware is fully integrated with the cloud system, the platform will display **real-time energy data from sensors**.

---

# 🌱 Vision

Our mission is simple:

> **Make clean energy as easy to access as subscribing to the internet.**

---

# 👨‍💻 Team

Developed for the **Energy & Sustainability Hardware Hackathon**

Team Members

• **Sabari Saravanan T S**  
• **Tharun Pranav S R**  
• **Ashwin R**  
• **Ravina S**

---
