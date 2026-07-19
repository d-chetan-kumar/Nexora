from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List

class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

class NewFolderRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    parent_id: Optional[str] = "root"

class RenameRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)

class ShareRequest(BaseModel):
    email: EmailStr
    role_name: str = Field(default="viewer") # 'editor', 'viewer'
    node_id: str
