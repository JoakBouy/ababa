from fastapi import APIRouter
from server.models.schemas import FleetStats
from server.services.starlink import starlink_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/fleet-stats", response_model=FleetStats)
async def fleet_stats():
    return await starlink_service.get_fleet_stats()
