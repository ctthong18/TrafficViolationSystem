from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from decimal import Decimal
from app.models.violation_rule import ViolationRule
from app.models.violation import Violation
from app.schemas.violation_rule_schema import ViolationRuleCreate, ViolationRuleUpdate
from fastapi import HTTPException, status


class ViolationRuleService:
    def __init__(self, db: Session):
        self.db = db

    def list_rules(self, skip: int = 0, limit: int = 50, search: Optional[str] = None) -> Tuple[List[ViolationRule], int]:
        query = self.db.query(ViolationRule)
        if search:
            like = f"%{search}%"
            query = query.filter((ViolationRule.code.ilike(like)) | (ViolationRule.description.ilike(like)))
        total = query.count()
        items = query.order_by(ViolationRule.code.asc()).offset(skip).limit(limit).all()
        return items, total

    def get_rule(self, rule_id: int) -> ViolationRule:
        rule = self.db.query(ViolationRule).filter(ViolationRule.id == rule_id).first()
        if not rule:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Violation rule not found")
        return rule

    def get_rule_by_code(self, code: str) -> Optional[ViolationRule]:
        return self.db.query(ViolationRule).filter(ViolationRule.code == code).first()

    def create_rule(self, data: ViolationRuleCreate) -> ViolationRule:
        exists = self.get_rule_by_code(data.code)
        if exists:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Rule code already exists")
        rule = ViolationRule(**data.dict())
        self.db.add(rule)
        self.db.commit()
        self.db.refresh(rule)
        return rule

    def update_rule(self, rule_id: int, data: ViolationRuleUpdate) -> ViolationRule:
        rule = self.get_rule(rule_id)
        for field, value in data.dict(exclude_unset=True).items():
            setattr(rule, field, value)
        self.db.commit()
        self.db.refresh(rule)
        return rule

    def delete_rule(self, rule_id: int) -> None:
        rule = self.get_rule(rule_id)
        # Optional: check constraints (no hard restriction here)
        self.db.delete(rule)
        self.db.commit()

    def apply_rule_to_violation(self, violation_id: int, rule_id: int) -> Violation:
        violation = self.db.query(Violation).filter(Violation.id == violation_id).first()
        if not violation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Violation not found")
        rule = self.get_rule(rule_id)

        violation.violation_rule_id = rule.id
        # Derive points and fine range by vehicle type if available
        vehicle_type = (violation.vehicle_type or "").lower()
        if "bike" in vehicle_type or vehicle_type in ("motorbike", "motorcycle", "bike"):
            if rule.points_bike is not None:
                violation.points_deducted = rule.points_bike
            if rule.fine_min_bike is not None:
                violation.fine_amount = rule.fine_min_bike
        else:
            if rule.points_car is not None:
                violation.points_deducted = rule.points_car
            if rule.fine_min_car is not None:
                violation.fine_amount = rule.fine_min_car

        violation.legal_reference = rule.law_reference
        self.db.commit()
        self.db.refresh(violation)
        return violation


