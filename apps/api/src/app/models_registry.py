"""Import every model module so Base.metadata is complete for Alembic autogenerate."""

from app.modules.audit import models as audit_models  # noqa: F401
from app.modules.auth import models as auth_models  # noqa: F401
from app.modules.contact import models as contact_models  # noqa: F401
from app.modules.content import models as content_models  # noqa: F401
