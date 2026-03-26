from fastapi import APIRouter, HTTPException, status
from server.models.schemas import StarlinkAccount, LinkAccountRequest, ActionResponse
from server.services.starlink import starlink_service

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get("", response_model=list[StarlinkAccount])
async def list_accounts():
    return await starlink_service.get_accounts()


@router.post("", response_model=StarlinkAccount, status_code=status.HTTP_201_CREATED)
async def link_account(body: LinkAccountRequest):
    try:
        return await starlink_service.link_account(
            email=body.email,
            password=body.password or "",
            cookie_json=body.cookie_json,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))


@router.delete("/{account_id}", response_model=ActionResponse)
async def remove_account(account_id: int):
    ok = await starlink_service.remove_account(account_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    return ActionResponse(message="Account removed.")
