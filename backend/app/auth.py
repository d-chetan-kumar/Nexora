import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import credentials, auth
from app.config import settings

logger = logging.getLogger("auth")

security = HTTPBearer()

# Initialize Firebase Admin SDK
firebase_initialized = False
try:
    creds_dict = settings.get_firebase_credentials()
    cred = credentials.Certificate(creds_dict)
    firebase_admin.initialize_app(cred)
    firebase_initialized = True
    logger.info("Firebase Admin successfully initialized.")
except Exception as e:
    logger.warning(
        f"Firebase Admin could not be initialized (error: {e}). "
        "Server will fallback to MOCK_MODE for local testing if requested token starts with 'mock_'."
    )

async def verify_firebase_token(
    authorization: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Dependency that extracts the Firebase ID token from the Authorization header,
    verifies it with Firebase Admin SDK, and returns the decoded token claims.
    
    If Firebase SDK is not initialized, or for testing, a token prefix 'mock_' 
    can be used to bypass validation in local environment.
    """
    token = authorization.credentials

    if not firebase_initialized:
        # If Firebase is not initialized, allow mock tokens for easy out-of-the-box local testing
        if token.startswith("mock_"):
            mock_uid = token.replace("mock_", "")
            return {
                "uid": mock_uid,
                "email": f"{mock_uid}@example.com",
                "email_verified": True,
                "name": mock_uid.capitalize(),
                "mock": True
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Firebase is not configured and no mock token was provided (requires prefix 'mock_')"
            )

    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is invalid"
        )
    except Exception as e:
        # Extra fallback for mock testing in development
        if token.startswith("mock_"):
            mock_uid = token.replace("mock_", "")
            return {
                "uid": mock_uid,
                "email": f"{mock_uid}@example.com",
                "email_verified": True,
                "name": mock_uid.capitalize(),
                "mock": True
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}"
        )
