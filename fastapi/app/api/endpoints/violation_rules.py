from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.dependencies import get_current_user, require_roles, require_role
from app.models.user import User
from app.schemas.violation_rule_schema import (
    ViolationRuleCreate,
    ViolationRuleUpdate,
    ViolationRuleResponse,
    ViolationRuleListResponse,
)
from app.services.violation_rule_service import ViolationRuleService

router = APIRouter()


@router.get("/", response_model=ViolationRuleListResponse)
def list_violation_rules(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ViolationRuleService(db)
    items, total = service.list_rules(skip=skip, limit=limit, search=search)
    return ViolationRuleListResponse(
        items=items,
        total=total,
        page=skip // limit + 1 if limit > 0 else 1,
        size=limit,
    )


@router.get("/{rule_id}", response_model=ViolationRuleResponse)
def get_violation_rule(
    rule_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ViolationRuleService(db)
    return service.get_rule(rule_id)


@router.post("/", response_model=ViolationRuleResponse)
def create_violation_rule(
    payload: ViolationRuleCreate,
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db),
):
    service = ViolationRuleService(db)
    return service.create_rule(payload)


@router.put("/{rule_id}", response_model=ViolationRuleResponse)
def update_violation_rule(
    rule_id: int,
    payload: ViolationRuleUpdate,
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db),
):
    service = ViolationRuleService(db)
    return service.update_rule(rule_id, payload)


@router.delete("/{rule_id}")
def delete_violation_rule(
    rule_id: int,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    service = ViolationRuleService(db)
    service.delete_rule(rule_id)
    return {"success": True}


@router.post("/{rule_id}/apply/{violation_id}", response_model=None)
def apply_rule_to_violation(
    rule_id: int,
    violation_id: int,
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db),
):
    service = ViolationRuleService(db)
    violation = service.apply_rule_to_violation(violation_id, rule_id)
    return {"success": True, "violation_id": violation.id, "rule_id": rule_id}


