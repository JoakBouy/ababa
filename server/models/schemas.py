from typing import Optional
from pydantic import BaseModel, EmailStr


# ─── Auth ────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    email: str
    name: str
    role: str


# ─── Terminals ───────────────────────────────────────────────────────────────

class Terminal(BaseModel):
    id: str
    account_id: str
    account_email: str
    loc: str
    coords: tuple[float, float]
    status: str  # ONLINE | OFFLINE | DEGRADED
    data_usage_gb: float
    latency_ms: Optional[float]
    connected_devices: int
    uptime_percent: float


class TerminalTelemetry(BaseModel):
    latency_ms: float
    download_mbps: float
    signal_percent: float
    uptime: str
    sw_version: str
    errors: int
    warnings: int
    location_type: str
    location_value: str
    lat: float
    lng: float


class WifiConfig(BaseModel):
    ssid: str
    hide_ssid: bool
    bypass_mode: bool
    connected_clients: int


class WifiConfigUpdate(BaseModel):
    ssid: Optional[str] = None
    password: Optional[str] = None
    hide_ssid: Optional[bool] = None
    bypass_mode: Optional[bool] = None


class DishConfig(BaseModel):
    snow_melt_mode: str  # auto | on | off
    power_saving: bool


class DishConfigUpdate(BaseModel):
    snow_melt_mode: Optional[str] = None
    power_saving: Optional[bool] = None


class ActionResponse(BaseModel):
    message: str


# ─── Analytics ───────────────────────────────────────────────────────────────

class FleetStats(BaseModel):
    total: int
    online: int
    offline: int
    degraded: int
    total_data_tb: float
    avg_uptime_percent: float


# ─── Starlink Accounts ───────────────────────────────────────────────────────

class StarlinkAccount(BaseModel):
    id: int
    email: str
    status: str
    terminal_count: int


class LinkAccountRequest(BaseModel):
    email: str
    # In mock mode: password is used (ignored for real calls).
    # In remote mode: cookie_json is the raw JSON exported from the browser.
    password: Optional[str] = None
    cookie_json: Optional[str] = None
