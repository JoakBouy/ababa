import csv
from io import StringIO
from typing import Any

from fastapi import APIRouter
from fastapi.responses import Response

from server.models.schemas import DeploymentSite, ExportManifest, FleetSnapshotResponse
from server.services.starlink import starlink_service

router = APIRouter(prefix="/platform", tags=["platform"])


def _csv_response(filename: str, rows: list[dict[str, Any]], fieldnames: list[str]) -> Response:
    buffer = StringIO()
    writer = csv.DictWriter(buffer, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(rows)
    return Response(
        content=buffer.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def _terminal_rows(snapshot: FleetSnapshotResponse) -> list[dict[str, Any]]:
    account_types = {account.email: account.account_type for account in snapshot.accounts}
    rows: list[dict[str, Any]] = []
    for terminal in snapshot.terminals:
        rows.append({
            "id": terminal.id,
            "account_id": terminal.account_id,
            "account_email": terminal.account_email,
            "account_type": terminal.account_type or account_types.get(terminal.account_email, "operations"),
            "site_id": terminal.site_id or "",
            "site_type": terminal.site_type,
            "location": terminal.loc,
            "lat": terminal.coords[0],
            "lng": terminal.coords[1],
            "status": terminal.status,
            "data_usage_gb": terminal.data_usage_gb,
            "latency_ms": terminal.latency_ms,
            "download_mbps": terminal.download_mbps,
            "connected_devices": terminal.connected_devices,
            "uptime_percent": terminal.uptime_percent,
            "data_sources": "|".join(terminal.data_sources),
            "community_usage_sessions": terminal.community_usage_sessions,
            "ranger_voice_sessions": terminal.ranger_voice_sessions,
            "bluetti_soc_percent": terminal.bluetti_soc_percent,
        })
    return rows


def _site_rows(sites: list[DeploymentSite]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for site in sites:
        rows.append({
            "id": site.id,
            "name": site.name,
            "account_email": site.account_email,
            "account_type": site.account_type,
            "site_type": site.site_type,
            "purpose": site.purpose,
            "location": site.loc,
            "lat": site.coords[0],
            "lng": site.coords[1],
            "terminal_ids": "|".join(site.terminal_ids),
            "data_sources": "|".join(site.data_sources),
            "terminal_count": site.metrics.get("terminal_count", 0),
            "online_terminals": site.metrics.get("online_terminals", 0),
            "connected_devices": site.metrics.get("connected_devices", 0),
            "community_usage_sessions": site.metrics.get("community_usage_sessions", 0),
            "ranger_voice_sessions": site.metrics.get("ranger_voice_sessions", 0),
            "avg_bluetti_soc_percent": site.metrics.get("avg_bluetti_soc_percent", 0),
        })
    return rows


@router.get("/exports", response_model=ExportManifest)
async def export_manifest():
    return ExportManifest(
        formats=["json", "csv"],
        endpoints={
            "fleet_json": "/api/platform/exports/fleet.json",
            "fleet_csv": "/api/platform/exports/fleet.csv",
            "sites_json": "/api/platform/exports/sites.json",
            "sites_csv": "/api/platform/exports/sites.csv",
        },
        openapi_json="/openapi.json",
        swagger_docs="/docs",
        redoc_docs="/redoc",
    )


@router.get("/sites", response_model=list[DeploymentSite])
async def deployment_sites():
    return await starlink_service.get_deployment_sites()


@router.get("/exports/fleet.json", response_model=FleetSnapshotResponse)
async def export_fleet_json():
    return await starlink_service.get_fleet_snapshot()


@router.get("/exports/fleet.csv")
async def export_fleet_csv():
    snapshot = await starlink_service.get_fleet_snapshot()
    return _csv_response(
        "enjojo-fleet-export.csv",
        _terminal_rows(snapshot),
        [
            "id",
            "account_id",
            "account_email",
            "account_type",
            "site_id",
            "site_type",
            "location",
            "lat",
            "lng",
            "status",
            "data_usage_gb",
            "latency_ms",
            "download_mbps",
            "connected_devices",
            "uptime_percent",
            "data_sources",
            "community_usage_sessions",
            "ranger_voice_sessions",
            "bluetti_soc_percent",
        ],
    )


@router.get("/exports/sites.json", response_model=list[DeploymentSite])
async def export_sites_json():
    return await starlink_service.get_deployment_sites()


@router.get("/exports/sites.csv")
async def export_sites_csv():
    sites = await starlink_service.get_deployment_sites()
    return _csv_response(
        "enjojo-sites-export.csv",
        _site_rows(sites),
        [
            "id",
            "name",
            "account_email",
            "account_type",
            "site_type",
            "purpose",
            "location",
            "lat",
            "lng",
            "terminal_ids",
            "data_sources",
            "terminal_count",
            "online_terminals",
            "connected_devices",
            "community_usage_sessions",
            "ranger_voice_sessions",
            "avg_bluetti_soc_percent",
        ],
    )
