"""Dependencias de sesión y rol (la sesión viaja en la cookie HttpOnly)."""

from typing import Callable, Optional

from fastapi import Cookie, Depends, HTTPException, status

from app.core.database import session_factory
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario

COOKIE_NAME = "access_token"
CUENTA_DESACTIVADA = "Cuenta de usuario desactivada"


def _no_autenticado(detail: str = "No autenticado") -> HTTPException:
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


def get_current_user(
    access_token: Optional[str] = Cookie(default=None),
) -> Usuario:
    """Lee la cookie, valida firma y expiración y carga el usuario (401 si falla)."""
    if not access_token:
        raise _no_autenticado()
    payload = decode_access_token(access_token)
    if payload is None or "sub" not in payload:
        raise _no_autenticado("Sesión inválida o vencida")
    try:
        user_id = int(payload["sub"])
    except (TypeError, ValueError):
        raise _no_autenticado("Sesión inválida o vencida")
    with session_factory() as session:
        user = session.get(Usuario, user_id)
    if user is None:
        raise _no_autenticado("Sesión inválida o vencida")
    return user


def get_current_active_user(user: Usuario = Depends(get_current_user)) -> Usuario:
    """Rechaza usuarios dados de baja lógica (400)."""
    if user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=CUENTA_DESACTIVADA
        )
    return user


def require_role(roles: list[str]) -> Callable[[Usuario], Usuario]:
    """Exige que el usuario tenga alguno de los roles indicados (403 si no)."""

    def checker(user: Usuario = Depends(get_current_active_user)) -> Usuario:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para realizar esta acción",
            )
        return user

    return checker
