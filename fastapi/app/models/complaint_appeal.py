import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import relationship

from .base import Base, TimestampMixin


from app.schemas.complaint_schema import AppealStatus


class ComplaintAppeal(Base, TimestampMixin):
    __tablename__ = "complaint_appeals"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    appeal_code = Column(String(50), unique=True, index=True)  # KC-2024-001

    # Lý do kháng cáo
    appeal_reason = Column(Text, nullable=False)
    new_evidence_urls = Column(JSON)

    # Xử lý kháng cáo
    status = Column(Enum(AppealStatus), default=AppealStatus.PENDING)
    reviewed_by = Column(Integer, ForeignKey("users.id"))
    reviewed_at = Column(DateTime)
    review_notes = Column(Text)

    # Relationships
    complaint = relationship("Complaint", back_populates="appeals")
    reviewing_officer = relationship(
        "User", foreign_keys=[reviewed_by], overlaps="appeal_reviews"
    )

    def __repr__(self):
        return (
            f"<ComplaintAppeal {self.appeal_code} for {self.complaint.complaint_code}>"
        )
