# fastapi/app/schemas/recent_activity_schema.py
from typing import Optional

from pydantic import BaseModel


class RecentActivityResponse(BaseModel):
    id: int
    user_id: int
    activity: str
    type: Optional[str] = "NORMAL"
    date: str

    class Config:
        orm_mode = True
