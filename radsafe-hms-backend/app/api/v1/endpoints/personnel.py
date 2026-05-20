from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.api import deps
from app.core.security import get_password_hash
from app.db.session import get_db
from app.domain.models.models import User, Role, Department, PersonnelProfile
from app.domain.schemas.schemas import EmployeeCreate, EmployeeResponse

router = APIRouter()


@router.get("", response_model=List[EmployeeResponse])
async def list_employees(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(deps.RoleChecker(["manage_users"])),
) -> Any:
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.role),
            selectinload(User.profile).selectinload(PersonnelProfile.department),
        )
        .order_by(User.id)
    )
    users = result.scalars().all()
    employees = []
    for u in users:
        if not u.profile:
            continue
        p = u.profile
        employees.append(
            EmployeeResponse(
                id=u.id,
                username=u.username,
                rfid_tag=u.rfid_tag,
                role_id=u.role_id,
                role_name=u.role.name if u.role else "",
                first_name=p.first_name,
                last_name=p.last_name,
                department_id=p.department_id,
                department_name=p.department.name if p.department else "",
                max_daily_radiation_limit_minutes=p.max_daily_radiation_limit_minutes,
                is_active=u.is_active,
            )
        )
    return employees


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(
    body: EmployeeCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(deps.RoleChecker(["manage_users"])),
) -> Any:
    existing = await db.execute(select(User).filter(User.username == body.username))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten kayıtlı.")

    if body.rfid_tag:
        rfid_check = await db.execute(select(User).filter(User.rfid_tag == body.rfid_tag))
        if rfid_check.scalars().first():
            raise HTTPException(status_code=400, detail="Bu RFID etiketi zaten kullanılıyor.")

    role = await db.get(Role, body.role_id)
    if not role:
        raise HTTPException(status_code=400, detail="Geçersiz rol.")

    dept = await db.get(Department, body.department_id)
    if not dept:
        raise HTTPException(status_code=400, detail="Geçersiz departman.")

    user = User(
        username=body.username,
        password_hash=get_password_hash(body.password),
        role_id=body.role_id,
        rfid_tag=body.rfid_tag,
        is_active=True,
    )
    db.add(user)
    await db.flush()

    profile = PersonnelProfile(
        user_id=user.id,
        first_name=body.first_name,
        last_name=body.last_name,
        department_id=body.department_id,
        max_daily_radiation_limit_minutes=body.max_daily_radiation_limit_minutes,
    )
    db.add(profile)
    await db.commit()
    await db.refresh(user)
    await db.refresh(profile)

    return EmployeeResponse(
        id=user.id,
        username=user.username,
        rfid_tag=user.rfid_tag,
        role_id=user.role_id,
        role_name=role.name,
        first_name=profile.first_name,
        last_name=profile.last_name,
        department_id=profile.department_id,
        department_name=dept.name,
        max_daily_radiation_limit_minutes=profile.max_daily_radiation_limit_minutes,
        is_active=user.is_active,
    )


@router.get("/meta")
async def personnel_meta(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(deps.RoleChecker(["manage_users"])),
) -> Any:
    roles = (await db.execute(select(Role).order_by(Role.id))).scalars().all()
    departments = (await db.execute(select(Department).order_by(Department.id))).scalars().all()
    return {
        "roles": [{"id": r.id, "name": r.name} for r in roles],
        "departments": [{"id": d.id, "name": d.name, "risk_level": d.risk_level} for d in departments],
    }
