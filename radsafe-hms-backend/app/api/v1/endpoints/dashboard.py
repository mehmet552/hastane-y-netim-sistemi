from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from sqlalchemy.orm import selectinload
from app.api import deps
from app.db.session import get_db
from app.domain.models.models import AccessLog, PersonnelProfile, AccessStatus, Alert, User, RestrictedArea
from app.services.legal_rule_engine import LegalRuleEngine

router = APIRouter()


def _today_bounds():
    now_utc = datetime.utcnow()
    start = now_utc.replace(hour=0, minute=0, second=0, microsecond=0)
    end = now_utc.replace(hour=23, minute=59, second=59, microsecond=999999)
    return start, end


@router.get("/stats")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    today_start, today_end = _today_bounds()
    today_filter = (
        AccessLog.entry_time >= today_start,
        AccessLog.entry_time <= today_end,
    )

    total_scans = (
        await db.execute(select(func.count(AccessLog.id)).where(*today_filter))
    ).scalar_one_or_none() or 0

    denied_scans = (
        await db.execute(
            select(func.count(AccessLog.id)).where(
                *today_filter,
                AccessLog.status == AccessStatus.DENIED,
            )
        )
    ).scalar_one_or_none() or 0

    active_personnel = (
        await db.execute(
            select(func.count(func.distinct(AccessLog.personnel_id))).where(
                AccessLog.status == AccessStatus.GRANTED,
                AccessLog.exit_time == None,
                AccessLog.entry_time >= today_start,
            )
        )
    ).scalar_one_or_none() or 0

    warnings = (
        await db.execute(select(func.count(Alert.id)).filter(Alert.is_resolved == False))
    ).scalar_one_or_none() or 0

    return {
        "active_personnel": active_personnel,
        "limit_warnings": warnings,
        "total_scans": total_scans,
        "denied_accesses": denied_scans,
    }


@router.get("/my-exposure")
async def get_my_exposure(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    profile_result = await db.execute(
        select(PersonnelProfile)
        .options(selectinload(PersonnelProfile.department))
        .filter(PersonnelProfile.user_id == current_user.id)
    )
    profile = profile_result.scalars().first()

    if not profile:
        return {"daily_minutes": 0, "max_minutes": 240, "is_inside": False}

    rule_engine = LegalRuleEngine()
    total_duration = await rule_engine.calculate_daily_duration(db, profile.id)
    open_log = await rule_engine.get_open_log(db, profile.id)

    area_name = None
    shift_started_at = None
    if open_log and open_log.entry_time:
        shift_started_at = open_log.entry_time.strftime("%H:%M:%S")
        if open_log.area_id:
            area_row = await db.get(RestrictedArea, open_log.area_id)
            area_name = area_row.name if area_row else None

    remaining = max(0, profile.max_daily_radiation_limit_minutes - total_duration)

    return {
        "daily_minutes": round(total_duration, 1),
        "max_minutes": profile.max_daily_radiation_limit_minutes,
        "remaining_minutes": round(remaining, 1),
        "is_inside": open_log is not None,
        "shift_started_at": shift_started_at,
        "current_area": area_name,
    }


@router.get("/live-personnel")
async def get_live_personnel(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(deps.RoleChecker(["view_logs"])),
):
    """Tüm personelin canlı maruziyet ve kalan süre özeti."""
    areas_result = await db.execute(select(RestrictedArea))
    area_names = {a.id: a.name for a in areas_result.scalars().all()}

    result = await db.execute(
        select(PersonnelProfile)
        .options(
            selectinload(PersonnelProfile.user).selectinload(User.role),
            selectinload(PersonnelProfile.department),
        )
        .order_by(PersonnelProfile.id)
    )
    profiles = result.scalars().all()
    rule_engine = LegalRuleEngine()
    response_data = []

    for p in profiles:
        if not p.user or not p.user.is_active:
            continue

        total_duration = await rule_engine.calculate_daily_duration(db, p.id)
        open_log = await rule_engine.get_open_log(db, p.id)
        max_m = p.max_daily_radiation_limit_minutes
        remaining = max(0, max_m - total_duration)
        percent = round(min((total_duration / max_m) * 100, 100), 1) if max_m else 0

        response_data.append({
            "personnel_id": p.id,
            "username": p.user.username,
            "personnel_name": f"{p.first_name} {p.last_name}",
            "department": p.department.name if p.department else "—",
            "role_name": p.user.role.name if p.user.role else "",
            "daily_minutes": round(total_duration, 1),
            "max_minutes": max_m,
            "remaining_minutes": round(remaining, 1),
            "percent": percent,
            "is_inside": open_log is not None,
            "shift_started_at": (
                open_log.entry_time.strftime("%H:%M:%S") if open_log and open_log.entry_time else None
            ),
            "current_area": area_names.get(open_log.area_id) if open_log else None,
        })

    response_data.sort(key=lambda x: (-int(x["is_inside"]), -x["percent"]))
    return response_data


@router.get("/areas")
async def get_areas(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    result = await db.execute(select(RestrictedArea).order_by(RestrictedArea.id))
    areas = result.scalars().all()
    return [{"id": a.id, "name": a.name} for a in areas]


@router.get("/live-logs", response_model=list[dict])
async def get_live_logs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    areas_result = await db.execute(select(RestrictedArea))
    area_names = {a.id: a.name for a in areas_result.scalars().all()}

    result = await db.execute(select(AccessLog).order_by(AccessLog.id.desc()).limit(10))
    logs = result.scalars().all()

    rule_engine = LegalRuleEngine()
    response_data = []

    for log in logs:
        personnel = await db.execute(
            select(PersonnelProfile)
            .options(
                selectinload(PersonnelProfile.department),
                selectinload(PersonnelProfile.user),
            )
            .filter(PersonnelProfile.id == log.personnel_id)
        )
        p = personnel.scalars().first()
        if not p:
            continue

        total_duration = await rule_engine.calculate_daily_duration(db, p.id)

        if log.exit_time:
            action = "EXITED"
        elif log.status == AccessStatus.GRANTED:
            action = "ENTERED"
        else:
            action = "DENIED"

        area_name = area_names.get(log.area_id, f"Alan {log.area_id}")

        response_data.append({
            "id": log.id,
            "personnel_name": f"{p.first_name} {p.last_name}",
            "personnel_code": f"ID: PER-{p.id:04d}",
            "username": p.user.username if p.user else "",
            "department": p.department.name if p.department else "—",
            "area": area_name,
            "time_in": log.entry_time.strftime("%H:%M") if log.entry_time else "—",
            "status": log.status.value,
            "action": action,
            "daily_minutes": round(total_duration, 1),
            "max_minutes": p.max_daily_radiation_limit_minutes,
            "deny_reason": log.deny_reason,
        })

    return response_data
