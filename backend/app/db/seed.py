"""Seed idempotente: admin, categorías y productos.

Uso:  python -m app.db.seed
Se puede ejecutar varias veces: solo crea lo que falta.
"""

from sqlmodel import select

from app.core.database import create_all_tables
from app.core.security import hash_password
from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

ADMIN = {
    "username": "admin",
    "full_name": "Administrador",
    "email": "admin@foodstore.com",
    "password": "Admin1234!",
}


def _img(texto: str) -> str:
    return f"https://placehold.co/600x400/1F3864/FFFFFF?text={texto.replace(' ', '+')}"


CATALOGO: dict[str, tuple[str, list[tuple[str, str, float, int]]]] = {
    "Pizzas": (
        "Pizzas artesanales al horno de piedra",
        [
            ("Pizza Muzzarella", "Salsa de tomate, muzzarella y aceitunas", 9500.0, 20),
            ("Pizza Napolitana", "Muzzarella, rodajas de tomate, ajo y albahaca", 11000.0, 15),
            ("Pizza Fugazzeta", "Cebolla caramelizada y doble queso", 11500.0, 12),
        ],
    ),
    "Hamburguesas": (
        "Hamburguesas de carne 100% vacuna",
        [
            ("Hamburguesa Clásica", "Carne, lechuga, tomate y cheddar", 8200.0, 25),
            ("Hamburguesa Doble BBQ", "Doble carne, panceta y salsa barbacoa", 10500.0, 18),
        ],
    ),
    "Bebidas": (
        "Gaseosas, aguas y jugos",
        [
            ("Gaseosa Cola 1.5L", "Botella de 1.5 litros", 3200.0, 40),
            ("Agua Mineral 500ml", "Sin gas", 1500.0, 60),
        ],
    ),
    "Postres": (
        "Dulces para cerrar la comida",
        [
            ("Flan con Dulce de Leche", "Flan casero con crema", 4200.0, 15),
            ("Brownie con Helado", "Brownie tibio con bocha de vainilla", 5600.0, 10),
        ],
    ),
}


def run() -> None:
    create_all_tables()
    creados = {"usuarios": 0, "categorias": 0, "productos": 0}

    with UnitOfWork() as uow:
        session = uow.session
        assert session is not None

        if session.exec(select(Usuario).where(Usuario.username == ADMIN["username"])).first() is None:
            session.add(
                Usuario(
                    username=ADMIN["username"],
                    full_name=ADMIN["full_name"],
                    email=ADMIN["email"],
                    hashed_password=hash_password(ADMIN["password"]),
                    role="admin",
                )
            )
            creados["usuarios"] += 1

        for nombre_cat, (descripcion, productos) in CATALOGO.items():
            categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre_cat)).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre_cat, descripcion=descripcion)
                session.add(categoria)
                session.flush()
                creados["categorias"] += 1

            for nombre, desc, precio, stock in productos:
                existe = session.exec(
                    select(Producto).where(
                        Producto.nombre == nombre, Producto.categoria_id == categoria.id
                    )
                ).first()
                if existe is None:
                    session.add(
                        Producto(
                            categoria_id=categoria.id,  # type: ignore[arg-type]
                            nombre=nombre,
                            descripcion=desc,
                            precio_base=precio,
                            imagen_url=_img(nombre),
                            stock=stock,
                        )
                    )
                    creados["productos"] += 1

    print(
        f"Seed OK — creados: {creados['usuarios']} usuario(s), "
        f"{creados['categorias']} categoría(s), {creados['productos']} producto(s)."
    )
    print(f"Admin: {ADMIN['username']} / {ADMIN['password']}")


if __name__ == "__main__":
    run()
