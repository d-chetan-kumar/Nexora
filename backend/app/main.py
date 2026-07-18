from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.config import settings
from app.database import get_db
from app.models import User, RoleAssignment, Role
from app.auth import verify_firebase_token
import datetime

app = FastAPI(
    title="Nexora Gateway API",
    description="Secure entrypoint API managing authorization verification, users synchronization and access telemetry",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.ALLOWED_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "service": "nexora-gateway-engine"
    }

@app.post("/auth/session")
async def verify_and_sync_session(
    claims: dict = Depends(verify_firebase_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Verifies the incoming Firebase Bearer ID token.
    Upserts the validated identity into Postgres to establish database-level synchronization.
    Assigns a default global role ('Viewer' or 'Admin' for the first user).
    """
    uid = claims.get("uid")
    email = claims.get("email")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verified token is missing email claims"
        )

    # Check if user already exists
    result = await db.execute(select(User).filter_by(firebase_uid=uid))
    user = result.scalar_one_or_none()

    if not user:
        # User initialization
        user = User(firebase_uid=uid, email=email)
        db.add(user)
        await db.flush() # Secure user.firebase_uid in session

        try:
            # Query or seed default roles
            # First check if there's any user count in the database
            count_result = await db.execute(select(User))
            is_first_user = len(count_result.all()) <= 1

            target_role_name = "Admin" if is_first_user else "Viewer"
            
            # Fetch target role
            role_result = await db.execute(select(Role).filter_by(name=target_role_name))
            role = role_result.scalar_one_or_none()

            if not role:
                desc = "Full system administration" if target_role_name == "Admin" else "Default resource viewer"
                role = Role(name=target_role_name, description=desc)
                db.add(role)
                await db.flush()

            # Create assignment
            assignment = RoleAssignment(user_id=uid, role_id=role.id, scope="global")
            db.add(assignment)
        except Exception as e:
            # Non-blocking schema fallback
            print(f"Role provisioning warning: {e}")

        await db.commit()
        await db.refresh(user)

    return {
        "status": "synchronized",
        "firebase_uid": user.firebase_uid,
        "email": user.email,
        "created_at": user.created_at.isoformat()
    }

@app.get("/users/me")
async def get_current_user_profile(
    claims: dict = Depends(verify_firebase_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns user details alongside associated database roles and scopes.
    """
    uid = claims.get("uid")

    result = await db.execute(
        select(User)
        .filter_by(firebase_uid=uid)
        .options(selectinload(User.role_assignments).selectinload(RoleAssignment.role))
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User details not found. Synchronize session using /auth/session first."
        )

    roles = []
    for ass in user.role_assignments:
        roles.append({
            "role": ass.role.name,
            "scope": ass.scope
        })

    return {
        "firebase_uid": user.firebase_uid,
        "email": user.email,
        "created_at": user.created_at.isoformat(),
        "roles": roles
    }
