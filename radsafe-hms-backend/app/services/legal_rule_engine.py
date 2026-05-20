from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.domain.models.models import AccessLog, PersonnelProfile, AccessStatus, Alert
from datetime import datetime, timezone

class LegalRuleEngine:
    SIMULATION_MULTIPLIER = 120 # 1 real second = 120 simulated seconds (2 mins)

    async def calculate_daily_duration(self, db: AsyncSession, personnel_id: int) -> float:
        # Use UTC for today to match datetime.utcnow() stored values
        now_utc = datetime.utcnow()
        today_start = now_utc.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end   = now_utc.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        result = await db.execute(
            select(AccessLog).filter(
                AccessLog.personnel_id == personnel_id,
                AccessLog.entry_time >= today_start,
                AccessLog.entry_time <= today_end,
                AccessLog.status == AccessStatus.GRANTED
            )
        )
        logs = result.scalars().all()
        
        total_minutes = 0.0
        for log in logs:
            if log.duration_minutes is not None:
                total_minutes += log.duration_minutes
            elif log.exit_time is None and log.entry_time:
                # Still inside — calculate elapsed time with simulation multiplier
                real_seconds = (datetime.utcnow() - log.entry_time).total_seconds()
                simulated_minutes = (real_seconds * self.SIMULATION_MULTIPLIER) / 60.0
                total_minutes += simulated_minutes
                
        return total_minutes

    async def get_open_log(self, db: AsyncSession, personnel_id: int) -> AccessLog | None:
        # Find any open (unexited) granted session — no date filter to avoid timezone issues
        result = await db.execute(
            select(AccessLog).filter(
                AccessLog.personnel_id == personnel_id,
                AccessLog.exit_time == None,
                AccessLog.status == AccessStatus.GRANTED
            ).order_by(AccessLog.entry_time.desc())
        )
        return result.scalars().first()

    async def check_access_permission(self, db: AsyncSession, personnel: PersonnelProfile) -> tuple[bool, str]:
        total_duration = await self.calculate_daily_duration(db, personnel.id)  # personnel_profiles.id
        limit = personnel.max_daily_radiation_limit_minutes
        
        if total_duration >= limit:
            return False, f"Günlük limit aşıldı ({int(total_duration)}/{limit} dk)"
        
        return True, "İzin verildi"
