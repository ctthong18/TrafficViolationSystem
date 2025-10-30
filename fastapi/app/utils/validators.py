import re
from typing import Optional

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_phone(phone: str) -> bool:
    """Validate Vietnamese phone number"""
    # Vietnamese phone number patterns
    patterns = [
        r'^(03[2-9]|05[6-9]|07[0-9]|08[1-9]|09[0-9])[0-9]{7}$',  # Mobifone, Vinaphone, Viettel
        r'^(84|0[3|5|7|8|9])+([0-9]{8,9})$',  # With country code
    ]
    
    for pattern in patterns:
        if re.match(pattern, phone):
            return True
    return False

def validate_license_plate(license_plate: str) -> bool:
    """Validate Vietnamese license plate format"""
    patterns = [
        r'^[0-9]{2}[A-Z]{1,2}[0-9]{4,5}$',  # Standard: 51A12345
        r'^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$', # With dash: 51A-12345
        r'^[A-Z]{2}[0-9]{4,6}$',            # Old format: AB12345
    ]
    
    cleaned = license_plate.replace('.', '').replace('-', '').replace(' ', '').upper()
    
    for pattern in patterns:
        if re.match(pattern, cleaned):
            return True
    return False

def validate_identification(identification: str) -> bool:
    """Validate Vietnamese identification number (CCCD/CMND)"""
    # CCCD: 12 digits, CMND: 9 digits
    patterns = [
        r'^[0-9]{9}$',  # CMND
        r'^[0-9]{12}$', # CCCD
    ]
    
    for pattern in patterns:
        if re.match(pattern, identification):
            return True
    return False

def sanitize_input(text: str) -> str:
    """Basic input sanitization"""
    if not text:
        return ""
    
    # Remove potentially dangerous characters
    sanitized = re.sub(r'[<>"\']', '', text.strip())
    return sanitized

def validate_coordinates(lat: float, lng: float) -> bool:
    """Validate geographic coordinates"""
    return -90 <= lat <= 90 and -180 <= lng <= 180