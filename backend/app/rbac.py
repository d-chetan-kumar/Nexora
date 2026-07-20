import time
from typing import Optional, Dict, Tuple
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models import User, RoleBinding, StorageNode

class PermissionCache:
    def __init__(self, ttl_seconds: int = 30):
        self.ttl = ttl_seconds
        self.cache: Dict[Tuple[str, Optional[str], str], Tuple[bool, float]] = {}

    def get(self, user_id: str, node_id: Optional[str], permission: str) -> Optional[bool]:
        key = (user_id, node_id, permission)
        if key in self.cache:
            val, expiry = self.cache[key]
            if time.time() < expiry:
                return val
            else:
                del self.cache[key]
        return None

    def set(self, user_id: str, node_id: Optional[str], permission: str, value: bool):
        key = (user_id, node_id, permission)
        self.cache[key] = (value, time.time() + self.ttl)

    def invalidate_user(self, user_id: str):
        keys_to_del = [k for k in self.cache.keys() if k[0] == user_id]
        for k in keys_to_del:
            self.cache.pop(k, None)

    def invalidate_node(self, node_id: str):
        keys_to_del = [k for k in self.cache.keys() if k[1] == node_id]
        for k in keys_to_del:
            self.cache.pop(k, None)

    def clear(self):
        self.cache.clear()

# Global permission cache instance
permission_cache = PermissionCache(ttl_seconds=30)

class PermissionResolver:
    def __init__(self, db: Session):
        self.db = db

    def resolve(self, user_id: str, node_id: Optional[str], permission: str) -> bool:
        # Check cache first
        cached_result = permission_cache.get(user_id, node_id, permission)
        if cached_result is not None:
            return cached_result

        result = self._resolve_from_db(user_id, node_id, permission)
        
        # Save to cache
        permission_cache.set(user_id, node_id, permission, result)
        return result

    def _resolve_from_db(self, user_id: str, node_id: Optional[str], permission: str) -> bool:
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
