import bcrypt
from fastapi import APIRouter, HTTPException, status
from server.models.schemas import LoginRequest, LoginResponse
from server.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

# Parse operator accounts from config: "email:hash,email:hash"
_ACCOUNTS: dict[str, str] = {}
for entry in settings.operator_accounts.split(","):
    entry = entry.strip()
    if ":" in entry:
        email, hashed = entry.split(":", 1)
        _ACCOUNTS[email.strip()] = hashed.strip()


def _name_from_email(email: str) -> str:
    local = email.split("@")[0].replace(".", " ").replace("_", " ")
    return local.title()


def _verify(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), hashed.encode())
    except Exception:
        return False


@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest):
    hashed = _ACCOUNTS.get(body.email)
    if not hashed or not _verify(body.password, hashed):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return LoginResponse(
        email=body.email,
        name=_name_from_email(body.email),
        role="Fleet Manager",
    )
