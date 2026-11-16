from sqlalchemy.exc import IntegrityError

from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._get_activa(uow, categoria_id))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        nombre = data.nombre.strip()
        with self.uow as uow:
            if uow.categorias.get_by_nombre(nombre) is not None:
                raise NombreDuplicado(f"Ya existe una categoría con el nombre '{nombre}'")
            categoria = Categoria(nombre=nombre, descripcion=data.descripcion)
            try:
                uow.categorias.add(categoria)
            except IntegrityError:
                raise NombreDuplicado(f"Ya existe una categoría con el nombre '{nombre}'")
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        cambios = data.model_dump(exclude_unset=True)
        with self.uow as uow:
            categoria = self._get_activa(uow, categoria_id)
            nuevo_nombre = cambios.get("nombre")
            if nuevo_nombre is not None:
                nuevo_nombre = nuevo_nombre.strip()
                otra = uow.categorias.get_by_nombre(nuevo_nombre)
                if otra is not None and otra.id != categoria.id:
                    raise NombreDuplicado(f"Ya existe una categoría con el nombre '{nuevo_nombre}'")
                categoria.nombre = nuevo_nombre
            if "descripcion" in cambios:
                categoria.descripcion = cambios["descripcion"]
            try:
                uow.categorias.add(categoria)
            except IntegrityError:
                raise NombreDuplicado("Ya existe una categoría con ese nombre")
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        """Baja lógica. No libera el nombre ni da de baja sus productos."""
        with self.uow as uow:
            categoria = self._get_activa(uow, categoria_id)
            categoria.activo = False
            uow.categorias.add(categoria)

    @staticmethod
    def _get_activa(uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada("Categoría no encontrada")
        return categoria
