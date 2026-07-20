import datetime
import uuid
import sys
import os
from contextlib import asynccontextmanager
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from jose import jwt, JWTError

# Path injection to locate app module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import get_db, SessionLocal
from app.config import settings
from app.models import Base, User, Role, RoleBinding, UserQuota, StorageNode, PoolUsage
from app.auth import get_current_user, hash_password, verify_password, create_access_token, create_refresh_token
from app.storage import storage_router
from app.rbac import rbac_required, rbac_service
from app.schemas import SignupRequest, LoginRequest, RefreshRequest, NewFolderRequest, RenameRequest, ShareRequest, TokenResponse

# Lifespan manager to seed database default values
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Seeding database roles and pool counters on start
    db = SessionLocal()
    try:
        # Seeding Roles
        roles_spec = {
            "owner": {"can_upload": True, "can_download": True, "can_delete": True, "can_share": True, "can_manage_users": True},
            "editor": {"can_upload": True, "can_download": True, "can_delete": True, "can_share": False, "can_manage_users": False},
            "viewer": {"can_upload": False, "can_download": True, "can_delete": False, "can_share": False, "can_manage_users": False},
            "admin": {"can_upload": True, "can_download": True, "can_delete": True, "can_share": True, "can_manage_users": True}
        }
        for r_name, r_perms in roles_spec.items():
            role = db.query(Role).filter_by(name=r_name).first()
            if not role:
                role = Role(name=r_name, **r_perms)
                db.add(role)

        # Seeding Pool usages
        for pool_name in ["b2", "e2"]:
            pool = db.query(PoolUsage).filter_by(backend=pool_name).first()
            if not pool:
                pool = PoolUsage(backend=pool_name, used_bytes=0)
                db.add(pool)

        db.commit()
    except Exception as e:
        print(f"[STARTUP SEEDING WARNING]: {e}")
    finally:
        db.close()
    yield

app = FastAPI(
    title="Nexora Gateway Engine API",
    description="Multi-tenant cloud storage console with pooled free-tier routing & hierarchical RBAC",
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.ALLOWED_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "service": "nexora-gateway-engine"
    }

# --- AUTHENTICATION ROUTES ---

@app.post("/auth/signup", status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    if db.query(User).filter_by(email=payload.email).first():
        raise HTTPException(status_code=409, detail="Email address is already registered.")

    # Create user
    user = User(email=payload.email, hashed_password=hash_password(payload.password))
    db.add(user)
    db.flush()

    # Assign default quota
    db.add(UserQuota(user_id=user.id))

    # Bind owner role globally (node_id = None)
    owner_role = db.query(Role).filter_by(name="owner").first()
    if owner_role:
        db.add(RoleBinding(user_id=user.id, role_id=owner_role.id, node_id=None))

    db.commit()
    return {"status": "created", "user_id": user.id}

@app.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return {
        "access_token": create_access_token(user.id),
        "refresh_token": create_refresh_token(user.id),
        "token_type": "bearer"
    }

@app.post("/auth/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    try:
        decoded = jwt.decode(payload.refresh_token, settings.JWT_SECRET, algorithms=["HS256"])
        if decoded.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type.")
        user_id = decoded.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token.")

    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User no longer exists.")

    return {
        "access_token": create_access_token(user.id),
        "refresh_token": create_refresh_token(user.id),
        "token_type": "bearer"
    }

@app.get("/users/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    quota = db.query(UserQuota).filter_by(user_id=current_user.id).first()
    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "quota": {
            "used_bytes": quota.used_bytes if quota else 0,
            "quota_bytes": quota.quota_bytes if quota else 524288000
        }
    }

# --- STORAGE NODE ROUTES ---

@app.get("/nodes")
def list_nodes(
    parent_id: str = "root",
    tab: str = "all",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lists files and directories. Implements specific listings for
    starred, shared, trashed, or normal parent navigation directories.
    """
    if tab == "trash":
        nodes = db.query(StorageNode).filter_by(owner_id=current_user.id, trashed=True).all()
    elif tab == "starred":
        nodes = db.query(StorageNode).filter_by(owner_id=current_user.id, starred=True, trashed=False).all()
    elif tab == "shared":
        # Get nodes shared with user (where user has RoleBindings and is not the owner)
        bindings = db.query(RoleBinding).filter(RoleBinding.user_id == current_user.id, RoleBinding.node_id != None).all()
        shared_ids = [b.node_id for b in bindings]
        nodes = db.query(StorageNode).filter(
            StorageNode.id.in_(shared_ids),
            StorageNode.owner_id != current_user.id,
            StorageNode.trashed == False
        ).all()
    else:
        # Standard directory browsing
        parent_uuid = None if parent_id == "root" else parent_id
        
        # Resolve folders/files user owns in directory
        owned = db.query(StorageNode).filter_by(owner_id=current_user.id, parent_id=parent_uuid, trashed=False).all()
        
        # If root, resolve nodes shared directly with user at root level
        shared = []
        if parent_id == "root":
            bindings = db.query(RoleBinding).filter(RoleBinding.user_id == current_user.id, RoleBinding.node_id != None).all()
            shared_ids = [b.node_id for b in bindings]
            if shared_ids:
                shared = db.query(StorageNode).filter(
                    StorageNode.id.in_(shared_ids),
                    StorageNode.owner_id != current_user.id,
                    StorageNode.parent_id == None,
                    StorageNode.trashed == False
                ).all()
        nodes = owned + shared

    # Format nodes for JSON output
    formatted = []
    for n in nodes:
        bindings = db.query(RoleBinding).filter(RoleBinding.node_id == n.id, RoleBinding.user_id != n.owner_id).all()
        shared_emails = [b.user.email for b in bindings]

        formatted.append({
            "id": n.id,
            "name": n.name,
            "type": n.type,
            "parentId": n.parent_id or "root",
            "size": n.size,
            "starred": n.starred,
            "trashed": n.trashed,
            "createdAt": n.created_at.isoformat(),
            "updatedAt": n.updated_at.isoformat(),
            "owner": n.owner.email,
            "sharedWith": shared_emails,
            "backend": n.backend,
            "auditLog": [
                {"action": "Created Node", "user": n.owner.email, "date": n.created_at.isoformat()}
            ]
        })
    return formatted

@app.post("/nodes/folder", status_code=status.HTTP_201_CREATED)
def create_folder(
    payload: NewFolderRequest,
    current_user: User = Depends(rbac_required("can_upload")),
    db: Session = Depends(get_db)
):
    parent_uuid = None if payload.parent_id == "root" else payload.parent_id

    # Create folder node
    folder = StorageNode(
        name=payload.name,
        type="folder",
        parent_id=parent_uuid,
        size=None,
        owner_id=current_user.id
    )
    db.add(folder)
    db.commit()
    return {"status": "created", "folder_id": folder.id}

@app.post("/nodes/upload")
async def upload_file(
    file: UploadFile = File(...),
    parent_id: str = "root",
    current_user: User = Depends(rbac_required("can_upload")),
    db: Session = Depends(get_db)
):
    # 1. Resolve size
    file_size = file.size
    if file_size is None:
        content = await file.read()
        file_size = len(content)
        file.file.seek(0)

    # 2. Check quota
    quota = db.query(UserQuota).filter_by(user_id=current_user.id).first()
    if not quota:
        quota = UserQuota(user_id=current_user.id)
        db.add(quota)
        db.flush()

    if quota.used_bytes + file_size > quota.quota_bytes:
        raise HTTPException(status_code=413, detail="Insufficient storage quota available.")

    # 3. Router picks S3 backend
    provider = storage_router.pick_provider(file_size, db)

    # 4. Save file to cloud
    key = f"{current_user.id}/{uuid.uuid4()}_{file.filename}"
    provider.save_file(key, file.file)

    # 5. Create storage metadata entry
    parent_uuid = None if parent_id == "root" else parent_id
    node = StorageNode(
        name=file.filename,
        type=file.filename.split(".")[-1] if "." in file.filename else "txt",
        parent_id=parent_uuid,
        size=file_size,
        owner_id=current_user.id,
        backend=provider.name,
        backend_key=key
    )

    # 6. Atomic quota & pool increment
    quota.used_bytes += file_size
    pool = db.query(PoolUsage).filter_by(backend=provider.name).first()
    if pool:
        pool.used_bytes += file_size

    db.add(node)
    db.commit()
    return {"status": "success", "file_id": node.id, "backend": provider.name}

@app.get("/nodes/download/{node_id}")
async def download_file(
    node_id: str,
    current_user: User = Depends(rbac_required("can_download")),
    db: Session = Depends(get_db)
):
    node = db.query(StorageNode).filter_by(id=node_id).first()
    if not node or node.type == "folder":
        raise HTTPException(status_code=404, detail="File node not found.")

    # Resolve active S3 provider
    providers = {p.name: p for p in storage_router.providers}
    provider = providers.get(node.backend)
    if not provider:
        raise HTTPException(status_code=500, detail=f"Database references unresolvable backend: {node.backend}")

    # Stream file binary back to client
    stream = provider.get_file_stream(node.backend_key)
    return StreamingResponse(
        stream,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{node.name}"'}
    )

@app.delete("/nodes/{node_id}")
def delete_node(
    node_id: str,
    current_user: User = Depends(rbac_required("can_delete")),
    db: Session = Depends(get_db)
):
    node = db.query(StorageNode).filter_by(id=node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Storage node not found.")

    if not node.trashed:
        # First-pass delete: send to Trash
        node.trashed = True
        db.commit()
        return {"status": "trashed", "node_id": node.id}

    # Second-pass delete: delete forever
    quota = db.query(UserQuota).filter_by(user_id=node.owner_id).first()
    providers = {p.name: p for p in storage_router.providers}

    # Recursive delete helper
    def recursive_delete(target_node):
        if target_node.type == "folder":
            children = db.query(StorageNode).filter_by(parent_id=target_node.id).all()
            for child in children:
                recursive_delete(child)
        else:
            # Reclaim quota & pool usage
            if quota and target_node.size:
                quota.used_bytes = max(0, quota.used_bytes - target_node.size)
            pool = db.query(PoolUsage).filter_by(backend=target_node.backend).first()
            if pool and target_node.size:
                pool.used_bytes = max(0, pool.used_bytes - target_node.size)
            
            # Delete S3 binary
            provider = providers.get(target_node.backend)
            if provider and target_node.backend_key:
                provider.delete_file(target_node.backend_key)

        db.delete(target_node)

    recursive_delete(node)
    db.commit()
    return {"status": "deleted_permanently"}

@app.post("/nodes/restore/{node_id}")
def restore_node(
    node_id: str,
    current_user: User = Depends(rbac_required("can_delete")),
    db: Session = Depends(get_db)
):
    node = db.query(StorageNode).filter_by(id=node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Storage node not found.")

    # Recursive restore
    def recursive_restore(target_node):
        target_node.trashed = False
        if target_node.type == "folder":
            children = db.query(StorageNode).filter_by(parent_id=target_node.id).all()
            for child in children:
                recursive_restore(child)

    recursive_restore(node)
    db.commit()
    return {"status": "restored", "node_id": node.id}

@app.post("/nodes/star/{node_id}")
def star_node(
    node_id: str,
    current_user: User = Depends(rbac_required("can_download")),
    db: Session = Depends(get_db)
):
    node = db.query(StorageNode).filter_by(id=node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Storage node not found.")

    node.starred = not node.starred
    db.commit()
    return {"status": "success", "starred": node.starred}

@app.post("/nodes/rename/{node_id}")
def rename_node(
    node_id: str,
    payload: RenameRequest,
    current_user: User = Depends(rbac_required("can_upload")),
    db: Session = Depends(get_db)
):
    node = db.query(StorageNode).filter_by(id=node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Storage node not found.")

    node.name = payload.name
    node.updated_at = datetime.datetime.utcnow()
    db.commit()
    return {"status": "success", "name": node.name}

@app.post("/nodes/share")
def share_node(
    payload: ShareRequest,
    current_user: User = Depends(rbac_required("can_share")),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter_by(email=payload.email).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Target collaborator not found.")

    role = db.query(Role).filter_by(name=payload.role_name).first()
    if not role:
        raise HTTPException(status_code=404, detail="Requested role not found.")

    # Prevent duplicate bindings
    existing = db.query(RoleBinding).filter_by(
        user_id=target_user.id,
        node_id=payload.node_id
    ).first()
    
    if existing:
        existing.role_id = role.id
    else:
        db.add(RoleBinding(
            user_id=target_user.id,
            role_id=role.id,
            node_id=payload.node_id
        ))

    db.commit()
    return {"status": "success", "shared_with": target_user.email, "role": role.name}

# --- STATIC FRONTEND ROUTING LAYER ---

# Resolve build output directory path
frontend_dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))

if os.path.exists(frontend_dist_path):
    assets_path = os.path.join(frontend_dist_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.get("/{catchall:path}")
    async def serve_frontend(catchall: str):
        # Resolve target static file in dist folder (e.g. favicon, index.html, etc.)
        file_path = os.path.join(frontend_dist_path, catchall)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)

        # Fallback to index.html to let React Router/state router take over SPA URLs
        index_file = os.path.join(frontend_dist_path, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Static frontend build index file not found. Run 'npm run build' inside frontend."
        )

