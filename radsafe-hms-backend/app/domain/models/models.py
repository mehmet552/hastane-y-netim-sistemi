from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float, Enum, DateTime, Table
from sqlalchemy.orm import relationship
import enum
from app.db.base import Base

class AccessStatus(str, enum.Enum):
    GRANTED = "GRANTED"
    DENIED = "DENIED"

# Association Table for Many-to-Many relationship between Role and Permission
role_permissions = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', Integer, ForeignKey('roles.id'), primary_key=True),
    Column('permission_id', Integer, ForeignKey('permissions.id'), primary_key=True)
)

class Permission(Base):
    __tablename__ = "permissions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    
    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    rfid_tag = Column(String, unique=True, index=True, nullable=True)
    
    role = relationship("Role", back_populates="users")
    profile = relationship("PersonnelProfile", back_populates="user", uselist=False)

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    
    users = relationship("User", back_populates="role")
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles")

class PersonnelProfile(Base):
    __tablename__ = "personnel_profiles"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    max_daily_radiation_limit_minutes = Column(Integer, default=240)
    
    user = relationship("User", back_populates="profile")
    department = relationship("Department", back_populates="personnel")
    access_logs = relationship("AccessLog", back_populates="personnel")

class Department(Base):
    __tablename__ = "departments"
    
    name = Column(String, unique=True, nullable=False)
    risk_level = Column(String, default="Moderate") # Low, Moderate, High
    
    personnel = relationship("PersonnelProfile", back_populates="department")
    areas = relationship("RestrictedArea", back_populates="department")

class RestrictedArea(Base):
    __tablename__ = "restricted_areas"
    
    name = Column(String, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    radiation_level = Column(Float, nullable=False) # mSv/h
    
    department = relationship("Department", back_populates="areas")

class AccessLog(Base):
    __tablename__ = "access_logs"
    
    personnel_id = Column(Integer, ForeignKey("personnel_profiles.id"), nullable=False)
    area_id = Column(Integer, ForeignKey("restricted_areas.id"), nullable=False)
    entry_time = Column(DateTime, nullable=True)
    exit_time = Column(DateTime, nullable=True)
    duration_minutes = Column(Float, nullable=True)
    status = Column(Enum(AccessStatus), nullable=False)
    deny_reason = Column(String, nullable=True)
    
    personnel = relationship("PersonnelProfile", back_populates="access_logs")
    area = relationship("RestrictedArea")

class Alert(Base):
    __tablename__ = "alerts"
    
    personnel_id = Column(Integer, ForeignKey("personnel_profiles.id"), nullable=False)
    alert_type = Column(String, nullable=False) # Limit_Warning, Limit_Exceeded
    message = Column(String, nullable=False)
    is_resolved = Column(Boolean, default=False)
    
    personnel = relationship("PersonnelProfile")
