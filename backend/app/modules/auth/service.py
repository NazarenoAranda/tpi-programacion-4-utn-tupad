from fastapi import HTTPException, status

from app.core.security import create_access_token, verify_password
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, data: UserCreate) -> UserPublic:
        return UsuarioService(self.uow).registrar(data)

    def login(self, username: str, password: str) -> str:
        """Valida credenciales y devuelve el JWT (el router lo pone en la cookie)."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise HTTPException(
                    status.HTTP_401_UNAUTHORIZED, "Usuario o contraseña incorrectos"
                )
            if usuario.disabled:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cuenta de usuario desactivada")
            return create_access_token(subject=str(usuario.id))
