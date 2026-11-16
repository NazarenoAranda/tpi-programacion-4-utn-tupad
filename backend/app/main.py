"""Punto de entrada de la API Food Store."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description="API REST de un negocio de comidas: catálogo, pedidos y administración.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS con credenciales: obligatorio para que el navegador envíe la cookie HttpOnly.
# Con allow_credentials=True el origen NO puede ser "*".
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"
for r in (auth_router, usuarios_router, categorias_router, productos_router, pedidos_router):
    app.include_router(r, prefix=API_PREFIX)


@app.get("/", include_in_schema=False)
def root():
    return {"message": "Food Store API", "docs": "/docs", "redoc": "/redoc"}
