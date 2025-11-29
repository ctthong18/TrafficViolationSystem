# fastapi/app/schemas/recent_activity_schema.py
from pydantic import BaseModel
from typing import Optional

class RecentActivityResponse(BaseModel):
    id: int
    user_id: int
    activity: str
    type: Optional[str] = "normal"
    date: str

    class Config:
        orm_mode = True
