from sqlalchemy import Column, String, Integer, DateTime, Text, DECIMAL, Date, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class Vehicle(Base, TimestampMixin):
    __tablename__ = "vehicles"
    
    id = Column(Integer, primary_key=True, index=True)
    license_plate = Column(String(20), unique=True, nullable=False, index=True)
    vehicle_type = Column(String(50), nullable=False)
    vehicle_color = Column(String(50))
    vehicle_brand = Column(String(100))
    vehicle_model = Column(String(100))
    year_of_manufacture = Column(Integer)
    
    # Owner information
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner_name = Column(String(255))
    owner_identification = Column(String(50))
    owner_address = Column(Text)
    owner_phone = Column(String(20), index=True)
    owner_email = Column(String(255))
    
    # Registration info
    registration_date = Column(Date)
    expiration_date = Column(Date)
    
    # Violation history (cached)
    total_violations = Column(Integer, default=0)
    unpaid_violations = Column(Integer, default=0)
    total_fines = Column(DECIMAL(15, 2), default=0)
    
    # Status
    status = Column(String(50), default="active")
    
    # Relationships
    owner = relationship("User", back_populates="vehicles")
    violations = relationship("Violation", foreign_keys="Violation.license_plate", 
                            primaryjoin="Vehicle.license_plate==Violation.license_plate",
                            viewonly=True)
    payments = relationship("Payment", back_populates="vehicle")
    
    def __repr__(self):
        return f"<Vehicle {self.license_plate} - {self.owner_name}>"