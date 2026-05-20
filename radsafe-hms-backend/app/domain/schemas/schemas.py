from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.domain.models.models import AccessStatus

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class PermissionResponse(BaseModel):
    id: int
    name: str

class RoleResponse(BaseModel):
    id: int
    name: str
    permissions: List[PermissionResponse] = []

    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    username: str
    is_active: Optional[bool] = True
    rfid_tag: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role_id: int

class UserResponse(UserBase):
    id: int
    role: RoleResponse
    
    class Config:
        from_attributes = True

# Auth schemas
class LoginRequest(BaseModel):
    username: str
    password: str

# Personnel Profile Schemas
class PersonnelProfileBase(BaseModel):
    first_name: str
    last_name: str
    department_id: int
    max_daily_radiation_limit_minutes: int = 240

class PersonnelProfileCreate(PersonnelProfileBase):
    user_id: int

class PersonnelProfileResponse(PersonnelProfileBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

class EmployeeCreate(BaseModel):
    username: str
    password: str
    role_id: int
    rfid_tag: str
    first_name: str
    last_name: str
    department_id: int
    max_daily_radiation_limit_minutes: int = 240

class EmployeeResponse(BaseModel):
    id: int
    username: str
    rfid_tag: Optional[str] = None
    role_id: int
    role_name: str
    first_name: str
    last_name: str
    department_id: int
    department_name: str
    max_daily_radiation_limit_minutes: int
    is_active: bool = True

# Access Control Schemas
class AccessScanRequest(BaseModel):
    rfid_tag: str
    area_id: int

class AccessScanResponse(BaseModel):
    status: AccessStatus
    message: str
    personnel_name: Optional[str] = None
    remaining_minutes: Optional[float] = None

class AccessLogResponse(BaseModel):
    id: int
    personnel_id: int
    area_id: int
    entry_time: Optional[datetime]
    exit_time: Optional[datetime]
    duration_minutes: Optional[float]
    status: AccessStatus
    deny_reason: Optional[str]
    
    class Config:
        from_attributes = True
