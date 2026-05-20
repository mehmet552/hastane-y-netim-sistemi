import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.db.session import engine, AsyncSessionLocal
from app.db.base import Base
from app.domain.models.models import (
    Role, User, Department, RestrictedArea, PersonnelProfile, Permission,
)
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)

PERMISSIONS = [
    ("manage_users", "Kullanıcı ve personel yönetimi"),
    ("view_logs", "Tüm erişim kayıtlarını görüntüleme"),
    ("manage_settings", "Sistem ayarları"),
    ("view_own_data", "Kendi maruziyet verilerini görüntüleme"),
]


async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def ensure_permissions(db: AsyncSession):
    perm_map = {}
    for name, desc in PERMISSIONS:
        result = await db.execute(select(Permission).filter(Permission.name == name))
        perm = result.scalars().first()
        if not perm:
            perm = Permission(name=name, description=desc)
            db.add(perm)
            await db.flush()
        perm_map[name] = perm
    await db.commit()

    roles_result = await db.execute(select(Role).options(selectinload(Role.permissions)))
    roles = {r.name: r for r in roles_result.scalars().all()}

    admin = roles.get("Admin")
    doctor = roles.get("Doctor")
    tech = roles.get("Technician")

    if admin and len(admin.permissions) == 0:
        admin.permissions = [
            perm_map["manage_users"],
            perm_map["view_logs"],
            perm_map["manage_settings"],
        ]
    if doctor and len(doctor.permissions) == 0:
        doctor.permissions = [perm_map["view_own_data"]]
    if tech and len(tech.permissions) == 0:
        tech.permissions = [perm_map["view_own_data"]]
    await db.commit()


async def init_mock_data():
    async with AsyncSessionLocal() as db:
        await ensure_permissions(db)

        result = await db.execute(select(User))
        if result.scalars().first():
            return

        logger.info("Initializing mock data...")

        admin_role = Role(name="Admin", description="Sistem Yöneticisi")
        doctor_role = Role(name="Doctor", description="Doktor")
        tech_role = Role(name="Technician", description="Radyoloji Teknisyeni")
        db.add_all([admin_role, doctor_role, tech_role])
        await db.commit()
        await ensure_permissions(db)

        radio_dept = Department(name="Radyoloji", risk_level="Orta")
        nuc_dept = Department(name="Nükleer Tıp", risk_level="Yüksek")
        db.add_all([radio_dept, nuc_dept])
        await db.commit()

        xray_area = RestrictedArea(name="Röntgen Odası 1", department_id=radio_dept.id, radiation_level=2.5)
        ct_area = RestrictedArea(name="BT Tarama", department_id=radio_dept.id, radiation_level=5.0)
        pet_area = RestrictedArea(name="PET-CT Odası", department_id=nuc_dept.id, radiation_level=12.0)
        db.add_all([xray_area, ct_area, pet_area])
        await db.commit()

        user1 = User(username="admin", password_hash=get_password_hash("admin"), role_id=admin_role.id)
        user2 = User(username="mchen", password_hash=get_password_hash("pass"), role_id=doctor_role.id, rfid_tag="RFID-001")
        user3 = User(username="erostova", password_hash=get_password_hash("pass"), role_id=tech_role.id, rfid_tag="RFID-002")
        db.add_all([user1, user2, user3])
        await db.commit()

        prof1 = PersonnelProfile(user_id=user1.id, first_name="Sarah", last_name="Jenkins", department_id=radio_dept.id, max_daily_radiation_limit_minutes=240)
        prof2 = PersonnelProfile(user_id=user2.id, first_name="Michael", last_name="Chen", department_id=radio_dept.id, max_daily_radiation_limit_minutes=240)
        prof3 = PersonnelProfile(user_id=user3.id, first_name="Elena", last_name="Rostova", department_id=nuc_dept.id, max_daily_radiation_limit_minutes=240)
        db.add_all([prof1, prof2, prof3])
        await db.commit()

        logger.info("Mock data created successfully.")


async def init_db():
    await init_models()
    async with AsyncSessionLocal() as db:
        await ensure_permissions(db)
    await init_mock_data()
