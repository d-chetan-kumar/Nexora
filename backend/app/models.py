import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    firebase_uid: Mapped[str] = mapped_column(String(128), primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, 
        default=datetime.datetime.utcnow, 
        server_default=text("TIMEZONE('utc', NOW())")
    )

    role_assignments = relationship("RoleAssignment", back_populates="user", cascade="all, delete-orphan")
    files = relationship("File", back_populates="owner", cascade="all, delete-orphan")

class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)

    assignments = relationship("RoleAssignment", back_populates="role", cascade="all, delete-orphan")

class RoleAssignment(Base):
    __tablename__ = "role_assignments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(128), ForeignKey("users.firebase_uid", ondelete="CASCADE"), nullable=False)
    role_id: Mapped[int] = mapped_column(Integer, ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    scope: Mapped[str] = mapped_column(String(255), nullable=False, default="global")

    user = relationship("User", back_populates="role_assignments")
    role = relationship("Role", back_populates="assignments")

class File(Base):
    __tablename__ = "files"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    path: Mapped[str] = mapped_column(String(1024), nullable=False)
    size: Mapped[int] = mapped_column(Integer, nullable=False)
    owner_id: Mapped[str] = mapped_column(String(128), ForeignKey("users.firebase_uid", ondelete="CASCADE"), nullable=False)
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

    owner = relationship("User", back_populates="files")
