from fastapi import APIRouter
from server.models.schemas import FleetStats, FleetSnapshotResponse
from server.services.starlink import starlink_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/fleet-stats", response_model=FleetStats)
async def fleet_stats():
    return await starlink_service.get_fleet_stats()


@router.get("/fleet-snapshot", response_model=FleetSnapshotResponse)
async def fleet_snapshot():
    return await starlink_service.get_fleet_snapshot()
