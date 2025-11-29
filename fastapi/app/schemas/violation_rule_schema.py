from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, Field


class ViolationRuleBase(BaseModel):
    code: str = Field(..., max_length=50)
    description: str
    law_reference: Optional[str] = "ND100/2019"

    fine_min_car: Optional[Decimal] = None
    fine_max_car: Optional[Decimal] = None
    points_car: Optional[int] = None

    fine_min_bike: Optional[Decimal] = None
    fine_max_bike: Optional[Decimal] = None
    points_bike: Optional[int] = None


class ViolationRuleCreate(ViolationRuleBase):
    pass


class ViolationRuleUpdate(BaseModel):
    description: Optional[str] = None
    law_reference: Optional[str] = None
    fine_min_car: Optional[Decimal] = None
    fine_max_car: Optional[Decimal] = None
    points_car: Optional[int] = None
    fine_min_bike: Optional[Decimal] = None
    fine_max_bike: Optional[Decimal] = None
    points_bike: Optional[int] = None


class ViolationRuleResponse(ViolationRuleBase):
    id: int

    class Config:
        from_attributes = True


class ViolationRuleListResponse(BaseModel):
    items: List[ViolationRuleResponse]
    total: int
    page: int
    size: int


