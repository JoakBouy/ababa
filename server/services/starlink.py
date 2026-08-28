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
import time
from pathlib import Path
from typing import Any, Optional
import httpx

from server.models.schemas import (
    DeploymentSite, Terminal, TerminalTelemetry, WifiConfig, DishConfig, FleetStats, StarlinkAccount, FleetSnapshotResponse,
)
from server.config import settings

logger = logging.getLogger(__name__)

# ─── Mock Data ───────────────────────────────────────────────────────────────

_MOCK_TERMINALS: list[Terminal] = [
    Terminal(id="EA-JUB-001", account_id="acc-1", account_email="admin@enjojofoundation.org",
             account_type="ranger", site_id="site-rangers-juba", site_type="ranger_gateway",
             loc="Juba Central, SS", coords=(4.85, 31.6), status="ONLINE",
             data_usage_gb=42.4, latency_ms=28, connected_devices=18, uptime_percent=99.1,
             data_sources=["starlink", "ruijie_ap", "zalo_dns", "ranger_radio_gateway"],
             ranger_voice_sessions=164, bluetti_soc_percent=86),
    Terminal(id="EA-KMP-014", account_id="acc-2", account_email="kenya.ops@enjojofoundation.org",
             account_type="community", site_id="site-community-kampala", site_type="community_gateway",
             loc="Kampala North, UG", coords=(0.34, 32.58), status="ONLINE",
             data_usage_gb=8.1, latency_ms=31, connected_devices=6, uptime_percent=98.4,
             data_sources=["starlink", "unifi_ap", "community_landing_page"],
             community_usage_sessions=83, bluetti_soc_percent=71),
    Terminal(id="EA-JUB-009", account_id="acc-1", account_email="admin@enjojofoundation.org",
             account_type="ranger", site_id="site-rangers-juba", site_type="ranger_gateway",
             loc="Juba A2 Outpost, SS", coords=(4.9, 31.65), status="DEGRADED",
             data_usage_gb=0.0, latency_ms=None, connected_devices=2, uptime_percent=45.0,
             data_sources=["starlink", "zalo_dns", "ranger_radio_gateway"],
             ranger_voice_sessions=27, bluetti_soc_percent=44),
    Terminal(id="EA-KMP-022", account_id="acc-3", account_email="rwanda.ops@enjojofoundation.org",
             account_type="base_camp", site_id="site-base-entebbe", site_type="base_camp",
             loc="Entebbe Logistics, UG", coords=(0.06, 32.44), status="ONLINE",
             data_usage_gb=112.9, latency_ms=35, connected_devices=31, uptime_percent=97.8,
             data_sources=["starlink", "unifi_ap", "bluetti_exporter"],
             bluetti_soc_percent=92),
    Terminal(id="EA-NBO-004", account_id="acc-1", account_email="admin@enjojofoundation.org",
             account_type="ranger", site_id="site-rangers-nairobi", site_type="ranger_gateway",
             loc="Nairobi, KE", coords=(-1.29, 36.82), status="DEGRADED",
             data_usage_gb=12.4, latency_ms=120, connected_devices=4, uptime_percent=72.3,
             data_sources=["starlink", "zalo_dns", "ranger_radio_gateway"],
             ranger_voice_sessions=42, bluetti_soc_percent=58),
    Terminal(id="EA-MSA-099", account_id="acc-2", account_email="kenya.ops@enjojofoundation.org",
             account_type="community", site_id="site-community-mombasa", site_type="community_gateway",
             loc="Mombasa, KE", coords=(-4.05, 39.67), status="ONLINE",
             data_usage_gb=56.2, latency_ms=38, connected_devices=22, uptime_percent=96.5,
             data_sources=["starlink", "ruijie_ap", "community_landing_page"],
             community_usage_sessions=231, bluetti_soc_percent=79),
    Terminal(id="EA-ZNZ-021", account_id="acc-1", account_email="admin@enjojofoundation.org",
             account_type="community", site_id="site-community-zanzibar", site_type="community_gateway",
             loc="Zanzibar, TZ", coords=(-6.17, 39.2), status="OFFLINE",
             data_usage_gb=0.0, latency_ms=None, connected_devices=0, uptime_percent=0.0,
             data_sources=["starlink", "community_landing_page"],
             community_usage_sessions=0, bluetti_soc_percent=12),
    Terminal(id="EA-GUL-003", account_id="acc-3", account_email="rwanda.ops@enjojofoundation.org",
             account_type="base_camp", site_id="site-base-gulu", site_type="base_camp",
             loc="Gulu, UG", coords=(2.77, 32.29), status="ONLINE",
             data_usage_gb=77.6, latency_ms=25, connected_devices=28, uptime_percent=99.5,
             data_sources=["starlink", "unifi_ap", "bluetti_exporter"],
             bluetti_soc_percent=88),
]

_MOCK_ACCOUNTS: list[StarlinkAccount] = [
    StarlinkAccount(id=1, email="admin@enjojofoundation.org", status="Active", terminal_count=4,
                    account_type="ranger", display_name="Ranger Communications"),
    StarlinkAccount(id=2, email="kenya.ops@enjojofoundation.org", status="Active", terminal_count=2,
                    account_type="community", display_name="Community Gateways"),
    StarlinkAccount(id=3, email="rwanda.ops@enjojofoundation.org", status="Active", terminal_count=2,
                    account_type="base_camp", display_name="Base Camp Operations"),
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


def _account_type_for_email(email: str) -> str:
    account = next((item for item in _MOCK_ACCOUNTS if item.email == email), None)
    return account.account_type if account else "operations"


def _site_purpose(site_type: str) -> str:
    purposes = {
        "ranger_gateway": "Ranger communications, Zalo DNS routing, walkie-talkie gateway, and field telemetry.",
        "community_gateway": "Community internet gateway with landing-page usage reasons and access-point analytics.",
        "base_camp": "Office and base-camp connectivity for employees, power telemetry, and operational data collection.",
    }
    return purposes.get(site_type, "Operational connectivity and telemetry collection.")


def _terminal_metric_sum(terminals: list[Terminal], field: str) -> int:
    return int(sum(int(getattr(terminal, field) or 0) for terminal in terminals))


def _build_deployment_sites(terminals: list[Terminal]) -> list[DeploymentSite]:
    grouped: dict[str, list[Terminal]] = {}
    for terminal in terminals:
        grouped.setdefault(terminal.site_id or terminal.id, []).append(terminal)

    sites: list[DeploymentSite] = []
    for site_id, site_terminals in grouped.items():
        first = site_terminals[0]
        connected_devices = sum(int(terminal.connected_devices or 0) for terminal in site_terminals)
        data_sources = sorted({
            source
            for terminal in site_terminals
            for source in terminal.data_sources
        })
        sites.append(DeploymentSite(
            id=site_id,
            name=first.loc.split(",")[0],
            account_email=first.account_email,
            account_type=first.account_type,
            site_type=first.site_type,
            purpose=_site_purpose(first.site_type),
            loc=first.loc,
            coords=first.coords,
            terminal_ids=[terminal.id for terminal in site_terminals],
            data_sources=data_sources,
            metrics={
                "terminal_count": len(site_terminals),
                "online_terminals": sum(1 for terminal in site_terminals if terminal.status == "ONLINE"),
                "connected_devices": connected_devices,
                "community_usage_sessions": _terminal_metric_sum(site_terminals, "community_usage_sessions"),
                "ranger_voice_sessions": _terminal_metric_sum(site_terminals, "ranger_voice_sessions"),
                "avg_bluetti_soc_percent": round(
                    sum(float(terminal.bluetti_soc_percent or 0) for terminal in site_terminals)
                    / max(sum(1 for terminal in site_terminals if terminal.bluetti_soc_percent is not None), 1),
                    1,
                ),
            },
        ))
    return sites


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
        current_download = sum((t.download_mbps or 0) for t in terminals)
        avg_uptime = sum(t.uptime_percent for t in terminals) / max(len(terminals), 1)
        return FleetStats(
            total=len(terminals),
            online=online,
            offline=offline,
            degraded=degraded,
            total_data_tb=round(total_data / 1000, 2),
            current_download_mbps=round(current_download, 1),
            avg_uptime_percent=round(avg_uptime, 1),
        )

    async def get_accounts(self) -> list[StarlinkAccount]:
        return list(_MOCK_ACCOUNTS)

    async def get_deployment_sites(self) -> list[DeploymentSite]:
        terminals = await self.get_terminals()
        return _build_deployment_sites(terminals)

    async def get_fleet_snapshot(self) -> FleetSnapshotResponse:
        terminals = await self.get_terminals()
        accounts = await self.get_accounts()
        fleet_stats = await self.get_fleet_stats()
        return FleetSnapshotResponse(
            accounts=accounts,
            terminals=terminals,
            fleet_stats=fleet_stats,
        )

    async def link_account(self, email: str, password: str = "", cookie_json: Optional[str] = None) -> StarlinkAccount:
        new_id = max((a.id for a in _MOCK_ACCOUNTS), default=0) + 1
        account = StarlinkAccount(
            id=new_id,
            email=email,
            status="Active",
            terminal_count=0,
            account_type="operations",
            display_name="Operations Account",
        )
        _MOCK_ACCOUNTS.append(account)
        return account

    async def remove_account(self, account_id: int) -> bool:
        before = len(_MOCK_ACCOUNTS)
        _MOCK_ACCOUNTS[:] = [a for a in _MOCK_ACCOUNTS if a.id != account_id]
        return len(_MOCK_ACCOUNTS) < before


class CompatibleGrpcWebClient:
    """
    Thin compatibility wrapper around starlink-client.

    The upstream package currently assumes an XSRF-TOKEN cookie is always issued
    and validates service-line payloads against a model that is stricter than the
    current Starlink API responses. We reuse the package for authenticated gRPC
    calls, but fetch service-line data as raw JSON and tolerate missing XSRF.
    """

    SERVICE_LINES_URL = (
        "https://api.starlink.com/webagg/v2/accounts/service-lines"
        "?limit=10&page=0&isConverting=false&serviceAddressId="
        "&onlyActive=false&searchString=&onlyNoUts=false"
    )

    def __init__(self, cookie_string: str, cookie_storage_path: str):
        from starlink_client.grpc_web_base_client import GrpcWebBaseClient
        from starlink_client.grpc_web_client import GrpcWebClient

        GrpcWebBaseClient._refresh_auth = CompatibleGrpcWebClient._compat_refresh_auth
        self._client = GrpcWebClient(cookie_string, cookie_storage_path)
        self._last_auth_refresh = time.time()

    @staticmethod
    def _compat_refresh_auth(base_client) -> bool:
        from starlink_client.account import Account
        from starlink_client.grpc_web_base_client import AuthenticationError, DEFAULT_TIMEOUT

        with base_client._lock:
            headers = {
                "X-User-Agent": "okhttp/4.9.2",
                "Accept": "application/json",
                "Cookie": base_client._cookie,
            }
            if base_client._xsrf_token:
                headers["x-xsrf-token"] = base_client._xsrf_token

            try:
                with httpx.Client(http2=False, follow_redirects=True, timeout=DEFAULT_TIMEOUT) as auth_client:
                    response = auth_client.get(
                        base_client._auth_url,
                        headers=headers,
                    )
            except Exception as exc:
                raise AuthenticationError(
                    f"Error during authentication refresh request: {exc}"
                ) from exc

            if response.status_code != 200:
                raise AuthenticationError(
                    f"Authentication failed with status code {response.status_code}"
                )

            base_client._account = Account.model_validate_json(response.text)

            for cookie_name in response.cookies.keys():
                base_client._cookie_jar.delete(cookie_name)

            for cookie in response.cookies.jar:
                base_client._cookie_jar.set(
                    name=cookie.name,
                    value=str(cookie.value),
                    domain=cookie.domain,
                    path=cookie.path,
                )

            refreshed_xsrf = base_client._cookie_jar.get("XSRF-TOKEN", "")
            if refreshed_xsrf:
                base_client._xsrf_token = refreshed_xsrf

            base_client._update_cookie_header()
            return True

    def refresh_auth(self, force: bool = False) -> bool:
        if not force and (time.time() - self._last_auth_refresh) < 180:
            return True
        ok = self._compat_refresh_auth(self._client)
        if ok:
            self._last_auth_refresh = time.time()
        return ok

    def _rest_get(self, url: str) -> httpx.Response:
        headers = {
            "X-User-Agent": "okhttp/4.9.2",
            "Accept": "application/json",
            "Cookie": self._client._cookie,
        }
        if self._client._xsrf_token:
            headers["x-xsrf-token"] = self._client._xsrf_token
        with httpx.Client(http2=False, follow_redirects=True, timeout=10) as client:
            return client.get(url, headers=headers)

    def get_service_lines_raw(self) -> list[dict[str, Any]]:
        from starlink_client.grpc_web_base_client import ResponseError

        response = self._rest_get(self.SERVICE_LINES_URL)
        if response.status_code == 401:
            self.refresh_auth(force=True)
            response = self._rest_get(self.SERVICE_LINES_URL)
        if response.status_code != 200:
            raise ResponseError(
                f"Failed to get service lines: HTTP {response.status_code}"
            )

        data = response.json()
        return data.get("content", {}).get("results", [])

    def get_dish_status(self, terminal_id: str):
        self.refresh_auth()
        return self._client.get_dish_status(terminal_id)

    def get_wifi_status(self, router_id: str):
        self.refresh_auth()
        return self._client.get_wifi_status(router_id)

    def setup_wifi(self, router_id: str, new_cfg):
        self.refresh_auth()
        return self._client.setup_wifi(router_id, new_cfg)

    def call(self, request):
        self.refresh_auth()
        return self._client.call(request)


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
        self._load_errors: dict[str, str] = {}       # email → load error
        self._fleet_cache_ttl_s = 30
        self._summary_cache_ttl_s = 30
        self._fleet_cache: Optional[tuple[float, list[Terminal]]] = None
        self._terminal_summary_cache: dict[str, tuple[float, dict[str, Any]]] = {}
        self._summary_warm_task: Optional[asyncio.Task] = None
        self._max_parallel_service_line_fetches = 4
        self._max_parallel_summary_warms = 3
        # terminal_id → (email, [router_id, ...])
        self._router_map: dict[str, tuple[str, list[str]]] = {}
        self._load_clients()

    def _sanitize_cookie_json(self, cookie_json: str) -> str:
        try:
            parsed = json.loads(cookie_json)
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid cookie JSON: {exc}") from exc

        if isinstance(parsed, dict) and {"data", "version"} <= set(parsed.keys()):
            raise ValueError(
                "Encrypted cookie-manager exports are not supported. "
                "Paste the raw JSON cookie array exported directly from https://www.starlink.com."
            )

        if not isinstance(parsed, list):
            raise ValueError(
                "Cookie JSON must be a raw array of cookie objects exported from https://www.starlink.com."
            )

        filtered: list[dict[str, Any]] = []
        for item in parsed:
            if not isinstance(item, dict):
                continue
            domain = str(item.get("domain") or "").lower()
            if domain == "starlink.com" or domain.endswith(".starlink.com"):
                filtered.append(item)

        if not filtered:
            raise ValueError(
                "No starlink.com cookies were found. Export the cookies while fully logged into https://www.starlink.com."
            )

        return json.dumps(filtered, ensure_ascii=True, indent=2)

    def _load_clients(self):
        """
        Scan the cookie directory and create one GrpcWebClient per JSON file.
        Files must be named <email>.json (e.g. admin@enjojofoundation.org.json).
        """
        try:
            from starlink_client.cookies_parser import parse_cookie_json
        except ImportError:
            logger.error("starlink-client not installed. Run: pip install starlink-client")
            return

        self._clients.clear()
        self._load_errors.clear()
        for cookie_file in self.cookie_dir.glob("*.json"):
            email = cookie_file.stem
            try:
                cookie_json = cookie_file.read_text(encoding="utf-8")
                cookies = parse_cookie_json(cookie_json)
                refresh_dir = str(self.cookie_dir / "refresh" / email)
                os.makedirs(refresh_dir, exist_ok=True)
                client = CompatibleGrpcWebClient(cookies, refresh_dir)
                self._clients[email] = client
                logger.info("Loaded Starlink account: %s", email)
            except Exception as exc:
                self._load_errors[email] = str(exc)
                logger.warning("Failed to load cookies for %s: %s", email, exc)

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _ut_status(self, ut: dict[str, Any]) -> str:
        """
        Derive ONLINE / DEGRADED / OFFLINE from UserTerminal fields.
        active=True + isOffline=False → ONLINE
        active=True + isOffline=True  → DEGRADED (subscribed but currently down)
        active=False                  → OFFLINE
        """
        if not ut.get("active"):
            return "OFFLINE"
        if ut.get("isOffline"):
            return "DEGRADED"
        return "ONLINE"

    def _ut_loc(self, ut: dict[str, Any], sl: dict[str, Any]) -> str:
        """Best-effort human-readable location string for a UserTerminal."""
        service_address = sl.get("serviceAddress") or {}
        label = ut.get("locationNickname") or ut.get("nickname") or sl.get("nickname")
        formatted_address = ut.get("locationFormattedAddress") or service_address.get("formattedAddress")
        include_admin_code = not service_address.get("administrativeArea")
        include_region_code = not service_address.get("region")
        include_formatted_address = bool(formatted_address) and (
            not str(formatted_address).startswith("Location:")
            or not any([service_address.get("locality"), service_address.get("administrativeArea"), service_address.get("region")])
        )
        address_parts = [
            service_address.get("locality"),
            service_address.get("administrativeArea"),
            service_address.get("administrativeAreaCode") if include_admin_code else None,
            service_address.get("region"),
            service_address.get("regionCode") if include_region_code else None,
            formatted_address if include_formatted_address else None,
        ]
        deduped_parts: list[str] = []
        for part in address_parts:
            text = str(part or "").strip()
            if text and text not in deduped_parts:
                deduped_parts.append(text)

        location_text = ", ".join(deduped_parts)
        if label and location_text:
            return f"{label} — {location_text}"
        return label or location_text or ut.get("userTerminalId")

    async def _get_terminal_live_summary(
        self,
        terminal: Terminal,
        client,
        router_ids: list[str],
        force_refresh: bool = False,
    ) -> dict[str, Any]:
        now = time.time()
        cached = self._terminal_summary_cache.get(terminal.id)
        if not force_refresh and cached and (now - cached[0]) < self._summary_cache_ttl_s:
            return cached[1]

        summary: dict[str, Any] = {
            "latency_ms": terminal.latency_ms,
            "download_mbps": terminal.download_mbps,
            "connected_devices": terminal.connected_devices,
        }
        loop = asyncio.get_event_loop()

        try:
            dish = await loop.run_in_executor(None, client.get_dish_status, terminal.id)
            summary["latency_ms"] = float(dish.pop_ping_latency_ms or 0)
            summary["download_mbps"] = round((dish.downlink_throughput_bps or 0) / 1_000_000, 1)
        except Exception as exc:
            logger.info("Live dish summary unavailable for %s: %s", terminal.id, exc)

        if router_ids:
            try:
                wifi = await loop.run_in_executor(None, client.get_wifi_status, router_ids[0])
                summary["connected_devices"] = len(wifi.clients)
            except Exception as exc:
                logger.info("Live router summary unavailable for %s: %s", terminal.id, exc)

        self._terminal_summary_cache[terminal.id] = (now, summary)
        return summary

    def _apply_cached_terminal_summaries(self, terminals: list[Terminal]) -> list[Terminal]:
        if not terminals:
            return terminals

        now = time.time()
        enriched: list[Terminal] = []
        for terminal in terminals:
            cached = self._terminal_summary_cache.get(terminal.id)
            if not cached or (now - cached[0]) >= self._summary_cache_ttl_s:
                enriched.append(terminal)
                continue
            summary = cached[1]
            enriched.append(terminal.model_copy(update={
                "latency_ms": summary.get("latency_ms"),
                "download_mbps": summary.get("download_mbps"),
                "connected_devices": summary.get("connected_devices"),
            }))
        return enriched

    async def _warm_terminal_summaries(self, terminals: list[Terminal]):
        semaphore = asyncio.Semaphore(self._max_parallel_summary_warms)

        async def warm_terminal(terminal: Terminal):
            async with semaphore:
                entry = self._router_map.get(terminal.id, (terminal.account_email, []))
                email, router_ids = entry
                client = self._clients.get(email)
                if not client:
                    return
                await self._get_terminal_live_summary(
                    terminal,
                    client,
                    router_ids,
                    force_refresh=True,
                )

        try:
            await asyncio.gather(*(warm_terminal(terminal) for terminal in terminals))
        except Exception as exc:
            logger.info("Background summary warm failed: %s", exc)
        finally:
            self._summary_warm_task = None

    def _schedule_summary_warm(self, terminals: list[Terminal]):
        if self._summary_warm_task and not self._summary_warm_task.done():
            return
        try:
            self._summary_warm_task = asyncio.create_task(self._warm_terminal_summaries(terminals))
        except RuntimeError:
            self._summary_warm_task = None

    async def _fetch_service_lines(self, email: str, client) -> list:
        """Fetch service lines from Starlink cloud and cache them."""
        loop = asyncio.get_event_loop()
        try:
            service_lines = await loop.run_in_executor(None, client.get_service_lines_raw)
            self._sl_cache[email] = service_lines
            # Rebuild router map for all terminals under this account
            self._router_map = {
                terminal_id: entry
                for terminal_id, entry in self._router_map.items()
                if entry[0] != email
            }
            for sl in service_lines:
                for ut in sl.get("userTerminals") or []:
                    terminal_id = ut.get("userTerminalId")
                    if not terminal_id:
                        continue
                    router_ids = [
                        router.get("routerId")
                        for router in (ut.get("routers") or [])
                        if router.get("routerId")
                    ]
                    self._router_map[terminal_id] = (email, router_ids)
            return service_lines
        except Exception as exc:
            logger.warning("get_service_lines failed for %s: %s", email, exc)
            return self._sl_cache.get(email, [])

    async def _fetch_all_account_service_lines(self) -> list[tuple[str, str, list[dict[str, Any]]]]:
        semaphore = asyncio.Semaphore(self._max_parallel_service_line_fetches)

        async def fetch_one(idx: int, email: str, client) -> tuple[str, str, list[dict[str, Any]]]:
            async with semaphore:
                service_lines = await self._fetch_service_lines(email, client)
                return email, f"acc-{idx + 1}", service_lines

        results = await asyncio.gather(*(
            fetch_one(idx, email, client)
            for idx, (email, client) in enumerate(self._clients.items())
        ))
        return list(results)

    def _sl_to_terminals(self, sl: dict[str, Any], email: str, account_id: str) -> list[Terminal]:
        """Convert one ServiceLine → list of Terminal (one per UserTerminal)."""
        terminals = []
        service_address = sl.get("serviceAddress") or {}
        geo = service_address.get("geoLocation") or {}
        account_type = _account_type_for_email(email)
        site_type = {
            "ranger": "ranger_gateway",
            "community": "community_gateway",
            "base_camp": "base_camp",
        }.get(account_type, "operations")
        site_id = str(
            sl.get("serviceLineNumber")
            or service_address.get("addressReferenceId")
            or service_address.get("id")
            or account_id
        )
        for ut in sl.get("userTerminals") or []:
            try:
                terminal_id = ut.get("userTerminalId")
                if not terminal_id:
                    continue
                status = self._ut_status(ut)
                lat = ut.get("latitude")
                lng = ut.get("longitude")
                if (lat in (None, 0) and lng in (None, 0)) and geo:
                    lat = geo.get("latitude", lat)
                    lng = geo.get("longitude", lng)
                lat = float(lat or 0.0)
                lng = float(lng or 0.0)
                terminals.append(Terminal(
                    id=terminal_id,
                    account_id=account_id,
                    account_email=email,
                    account_type=account_type,
                    site_id=f"site-{site_id}",
                    site_type=site_type,
                    loc=self._ut_loc(ut, sl),
                    coords=(lat, lng),
                    status=status,
                    data_usage_gb=0.0,   # requires a separate telemetry call
                    latency_ms=None,
                    download_mbps=None,
                    connected_devices=None,
                    uptime_percent=100.0 if status == "ONLINE" else 0.0,
                    data_sources=["starlink"],
                ))
            except Exception as exc:
                logger.warning("Failed to map UserTerminal %s: %s", ut.get("userTerminalId", "?"), exc)
        return terminals

    # ── Public API ────────────────────────────────────────────────────────────

    async def get_terminals(self) -> list[Terminal]:
        if not self._clients:
            logger.warning("No Starlink cookie files found in remote mode")
            return []

        now = time.time()
        if self._fleet_cache and (now - self._fleet_cache[0]) < self._fleet_cache_ttl_s:
            cached_terminals = [terminal.model_copy(deep=True) for terminal in self._fleet_cache[1]]
            return self._apply_cached_terminal_summaries(cached_terminals)

        terminals: list[Terminal] = []
        for email, account_id, service_lines in await self._fetch_all_account_service_lines():
            for sl in service_lines:
                terminals.extend(self._sl_to_terminals(sl, email, account_id))

        terminals = self._apply_cached_terminal_summaries(terminals)
        self._schedule_summary_warm([terminal.model_copy(deep=True) for terminal in terminals])
        self._fleet_cache = (now, terminals)

        if not terminals:
            logger.warning("No live Starlink terminals were returned in remote mode")
        return terminals

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
            logger.warning("No live Starlink client found for %s", terminal_id)
            return None

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
            logger.warning("get_dish_status failed for %s: %s", terminal_id, exc)
            return None

    async def get_wifi(self, terminal_id: str) -> Optional[WifiConfig]:
        entry = self._router_map.get(terminal_id)
        if not entry:
            await self.get_terminals()  # populate router map
            entry = self._router_map.get(terminal_id)
        if not entry:
            return None

        email, router_ids = entry
        client = self._clients.get(email)
        if not client or not router_ids:
            return None

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
            return None

    async def save_wifi(self, terminal_id: str, update: dict) -> bool:
        entry = self._router_map.get(terminal_id)
        if not entry:
            await self.get_terminals()
            entry = self._router_map.get(terminal_id)
        if not entry:
            return False

        email, router_ids = entry
        client = self._clients.get(email)
        if not client or not router_ids:
            return False

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

    async def get_dish(self, terminal_id: str) -> Optional[DishConfig]:
        return None

    async def save_dish(self, terminal_id: str, update: dict) -> bool:
        return False

    async def get_accounts(self) -> list[StarlinkAccount]:
        if not self._clients:
            return []

        accounts: list[StarlinkAccount] = []
        for idx, (email, _, service_lines) in enumerate(await self._fetch_all_account_service_lines()):
            terminal_count = sum(len(sl.get("userTerminals") or []) for sl in service_lines)
            accounts.append(StarlinkAccount(
                id=idx + 1,
                email=email,
                status="Active",
                terminal_count=terminal_count,
                account_type=_account_type_for_email(email),
                display_name=email,
            ))
        return accounts

    async def get_deployment_sites(self) -> list[DeploymentSite]:
        terminals = await self.get_terminals()
        return _build_deployment_sites(terminals)

    async def get_fleet_snapshot(self) -> FleetSnapshotResponse:
        terminals = await self.get_terminals()
        account_terminal_counts: dict[str, int] = {}
        for terminal in terminals:
            account_terminal_counts[terminal.account_email] = account_terminal_counts.get(terminal.account_email, 0) + 1

        accounts = [
            StarlinkAccount(
                id=idx + 1,
                email=email,
                status="Active",
                terminal_count=account_terminal_counts.get(email, 0),
                account_type=_account_type_for_email(email),
                display_name=email,
            )
            for idx, email in enumerate(self._clients.keys())
        ]

        online = sum(1 for terminal in terminals if terminal.status == "ONLINE")
        offline = sum(1 for terminal in terminals if terminal.status == "OFFLINE")
        degraded = sum(1 for terminal in terminals if terminal.status == "DEGRADED")
        current_download = sum((terminal.download_mbps or 0) for terminal in terminals)
        avg_uptime = sum(terminal.uptime_percent for terminal in terminals) / max(len(terminals), 1)

        return FleetSnapshotResponse(
            accounts=accounts,
            terminals=terminals,
            fleet_stats=FleetStats(
                total=len(terminals),
                online=online,
                offline=offline,
                degraded=degraded,
                total_data_tb=0.0,
                current_download_mbps=round(current_download, 1),
                avg_uptime_percent=round(avg_uptime, 1),
            ),
        )

    async def link_account(self, email: str, password: str = "", cookie_json: Optional[str] = None) -> StarlinkAccount:
        """
        Save cookie JSON (from Cookie-Editor) to disk and hot-reload the client.
        No backend restart needed.
        """
        cookie_file = self.cookie_dir / f"{email}.json"

        if cookie_json:
            sanitized_cookie_json = self._sanitize_cookie_json(cookie_json)
            try:
                from starlink_client.cookies_parser import parse_cookie_json
                parse_cookie_json(sanitized_cookie_json)  # validate before saving
            except Exception as exc:
                raise ValueError(f"Invalid cookie JSON: {exc}")
            cookie_file.write_text(sanitized_cookie_json, encoding="utf-8")
            logger.info("Saved cookies for %s", email)

        if not cookie_file.exists():
            raise ValueError(
                "No cookie data provided. Paste the JSON exported from the "
                "Cookie-Editor browser extension after logging into starlink.com."
            )

        self._load_clients()
        self._fleet_cache = None
        self._terminal_summary_cache.clear()

        accounts = await self.get_accounts()
        account = next((a for a in accounts if a.email == email), None)
        if account:
            return account

        load_error = self._load_errors.get(email)
        if load_error:
            raise ValueError(
                f"Cookie file was saved, but the Starlink client could not load it: {load_error}. "
                "Re-export the cookies from https://www.starlink.com while fully logged in and paste the full JSON."
            )

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
        self._fleet_cache = None
        self._terminal_summary_cache.clear()
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
