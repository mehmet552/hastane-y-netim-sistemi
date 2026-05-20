from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from datetime import datetime
from app.db.session import get_db
from app.api import deps
from app.domain.models.models import User, AccessLog, AccessStatus
from app.domain.schemas.schemas import AccessScanRequest, AccessScanResponse
from app.services.legal_rule_engine import LegalRuleEngine

router = APIRouter()
rule_engine = LegalRuleEngine()


@router.post("/scan", response_model=AccessScanResponse)
async def scan_rfid(request: AccessScanRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).options(selectinload(User.profile)).filter(User.rfid_tag == request.rfid_tag)
    )
    user = result.scalars().first()

    if not user or not user.is_active:
        return AccessScanResponse(
            status=AccessStatus.DENIED,
            message="Geçersiz veya pasif RFID etiketi.",
        )

    profile = user.profile
    if not profile:
        return AccessScanResponse(status=AccessStatus.DENIED, message="Personel profili bulunamadı.")

    personnel_id = profile.id
    open_log = await rule_engine.get_open_log(db, personnel_id)

    if open_log:
        exit_time = datetime.utcnow()
        open_log.exit_time = exit_time
        real_seconds = (exit_time - open_log.entry_time).total_seconds()
        simulated_minutes = (real_seconds * rule_engine.SIMULATION_MULTIPLIER) / 60.0
        open_log.duration_minutes = simulated_minutes
        await db.commit()

        total_spent = await rule_engine.calculate_daily_duration(db, personnel_id)
        remaining = max(0, profile.max_daily_radiation_limit_minutes - total_spent)

        return AccessScanResponse(
            status=AccessStatus.GRANTED,
            message="ÇIKIŞ",
            personnel_name=f"{profile.first_name} {profile.last_name}",
            remaining_minutes=round(remaining, 1),
        )

    is_granted, deny_reason = await rule_engine.check_access_permission(db, profile)

    access_log = AccessLog(
        personnel_id=personnel_id,
        area_id=request.area_id,
        entry_time=datetime.utcnow() if is_granted else None,
        status=AccessStatus.GRANTED if is_granted else AccessStatus.DENIED,
        deny_reason=deny_reason if not is_granted else None,
    )
    db.add(access_log)
    await db.commit()

    total_spent = await rule_engine.calculate_daily_duration(db, personnel_id)
    remaining = max(0, profile.max_daily_radiation_limit_minutes - total_spent)

    return AccessScanResponse(
        status=access_log.status,
        message="GİRİŞ" if is_granted else f"RED: {deny_reason}",
        personnel_name=f"{profile.first_name} {profile.last_name}",
        remaining_minutes=round(remaining, 1),
    )


@router.post("/reset-exposure/{username}")
async def reset_exposure(
    username: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(deps.RoleChecker(["manage_users"])),
):
    from sqlalchemy import delete

    now_utc = datetime.utcnow()
    today_start = now_utc.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = now_utc.replace(hour=23, minute=59, second=59, microsecond=999999)

    result = await db.execute(select(User).options(selectinload(User.profile)).filter(User.username == username))
    user = result.scalars().first()
    if not user or not user.profile:
        return {"success": False, "message": "Kullanıcı bulunamadı"}

    await db.execute(
        delete(AccessLog).where(
            AccessLog.personnel_id == user.profile.id,
            AccessLog.entry_time >= today_start,
            AccessLog.entry_time <= today_end,
        )
    )
    await db.commit()

    return {"success": True, "message": f"{username} için bugünkü maruziyet sıfırlandı"}
