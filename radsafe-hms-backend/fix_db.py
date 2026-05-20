import asyncio
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import engine, AsyncSessionLocal
from app.db.base import Base
from app.domain.models.models import Role, User, Department, RestrictedArea, PersonnelProfile, Permission
from app.core.security import get_password_hash

async def fix():
    async with engine.begin() as conn:
        print("Dropping all tables...")
        await conn.run_sync(Base.metadata.drop_all)
        print("Creating all tables...")
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        print("Inserting RBAC mock data...")
        
        # Permissions
        p_manage_users = Permission(name="manage_users", description="Can create, edit, delete users")
        p_view_logs = Permission(name="view_logs", description="Can view all access logs")
        p_manage_settings = Permission(name="manage_settings", description="Can manage system configuration")
        p_view_own_data = Permission(name="view_own_data", description="Can view own exposure logs")
        db.add_all([p_manage_users, p_view_logs, p_manage_settings, p_view_own_data])
        await db.commit()
        
        # Roles with Permissions
        admin_role = Role(name="Admin", description="System Administrator", permissions=[p_manage_users, p_view_logs, p_manage_settings])
        doctor_role = Role(name="Doctor", description="Medical Doctor", permissions=[p_view_own_data])
        tech_role = Role(name="Technician", description="Radiology Technician", permissions=[p_view_own_data])
        security_role = Role(name="Security Officer", description="Monitors access points", permissions=[p_view_logs])
        db.add_all([admin_role, doctor_role, tech_role, security_role])
        await db.commit()
        
        # Get departments
        radio_dept = Department(name="Radiology", risk_level="Moderate")
        nuc_dept = Department(name="Nuclear Medicine", risk_level="High")
        db.add_all([radio_dept, nuc_dept])
        await db.commit()
        
        xray_area = RestrictedArea(name="X-Ray Room 1", department_id=radio_dept.id, radiation_level=2.5)
        ct_area = RestrictedArea(name="CT Scan", department_id=radio_dept.id, radiation_level=5.0)
        db.add_all([xray_area, ct_area])
        await db.commit()
        
        # Add users
        user1 = User(username="admin", password_hash=get_password_hash("admin123"), role_id=admin_role.id)
        user2 = User(username="mchen", password_hash=get_password_hash("doctor123"), role_id=doctor_role.id, rfid_tag="RFID-001")
        user3 = User(username="erostova", password_hash=get_password_hash("tech123"), role_id=tech_role.id, rfid_tag="RFID-002")
        user4 = User(username="security", password_hash=get_password_hash("sec123"), role_id=security_role.id)
        db.add_all([user1, user2, user3, user4])
        await db.commit()
        
        prof1 = PersonnelProfile(user_id=user1.id, first_name="Sarah", last_name="Jenkins", department_id=radio_dept.id, max_daily_radiation_limit_minutes=240)
        prof2 = PersonnelProfile(user_id=user2.id, first_name="Michael", last_name="Chen", department_id=radio_dept.id, max_daily_radiation_limit_minutes=240)
        prof3 = PersonnelProfile(user_id=user3.id, first_name="Elena", last_name="Rostova", department_id=nuc_dept.id, max_daily_radiation_limit_minutes=240)
        db.add_all([prof1, prof2, prof3])
        await db.commit()
        print("Database RBAC rebuilt successfully!")

if __name__ == "__main__":
    asyncio.run(fix())
