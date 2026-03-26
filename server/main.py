"""
Enjojo Foundation Command Centre — FastAPI Backend
Run: uvicorn server.main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.routes import auth, terminals, analytics, accounts

app = FastAPI(
    title="Enjojo Command Centre API",
    description="Backend for managing Starlink terminal fleets across East Africa",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(terminals.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(accounts.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
