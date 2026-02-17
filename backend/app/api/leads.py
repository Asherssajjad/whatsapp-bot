"""
User: list leads, update status/notes, export CSV.
"""
import csv
import io
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.database import get_db
from app.models.lead import LeadStatus
from app.core.deps import get_current_user
from app.models.user import User
from app.models.lead import Lead
from app.schemas.lead import LeadResponse, LeadUpdate

router = APIRouter(prefix="/leads", tags=["leads"])


@router.get("", response_model=list[LeadResponse])
async def list_leads(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    status: str | None = Query(None),
    search: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    q = select(Lead).where(Lead.user_id == current_user.id)
    if status:
        try:
            q = q.where(Lead.status == LeadStatus(status))
        except ValueError:
            pass
    if search:
        pattern = f"%{search}%"
        q = q.where(
            or_(
                Lead.wa_phone.ilike(pattern),
                Lead.name.ilike(pattern),
                Lead.contact_info.ilike(pattern),
            )
        )
    q = q.order_by(Lead.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(q)
    return [LeadResponse.model_validate(r) for r in result.scalars().all()]


@router.patch("/{lead_id}", response_model=LeadResponse)
async def update_lead(
  lead_id: str,
  data: LeadUpdate,
  db: AsyncSession = Depends(get_db),
  current_user: User = Depends(get_current_user),
):
    from fastapi import HTTPException
    result = await db.execute(
        select(Lead).where(Lead.id == lead_id, Lead.user_id == current_user.id)
    )
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(404, "Lead not found")
    if data.status is not None:
        lead.status = LeadStatus(data.status)
    if data.notes is not None:
        lead.notes = data.notes
    await db.flush()
    await db.refresh(lead)
    return LeadResponse.model_validate(lead)


@router.get("/export/csv")
async def export_leads_csv(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Lead).where(Lead.user_id == current_user.id).order_by(Lead.created_at.desc())
    )
    leads = result.scalars().all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Phone", "Name", "Requirement", "Contact", "Status", "Notes", "Created"])
    for l in leads:
        writer.writerow([l.id, l.wa_phone, l.name or "", l.requirement or "", l.contact_info or "", l.status.value, l.notes or "", l.created_at.isoformat()])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=leads.csv"},
    )
