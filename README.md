# Food Store — Trabajo Práctico Integrador (Programación 4)

Aplicación web para un negocio de comidas: backend **FastAPI + SQLModel** y frontend **React + TypeScript**.

- **Alumno:** Nazareno Aranda — Comisión 6
- **Materia:** Programación 4 — Tecnicatura Universitaria en Programación (UTN)
- **Repositorio:** https://github.com/NazarenoAranda/tpi-programacion-4-utn-tupad.git
- **Video de demostración:** https://youtu.be/lnP8FqOlm4s

---

## Requisitos

| Herramienta | Versión |
|---|---|
| Python | 3.11 a 3.13 (SQLModel no funciona con 3.14) |
| PostgreSQL | 15 o superior (opcional: se puede usar SQLite para desarrollo) |
| Node.js | 20.19 o superior |
| pnpm | 9 o superior (`npm install -g pnpm`) |

## Estructura

```
.
├── backend/      API REST (FastAPI + SQLModel)
│   ├── app/
│   │   ├── main.py            CORS con credenciales, prefijo /api/v1, routers
│   │   ├── core/              config, database, security, deps, unit_of_work, base_repository
│   │   ├── modules/           auth, usuarios, categorias, productos, pedidos
│   │   │                      (router → service → unit_of_work → repository → models/schemas)
│   │   └── db/seed.py         seed idempotente
│   ├── requirements.txt       versiones fijadas
│   └── .env.example
├── frontend/     React + TS + Vite + Tailwind, organizado por features
│   ├── src/{shared,features,store,routes}
│   └── .env.example
├── docs/UML_FOOD_STORE.svg    diagrama UML del modelo de datos
└── README.md
```

---

## Backend

Todos los comandos se ejecutan dentro de `backend/`.

### 1. Entorno virtual e instalación

```bash
cd backend
python -m venv venv

# Windows (PowerShell / CMD)
venv\Scripts\activate
# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Base de datos

**Opción A — PostgreSQL (recomendada).** Crear usuario y base:

```sql
CREATE USER foodstore WITH PASSWORD 'foodstore';
CREATE DATABASE foodstore_db OWNER foodstore ENCODING 'UTF8';
```

**Opción B — SQLite (desarrollo rápido, sin instalar nada).** En el `.env` usar
`DATABASE_URL=sqlite:///./foodstore.db`.

### 3. Variables de entorno

Copiar `.env.example` a `.env` y ajustar los valores:

```bash
# Windows
copy .env.example .env
# Linux / macOS
cp .env.example .env
```

| Variable | Descripción | Valor de ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://foodstore:foodstore@localhost:5432/foodstore_db` (desarrollo: `sqlite:///./foodstore.db`) |
| `SECRET_KEY` | Firma del JWT, **mínimo 32 caracteres** | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración de la cookie y del token | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS | `http://localhost:5173` |

### 4. Seed (datos iniciales)

```bash
python -m app.db.seed
```

Es **idempotente** (se puede ejecutar varias veces). Crea las tablas si no existen y carga:

- Usuario administrador: **`admin` / `Admin1234!`** (rol `admin`)
- 4 categorías (Pizzas, Hamburguesas, Bebidas, Postres)
- 9 productos con stock

### 5. Ejecutar

```bash
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## Frontend

Todos los comandos se ejecutan dentro de `frontend/`.

```bash
cd frontend
copy .env.example .env      # Windows   (Linux/macOS: cp .env.example .env)
pnpm install
pnpm build                  # verifica los tipos (TypeScript strict) y compila
pnpm dev                    # http://localhost:5173
```

| Variable | Descripción | Valor de ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

> Levantar primero el backend: el frontend consume la API y la cookie de sesión se envía con `withCredentials`.

---

## Cómo probarlo

1. Entrar a http://localhost:5173, registrarse (`/register`) e iniciar sesión.
2. Agregar productos al carrito, ir a **Carrito → Confirmar pedido**, completar dirección y forma de pago.
3. En **Mis pedidos** ver el detalle y cancelar un pedido `PENDIENTE` (el stock se restituye).
4. Cerrar sesión e ingresar como `admin` / `Admin1234!` para usar el panel: resumen, categorías, productos (stock y disponibilidad), pedidos (cambio de estado) y usuarios (activar/desactivar).

## Decisiones de diseño

- **Autenticación:** el JWT viaja en una cookie `HttpOnly` (`access_token`, 30 min). El cuerpo de la respuesta no incluye el token y el frontend nunca lo lee ni lo guarda; en `localStorage` solo persiste el usuario (nombre, email y rol) y el carrito.
- **Arquitectura en capas:** `Router → Service → Unit of Work → Repository → Model`. El `commit`/`rollback`/`close` ocurre únicamente en `UnitOfWork.__exit__`; ningún Service ni Router llama a `session.commit()`.
- **Pedidos (RN-01 a RN-06):** creación transaccional (si algo falla, no se persiste nada ni se descuenta stock), máquina de estados como diccionario en el Service, restitución de stock al cancelar, líneas inmutables con copia de `nombre_producto` y `precio_unitario`, y permisos por dueño/rol.
- **Baja lógica:** categorías, productos y usuarios no se borran (`activo` / `disabled`). La baja de una categoría no libera su nombre ni da de baja sus productos. Los pedidos no se borran: se cancelan.
- **Fechas:** se guardan y devuelven en UTC con zona horaria; el frontend las muestra en hora local. "Pedidos de hoy" usa el día UTC.
- **Estado en el frontend:** TanStack Query para el estado del servidor (con invalidación tras cada mutación) y Zustand + `persist` para sesión (`authStore`) y carrito (`cartStore`).

## Endpoints principales (`/api/v1`)

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/auth/register`, `/auth/token`, `/auth/logout` | Público |
| GET | `/auth/me` | Sesión |
| GET | `/admin/usuarios` · POST `/admin/usuarios/{id}/activar` · `/desactivar` | admin |
| GET | `/categorias`, `/categorias/{id}` | Público |
| POST / PUT / DELETE | `/categorias`, `/categorias/{id}` | admin |
| GET | `/productos` (`skip`, `limit`, `search`, `categoria_id`, `disponible`), `/productos/{id}` | Público |
| POST / PUT / PATCH `/{id}/stock` / DELETE | `/productos` | admin |
| POST / GET | `/pedidos` | Sesión |
| GET | `/pedidos/resumen` | admin |
| GET | `/pedidos/{id}` | Dueño o admin |
| PATCH | `/pedidos/{id}/estado` | admin |
| PATCH | `/pedidos/{id}/cancelar` | Dueño (solo `PENDIENTE`) |

La especificación completa (con schemas y códigos de respuesta) está en `/docs`.
