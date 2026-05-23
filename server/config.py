from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Auth
    secret_key: str = "change-me-in-production-use-a-long-random-string"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 8  # 8 hours
    # Development bypass for the PoC UI. Set DEV_AUTH_BYPASS=false before production use.
    dev_auth_bypass: bool = True

    # Starlink
    # Set STARLINK_MODE=local  → connects to dish at STARLINK_LOCAL_IP via gRPC
    # Set STARLINK_MODE=remote → uses authenticated Starlink cloud API
    # Set STARLINK_MODE=mock   → uses built-in mock data (default, no hardware needed)
    starlink_mode: str = "mock"
    starlink_local_ip: str = "192.168.100.1"
    # Path to folder containing one <email>.json cookie file per Starlink account
    starlink_cookie_dir: str = "server/cookies"

    # Operator accounts (comma-separated email:bcrypt_hash pairs)
    # Default: admin@enjojofoundation.org / password123  (CHANGE IN PRODUCTION)
    operator_accounts: str = (
        "admin@enjojofoundation.org:"
        "$2b$12$ohGXFZAjFyhMA2BP6i3e1u7tQmjHyZQEIGaaWXfgsrjLkkLSLeaGO"
    )


settings = Settings()
