from fastapi import APIRouter, HTTPException, status
from server.models.schemas import (
    Terminal, TerminalTelemetry, WifiConfig, WifiConfigUpdate,
    DishConfig, DishConfigUpdate, ActionResponse
)
from server.services.starlink import starlink_service

router = APIRouter(prefix="/terminals", tags=["terminals"])


@router.get("", response_model=list[Terminal])
async def list_terminals():
    return await starlink_service.get_terminals()


@router.get("/{terminal_id}", response_model=Terminal)
async def get_terminal(terminal_id: str):
    terminal = await starlink_service.get_terminal(terminal_id)
    if not terminal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Terminal not found")
    return terminal


@router.get("/{terminal_id}/telemetry", response_model=TerminalTelemetry)
async def get_telemetry(terminal_id: str):
    telemetry = await starlink_service.get_telemetry(terminal_id)
    if not telemetry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Terminal not found")
    return telemetry


@router.get("/{terminal_id}/wifi", response_model=WifiConfig)
async def get_wifi(terminal_id: str):
    config = await starlink_service.get_wifi(terminal_id)
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Terminal not found")
    return config


@router.patch("/{terminal_id}/wifi", response_model=ActionResponse)
async def update_wifi(terminal_id: str, body: WifiConfigUpdate):
    update = body.model_dump(exclude_none=True)
    ok = await starlink_service.save_wifi(terminal_id, update)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Terminal not found")
    return ActionResponse(message="WiFi configuration saved.")


@router.get("/{terminal_id}/dish", response_model=DishConfig)
async def get_dish(terminal_id: str):
    config = await starlink_service.get_dish(terminal_id)
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Terminal not found")
    return config


@router.patch("/{terminal_id}/dish", response_model=ActionResponse)
async def update_dish(terminal_id: str, body: DishConfigUpdate):
    update = body.model_dump(exclude_none=True)
    ok = await starlink_service.save_dish(terminal_id, update)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Terminal not found")
    return ActionResponse(message="Dish configuration saved.")


@router.post("/{terminal_id}/reboot", response_model=ActionResponse)
async def reboot_terminal(terminal_id: str):
    ok = await starlink_service.reboot(terminal_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Terminal not found")
    return ActionResponse(message="Dish rebooted successfully.")
