"""
CloudLeaf FastAPI Application Main Entry Point
==============================================
Registers API routes and CORS middleware for local development.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.insights import router as insights_router
from backend.routes.metrics import router as metrics_router
from backend.routes.actions import router as actions_router

app = FastAPI(
    title="CloudLeaf AI API",
    description="Backend API for cloud infrastructure cost, carbon, and reliability optimization.",
    version="1.0.0",
)

# Enable CORS for local React development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes with /api prefix
app.include_router(insights_router, prefix="/api")
app.include_router(metrics_router, prefix="/api")
app.include_router(actions_router, prefix="/api")


@app.get("/")
def root():
    return {"message": "CloudLeaf AI API is running"}
