from typing import Optional
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models import User, RoleBinding, StorageNode

class PermissionResolver:
    def __init__(self, db: Session):
        self.db = db

    def resolve(self, user_id: str, node_id: Optional[str], permission: str) -> bool:
        # Check global administrator permissions first
        global_binding = (
            self.db.query(RoleBinding)
            .filter_by(user_id=user_id, node_id=None)
            .first()
        )
        if global_binding and global_binding.role.name == "admin":
            return True

        if not node_id or node_id == "root":
            # Root checks fallback to global role assignments
            if global_binding:
                return getattr(global_binding.role, permission, False)
            return False

        # Climb parent ancestry tree
        curr_id = node_id
        while curr_id is not None:
            node = self.db.query(StorageNode).filter_by(id=curr_id).first()
            if not node:
                break

            # Short-circuit: owner has full access (except user management)
            if node.owner_id == user_id and permission != "can_manage_users":
                return True

            # Check direct role bindings on this specific node
            binding = (
                self.db.query(RoleBinding)
                .filter_by(user_id=user_id, node_id=curr_id)
                .first()
            )
            if binding:
                return getattr(binding.role, permission, False)

            # Move to parent node
            curr_id = node.parent_id

        # Fallback to global roles if no local hierarchy binding matched
        if global_binding:
            return getattr(global_binding.role, permission, False)
        return False

class RBACService:
    @staticmethod
    def has_permission(user: User, node_id: Optional[str], permission: str, db: Session) -> bool:
        resolver = PermissionResolver(db)
        return resolver.resolve(user.id, node_id, permission)

rbac_service = RBACService()

def rbac_required(permission: str):
    """
    FastAPI route dependency guard. Resolves permissions on the target node.
    Supports reading the target ID from 'node_id' or 'parent_id' query/path parameters automatically.
    """
    def dependency(
        node_id: Optional[str] = None,
        parent_id: Optional[str] = None,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ) -> User:
        # Determine target node ID
        target_id = node_id or parent_id
        if not rbac_service.has_permission(current_user, target_id, permission, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Missing required permission: {permission} on target node: {target_id or 'root'}."
            )
        return current_user
    return dependency
