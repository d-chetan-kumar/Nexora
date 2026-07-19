import datetime
import uuid
from sqlalchemy import String, Integer, DateTime, ForeignKey, text, BigInteger, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, 
        default=datetime.datetime.utcnow, 
        server_default=text("TIMEZONE('utc', NOW())")
    )

    quota = relationship("UserQuota", uselist=False, back_populates="user", cascade="all, delete-orphan")
    role_bindings = relationship("RoleBinding", back_populates="user", cascade="all, delete-orphan")
    nodes = relationship("StorageNode", back_populates="owner", cascade="all, delete-orphan")

class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False) # 'owner', 'editor', 'viewer', 'admin'
    can_upload: Mapped[bool] = mapped_column(Boolean, default=False)
    can_download: Mapped[bool] = mapped_column(Boolean, default=False)
    can_delete: Mapped[bool] = mapped_column(Boolean, default=False)
    can_share: Mapped[bool] = mapped_column(Boolean, default=False)
    can_manage_users: Mapped[bool] = mapped_column(Boolean, default=False)

    bindings = relationship("RoleBinding", back_populates="role", cascade="all, delete-orphan")

class RoleBinding(Base):
    __tablename__ = "role_bindings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role_id: Mapped[int] = mapped_column(Integer, ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    node_id: Mapped[str] = mapped_column(String(36), ForeignKey("storage_nodes.id", ondelete="CASCADE"), nullable=True)

    user = relationship("User", back_populates="role_bindings")
    role = relationship("Role", back_populates="bindings")
    node = relationship("StorageNode", back_populates="role_bindings")

class UserQuota(Base):
    __tablename__ = "user_quotas"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    quota_bytes: Mapped[int] = mapped_column(BigInteger, default=500 * 1024 * 1024) # 500 MB Default
    used_bytes: Mapped[int] = mapped_column(BigInteger, default=0)

    user = relationship("User", back_populates="quota")

class StorageNode(Base):
    __tablename__ = "storage_nodes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False) # 'folder' or extension (pdf, png, etc.)
    parent_id: Mapped[str] = mapped_column(String(36), ForeignKey("storage_nodes.id", ondelete="CASCADE"), nullable=True)
    size: Mapped[int] = mapped_column(BigInteger, nullable=True)
    owner_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    backend: Mapped[str] = mapped_column(String(50), nullable=True) # 'b2' or 'e2'
    backend_key: Mapped[str] = mapped_column(String(255), nullable=True)
    trashed: Mapped[bool] = mapped_column(Boolean, default=False)
    starred: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, 
        default=datetime.datetime.utcnow, 
        server_default=text("TIMEZONE('utc', NOW())")
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, 
        default=datetime.datetime.utcnow, 
        onupdate=datetime.datetime.utcnow,
        server_default=text("TIMEZONE('utc', NOW())")
    )

    owner = relationship("User", back_populates="nodes")
    children = relationship("StorageNode", back_populates="parent", cascade="all, delete-orphan")
    parent = relationship("StorageNode", back_populates="children", remote_side=[id])
    role_bindings = relationship("RoleBinding", back_populates="node", cascade="all, delete-orphan")

class PoolUsage(Base):
    __tablename__ = "pool_usage"

    backend: Mapped[str] = mapped_column(String(50), primary_key=True) # 'b2', 'e2'
    used_bytes: Mapped[int] = mapped_column(BigInteger, default=0)
