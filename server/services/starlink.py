"""
Starlink service layer.

STARLINK_MODE=mock   → returns realistic mock data (default, works without hardware)
STARLINK_MODE=local  → connects to dish at 192.168.100.1:9200 via gRPC using starlink-client
STARLINK_MODE=remote → uses authenticated Starlink cloud API via browser-extracted cookies

Switch modes via the STARLINK_MODE environment variable in your .env file.
"""
import os
import json
import random
import asyncio
import logging
from pathlib import Path
from typing import Optional

from server.models.schemas import (
    Terminal, TerminalTelemetry, WifiConfig, DishConfig, FleetStats, StarlinkAccount,
)
from server.config import settings

logger = logging.getLogger(__name__)

# ─── Mock Data ───────────────────────────────────────────────────────────────

_MOCK_TERMINALS: list[Terminal] = [
    Terminal(id="EA-JUB-001", account_id="acc-1", account_email="admin@enjojofoundation.org",
             loc="Juba Central, SS", coords=(4.85, 31.6), status="ONLINE",
             data_usage_gb=42.4, latency_ms=28, connected_devices=18, uptime_percent=99.1),
    Terminal(id="EA-KMP-014", account_id="acc-2", account_email="kenya.ops@enjojofoundation.org",
             loc="Kampala North, UG", coords=(0.34, 32.58), status="ONLINE",
             data_usage_gb=8.1, latency_ms=31, connected_devices=6, uptime_percent=98.4),
    Terminal(id="EA-JUB-009", account_id="acc-1", account_email="admin@enjojofoundation.org",
             loc="Juba A2 Outpost, SS", coords=(4.9, 31.65), status="DEGRADED",
             data_usage_gb=0.0, latency_ms=None, connected_devices=2, uptime_percent=45.0),
    Terminal(id="EA-KMP-022", account_id="acc-3", account_email="rwanda.ops@enjojofoundation.org",
             loc="Entebbe Logistics, UG", coords=(0.06, 32.44), status="ONLINE",
             data_usage_gb=112.9, latency_ms=35, connected_devices=31, uptime_percent=97.8),
    Terminal(id="EA-NBO-004", account_id="acc-1", account_email="admin@enjojofoundation.org",
             loc="Nairobi, KE", coords=(-1.29, 36.82), status="DEGRADED",
             data_usage_gb=12.4, latency_ms=120, connected_devices=4, uptime_percent=72.3),
    Terminal(id="EA-MSA-099", account_id="acc-2", account_email="kenya.ops@enjojofoundation.org",
             loc="Mombasa, KE", coords=(-4.05, 39.67), status="ONLINE",
             data_usage_gb=56.2, latency_ms=38, connected_devices=22, uptime_percent=96.5),
    Terminal(id="EA-ZNZ-021", account_id="acc-1", account_email="admin@enjojofoundation.org",
             loc="Zanzibar, TZ", coords=(-6.17, 39.2), status="OFFLINE",
             data_usage_gb=0.0, latency_ms=None, connected_devices=0, uptime_percent=0.0),
    Terminal(id="EA-GUL-003", account_id="acc-3", account_email="rwanda.ops@enjojofoundation.org",
             loc="Gulu, UG", coords=(2.77, 32.29), status="ONLINE",
             data_usage_gb=77.6, latency_ms=25, connected_devices=28, uptime_percent=99.5),
]

_MOCK_ACCOUNTS: list[StarlinkAccount] = [
    StarlinkAccount(id=1, email="admin@enjojofoundation.org", status="Active", terminal_count=4),
    StarlinkAccount(id=2, email="kenya.ops@enjojofoundation.org", status="Active", terminal_count=2),
    StarlinkAccount(id=3, email="rwanda.ops@enjojofoundation.org", status="Active", terminal_count=2),
]

_MOCK_WIFI: dict[str, WifiConfig] = {}
_MOCK_DISH: dict[str, DishConfig] = {}


def _default_wifi(terminal_id: str) -> WifiConfig:
    return WifiConfig(
        ssid=f"STARLINK_{terminal_id.replace('-', '_')}",
        hide_ssid=False,
        bypass_mode=False,
        connected_clients=random.randint(2, 25),
    )


def _default_dish(terminal_id: str) -> DishConfig:
    return DishConfig(snow_melt_mode="auto", power_saving=False)


# ─── Mock Service ─────────────────────────────────────────────────────────────

class MockStarlinkService:
    async def get_terminals(self) -> list[Terminal]:
        return _MOCK_TERMINALS

    async def get_terminal(self, terminal_id: str) -> Optional[Terminal]:
        return next((t for t in _MOCK_TERMINALS if t.id == terminal_id), None)

    async def get_telemetry(self, terminal_id: str) -> Optional[TerminalTelemetry]:
        t = await self.get_terminal(terminal_id)
        if not t:
            return None
        return TerminalTelemetry(
            latency_ms=t.latency_ms or 0,
            download_mbps=round(random.uniform(80, 220), 1),
            signal_percent=random.randint(90, 100) if t.status == "ONLINE" else random.randint(20, 50),
            uptime=f"{random.randint(1, 30)}d {random.randint(0, 23)}h {random.randint(0, 59)}m",
            sw_version="a1b2c3d4",
            errors=0 if t.status == "ONLINE" else random.randint(1, 5),
            warnings=random.randint(0, 3),
            location_type="H3 Cell",
            location_value="8a2a1072b59ffff",
            lat=t.coords[0],
            lng=t.coords[1],
        )

    async def get_wifi(self, terminal_id: str) -> Optional[WifiConfig]:
        if terminal_id not in _MOCK_WIFI:
            _MOCK_WIFI[terminal_id] = _default_wifi(terminal_id)
        return _MOCK_WIFI[terminal_id]

    async def save_wifi(self, terminal_id: str, update: dict) -> bool:
        current = _MOCK_WIFI.get(terminal_id, _default_wifi(terminal_id))
        _MOCK_WIFI[terminal_id] = current.model_copy(update=update)
        return True

    async def get_dish(self, terminal_id: str) -> Optional[DishConfig]:
        if terminal_id not in _MOCK_DISH:
            _MOCK_DISH[terminal_id] = _default_dish(terminal_id)
        return _MOCK_DISH[terminal_id]

    async def save_dish(self, terminal_id: str, update: dict) -> bool:
        current = _MOCK_DISH.get(terminal_id, _default_dish(terminal_id))
        _MOCK_DISH[terminal_id] = current.model_copy(update=update)
        return True

    async def reboot(self, terminal_id: str) -> bool:
        await asyncio.sleep(0.5)
        return True

    async def get_fleet_stats(self) -> FleetStats:
        terminals = await self.get_terminals()
        online = sum(1 for t in terminals if t.status == "ONLINE")
        offline = sum(1 for t in terminals if t.status == "OFFLINE")
        degraded = sum(1 for t in terminals if t.status == "DEGRADED")
        total_data = sum(t.data_usage_gb for t in terminals)
        avg_uptime = sum(t.uptime_percent for t in terminals) / max(len(terminals), 1)
        return FleetStats(
            total=len(terminals),
            online=online,
            offline=offline,
            degraded=degraded,
            total_data_tb=round(total_data / 1000, 2),
            avg_uptime_percent=round(avg_uptime, 1),
        )

    async def get_accounts(self) -> list[StarlinkAccount]:
        return list(_MOCK_ACCOUNTS)

    async def link_account(self, email: str, password: str = "", cookie_json: str | None = None) -> StarlinkAccount:
        new_id = max((a.id for a in _MOCK_ACCOUNTS), default=0) + 1
        account = StarlinkAccount(id=new_id, email=email, status="Active", terminal_count=0)
        _MOCK_ACCOUNTS.append(account)
        return account

    async def remove_account(self, account_id: int) -> bool:
        before = len(_MOCK_ACCOUNTS)
        _MOCK_ACCOUNTS[:] = [a for a in _MOCK_ACCOUNTS if a.id != account_id]
        return len(_MOCK_ACCOUNTS) < before


# ─── Remote Cloud Service ─────────────────────────────────────────────────────

class RemoteStarlinkService(MockStarlinkService):
    """
    Authenticates with the Starlink cloud API using browser-extracted cookies.

    Setup (one-time per account):
    1. Log into https://www.starlink.com in Chrome/Firefox
    2. Export cookies via "Cookie-Editor" extension → Export → JSON
    3. In the dashboard Settings page, enter your Starlink email and paste the JSON
    4. Set STARLINK_MODE=remote in your .env

    The client maps each saved cookie file to one Starlink account.
    Service line data (terminals) comes from the Starlink cloud API.
    Telemetry comes from per-device gRPC calls via the cloud.
    """

    def __init__(self, cookie_dir: str = "server/cookies"):
        self.cookie_dir = Path(cookie_dir)
        self.cookie_dir.mkdir(parents=True, exist_ok=True)
        self._clients: dict[str, any] = {}          # email → GrpcWebClient
        self._sl_cache: dict[str, list] = {}         # email → list[ServiceLine]
        # terminal_id → (email, [router_id, ...])
        self._router_map: dict[str, tuple[str, list[str]]] = {}
        self._load_clients()

    def _load_clients(self):
        """
        Scan the cookie directory and create one GrpcWebClient per JSON file.
        Files must be named <email>.json (e.g. admin@enjojofoundation.org.json).
        """
        try:
            from starlink_client.cookies_parser import parse_cookie_json
            from starlink_client.grpc_web_client import GrpcWebClient
        except ImportError:
            logger.error("starlink-client not installed. Run: pip install starlink-client")
            return

        self._clients.clear()
        for cookie_file in self.cookie_dir.glob("*.json"):
            email = cookie_file.stem
            try:
                cookie_json = cookie_file.read_text(encoding="utf-8")
                cookies = parse_cookie_json(cookie_json)
                refresh_dir = str(self.cookie_dir / "refresh" / email)
                os.makedirs(refresh_dir, exist_ok=True)
                client = GrpcWebClient(cookies, refresh_dir)
                self._clients[email] = client
                logger.info("Loaded Starlink account: %s", email)
            except Exception as exc:
                logger.warning("Failed to load cookies for %s: %s", email, exc)

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _ut_status(self, ut) -> str:
        """
        Derive ONLINE / DEGRADED / OFFLINE from UserTerminal fields.
        active=True + isOffline=False → ONLINE
        active=True + isOffline=True  → DEGRADED (subscribed but currently down)
        active=False                  → OFFLINE
        """
        if not ut.active:
            return "OFFLINE"
        if ut.isOffline:
            return "DEGRADED"
        return "ONLINE"

    def _ut_loc(self, ut, sl) -> str:
        """Best-effort human-readable location string for a UserTerminal."""
        return (
            ut.locationNickname
            or ut.nickname
            or sl.nickname
            or ut.locationFormattedAddress
            or sl.serviceAddress.formattedAddress
            or ut.userTerminalId
        )

    async def _fetch_service_lines(self, email: str, client) -> list:
        """Fetch service lines from Starlink cloud and cache them."""
        loop = asyncio.get_event_loop()
        try:
            response = await loop.run_in_executor(None, client.get_service_lines)
            service_lines = response.content.results
            self._sl_cache[email] = service_lines
            # Rebuild router map for all terminals under this account
            for sl in service_lines:
                for ut in sl.userTerminals:
                    router_ids = [r.routerId for r in ut.routers]
                    self._router_map[ut.userTerminalId] = (email, router_ids)
            return service_lines
        except Exception as exc:
            logger.warning("get_service_lines failed for %s: %s", email, exc)
            return self._sl_cache.get(email, [])

    def _sl_to_terminals(self, sl, email: str, account_id: str) -> list[Terminal]:
        """Convert one ServiceLine → list of Terminal (one per UserTerminal)."""
        terminals = []
        for ut in sl.userTerminals:
            try:
                status = self._ut_status(ut)
                terminals.append(Terminal(
                    id=ut.userTerminalId,
                    account_id=account_id,
                    account_email=email,
                    loc=self._ut_loc(ut, sl),
                    coords=(ut.latitude, ut.longitude),
                    status=status,
                    data_usage_gb=0.0,   # requires a separate telemetry call
                    latency_ms=None,
                    connected_devices=0,
                    uptime_percent=100.0 if status == "ONLINE" else 0.0,
                ))
            except Exception as exc:
                logger.warning("Failed to map UserTerminal %s: %s", getattr(ut, "userTerminalId", "?"), exc)
        return terminals

    # ── Public API ────────────────────────────────────────────────────────────

    async def get_terminals(self) -> list[Terminal]:
        if not self._clients:
            logger.warning("No Starlink cookie files found — returning mock data")
            return await super().get_terminals()

        terminals: list[Terminal] = []
        for idx, (email, client) in enumerate(self._clients.items()):
            account_id = f"acc-{idx + 1}"
            service_lines = await self._fetch_service_lines(email, client)
            for sl in service_lines:
                terminals.extend(self._sl_to_terminals(sl, email, account_id))

        return terminals or await super().get_terminals()

    async def get_terminal(self, terminal_id: str) -> Optional[Terminal]:
        terminals = await self.get_terminals()
        return next((t for t in terminals if t.id == terminal_id), None)

    async def get_telemetry(self, terminal_id: str) -> Optional[TerminalTelemetry]:
        """Fetch live telemetry via get_dish_status(). Falls back to mock on error."""
        terminal = await self.get_terminal(terminal_id)
        if not terminal:
            return None

        client = self._clients.get(terminal.account_email)
        if not client:
            return await super().get_telemetry(terminal_id)

        loop = asyncio.get_event_loop()
        try:
            # get_dish_status() auto-prefixes userTerminalId with "ut"
            dish = await loop.run_in_executor(None, client.get_dish_status, terminal_id)

            uptime_s = int(dish.device_state.uptime_s or 0)
            obstruction = dish.obstruction_stats
            fraction_obstructed = obstruction.fraction_obstructed if obstruction else 0.0
            signal = max(0, 100 - int(fraction_obstructed * 100))
            downlink_bps = dish.downlink_throughput_bps or 0

            return TerminalTelemetry(
                latency_ms=dish.pop_ping_latency_ms or 0,
                download_mbps=round(downlink_bps / 1_000_000, 1),
                signal_percent=signal,
                uptime=f"{uptime_s // 3600}h {(uptime_s % 3600) // 60}m",
                sw_version=dish.device_info.software_version or "unknown",
                errors=1 if obstruction and obstruction.currently_obstructed else 0,
                warnings=1 if fraction_obstructed > 0.01 else 0,
                location_type="GPS",
                location_value=f"{terminal.coords[0]:.5f}, {terminal.coords[1]:.5f}",
                lat=terminal.coords[0],
                lng=terminal.coords[1],
            )
        except Exception as exc:
            logger.warning("get_dish_status failed for %s: %s — using mock", terminal_id, exc)
            return await super().get_telemetry(terminal_id)

    async def get_wifi(self, terminal_id: str) -> Optional[WifiConfig]:
        entry = self._router_map.get(terminal_id)
        if not entry:
            await self.get_terminals()  # populate router map
            entry = self._router_map.get(terminal_id)
        if not entry:
            return await super().get_wifi(terminal_id)

        email, router_ids = entry
        client = self._clients.get(email)
        if not client or not router_ids:
            return await super().get_wifi(terminal_id)

        loop = asyncio.get_event_loop()
        try:
            # get_wifi_status() auto-prefixes routerId with "Router-"
            wifi = await loop.run_in_executor(None, client.get_wifi_status, router_ids[0])
            cfg = wifi.config

            # Pull SSID from first non-guest BasicServiceSet in first network
            ssid = ""
            bypass = bool(cfg.bypass_mode)
            for network in cfg.networks:
                if not network.guest:
                    for bss in network.basic_service_sets:
                        if not bss.disable:
                            ssid = bss.ssid
                            break
                if ssid:
                    break

            connected = len(wifi.clients)

            return WifiConfig(
                ssid=ssid or f"STARLINK_{terminal_id}",
                hide_ssid=False,
                bypass_mode=bypass,
                connected_clients=connected,
            )
        except Exception as exc:
            logger.warning("get_wifi_status failed for %s: %s", terminal_id, exc)
            return await super().get_wifi(terminal_id)

    async def save_wifi(self, terminal_id: str, update: dict) -> bool:
        entry = self._router_map.get(terminal_id)
        if not entry:
            await self.get_terminals()
            entry = self._router_map.get(terminal_id)
        if not entry:
            return await super().save_wifi(terminal_id, update)

        email, router_ids = entry
        client = self._clients.get(email)
        if not client or not router_ids:
            return await super().save_wifi(terminal_id, update)

        loop = asyncio.get_event_loop()
        try:
            from starlink_client.wifi_config import NewWifiConfig
            new_cfg = NewWifiConfig(
                ssid_24ghz=update.get("ssid"),
                ssid_5ghz=update.get("ssid"),
                password_24ghz=update.get("password"),
                password_5ghz=update.get("password"),
                hide_24ghz=update.get("hide_ssid", False),
                hide_5ghz=update.get("hide_ssid", False),
            )
            await loop.run_in_executor(None, client.setup_wifi, router_ids[0], new_cfg)
            return True
        except Exception as exc:
            logger.error("save_wifi failed for %s: %s", terminal_id, exc)
            return False

    async def reboot(self, terminal_id: str) -> bool:
        terminal = await self.get_terminal(terminal_id)
        if not terminal:
            return False
        client = self._clients.get(terminal.account_email)
        if not client:
            return await super().reboot(terminal_id)

        loop = asyncio.get_event_loop()
        try:
            from spacex.api.device.device_pb2 import Request, RebootRequest  # type: ignore
            # Dish IDs are prefixed "ut<userTerminalId>"
            request = Request(
                target_id=f"ut{terminal_id}",
                reboot=RebootRequest(),
            )
            await loop.run_in_executor(None, client.call, request)
            return True
        except Exception as exc:
            logger.error("Reboot failed for %s: %s", terminal_id, exc)
            return False

    async def get_accounts(self) -> list[StarlinkAccount]:
        if not self._clients:
            return await super().get_accounts()

        accounts: list[StarlinkAccount] = []
        for idx, (email, client) in enumerate(self._clients.items()):
            service_lines = await self._fetch_service_lines(email, client)
            terminal_count = sum(len(sl.userTerminals) for sl in service_lines)
            accounts.append(StarlinkAccount(
                id=idx + 1,
                email=email,
                status="Active",
                terminal_count=terminal_count,
            ))
        return accounts

    async def link_account(self, email: str, password: str = "", cookie_json: str | None = None) -> StarlinkAccount:
        """
        Save cookie JSON (from Cookie-Editor) to disk and hot-reload the client.
        No backend restart needed.
        """
        cookie_file = self.cookie_dir / f"{email}.json"

        if cookie_json:
            try:
                from starlink_client.cookies_parser import parse_cookie_json
                parse_cookie_json(cookie_json)  # validate before saving
            except Exception as exc:
                raise ValueError(f"Invalid cookie JSON: {exc}")
            cookie_file.write_text(cookie_json, encoding="utf-8")
            logger.info("Saved cookies for %s", email)

        if not cookie_file.exists():
            raise ValueError(
                "No cookie data provided. Paste the JSON exported from the "
                "Cookie-Editor browser extension after logging into starlink.com."
            )

        self._load_clients()

        accounts = await self.get_accounts()
        account = next((a for a in accounts if a.email == email), None)
        if account:
            return account

        raise ValueError(
            f"Cookie file saved but client failed to load for {email}. "
            "Check that the cookie JSON is valid and try again."
        )

    async def remove_account(self, account_id: int) -> bool:
        accounts = await self.get_accounts()
        target = next((a for a in accounts if a.id == account_id), None)
        if not target:
            return False
        cookie_file = self.cookie_dir / f"{target.email}.json"
        if cookie_file.exists():
            cookie_file.unlink()
        self._clients.pop(target.email, None)
        self._sl_cache.pop(target.email, None)
        # Clean up router map entries for this account
        self._router_map = {
            tid: entry for tid, entry in self._router_map.items()
            if entry[0] != target.email
        }
        return True


# ─── Local gRPC Service ───────────────────────────────────────────────────────

class LocalStarlinkService(MockStarlinkService):
    """
    Connects directly to a Starlink dish on the local network via gRPC (port 9200).
    No authentication required — must be on the same LAN as the dish.

    Usage: set STARLINK_MODE=local and STARLINK_LOCAL_IP=192.168.100.1 in .env
    """

    def __init__(self, dish_ip: str = "192.168.100.1"):
        self.dish_ip = dish_ip
        # from starlink_client import StarlinkClient
        # self._client = StarlinkClient(dish_ip)

    async def get_telemetry(self, terminal_id: str) -> Optional[TerminalTelemetry]:
        # TODO: self._client.get_telemetry() → TerminalTelemetry
        return await super().get_telemetry(terminal_id)

    async def reboot(self, terminal_id: str) -> bool:
        # TODO: self._client.reboot()
        return await super().reboot(terminal_id)


# ─── Factory ─────────────────────────────────────────────────────────────────

def get_starlink_service():
    mode = settings.starlink_mode.lower()
    if mode == "local":
        return LocalStarlinkService(dish_ip=settings.starlink_local_ip)
    if mode == "remote":
        cookie_dir = settings.starlink_cookie_dir
        return RemoteStarlinkService(cookie_dir=cookie_dir)
    return MockStarlinkService()


starlink_service = get_starlink_service()
