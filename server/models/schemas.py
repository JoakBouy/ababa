from typing import Any, Optional
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
    account_type: str = "operations"  # ranger | community | base_camp | operations
    site_id: Optional[str] = None
    site_type: str = "operations"
    loc: str
    coords: tuple[float, float]
    status: str  # ONLINE | OFFLINE | DEGRADED
    data_usage_gb: float
    latency_ms: Optional[float]
    download_mbps: Optional[float] = None
    connected_devices: Optional[int]
    uptime_percent: float
    data_sources: list[str] = []
    community_usage_sessions: Optional[int] = None
    ranger_voice_sessions: Optional[int] = None
    bluetti_soc_percent: Optional[float] = None


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
    current_download_mbps: float = 0.0
    avg_uptime_percent: float


# ─── Platform Sites & Accounts ───────────────────────────────────────────────

class StarlinkAccount(BaseModel):
    id: int
    email: str
    status: str
    terminal_count: int
    account_type: str = "operations"
    display_name: Optional[str] = None


class DeploymentSite(BaseModel):
    id: str
    name: str
    account_email: str
    account_type: str
    site_type: str
    purpose: str
    loc: str
    coords: tuple[float, float]
    terminal_ids: list[str]
    data_sources: list[str]
    metrics: dict[str, Any]


class ExportManifest(BaseModel):
    formats: list[str]
    endpoints: dict[str, str]
    openapi_json: str
    swagger_docs: str
    redoc_docs: str


class FleetSnapshotResponse(BaseModel):
    accounts: list[StarlinkAccount]
    terminals: list[Terminal]
    fleet_stats: FleetStats


class LinkAccountRequest(BaseModel):
    email: str
    # In mock mode: password is used (ignored for real calls).
    # In remote mode: cookie_json is the raw JSON exported from the browser.
    password: Optional[str] = None
    cookie_json: Optional[str] = None
