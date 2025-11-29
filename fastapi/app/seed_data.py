from datetime import datetime, timedelta, date, timezone
from decimal import Decimal
from sqlalchemy.orm import Session

# Import các model (Giả định đường dẫn đúng)
from app.core.database import SessionLocal
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.driving_license import DrivingLicense
from app.models.violation import Violation
from app.models.payment import Payment, PaymentStatus, PaymentType, PaymentMethod
from app.models.notification_template import NotificationTemplate, NotificationType
from app.models.system_config import SystemConfig
from app.models.violation_rule import ViolationRule
# from app.models.camera import Camera  <-- Không cần import để seed, chỉ cần ID string nếu DB lỏng, hoặc query check nếu cần.

# ---------------- HELPER FUNCTIONS ----------------

def get_or_create_user(db: Session, username: str, role: str, **kwargs) -> User:
    """
    Get or create user with role as string: 'admin', 'officer', or 'citizen'
    """
    user = db.query(User).filter(User.username == username).first()
    if user:
        return user
    user = User(
        username=username,
        full_name=kwargs.get("full_name", username.title()),
        email=kwargs.get("email", f"{username}@example.com"),
        password_hash=kwargs.get("password_hash", "seeded"),  # not for login
        role=role,  # role is already a string
        is_active=True,
        permissions=kwargs.get("permissions"),
        phone_number=kwargs.get("phone_number"),
        identification_number=kwargs.get("identification_number"),
        department=kwargs.get("department"),
        badge_number=kwargs.get("badge_number"),
        created_at=datetime.now(timezone.utc),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_or_create_vehicle(db: Session, license_plate: str, owner_id: int, **kwargs) -> Vehicle:
    vehicle = db.query(Vehicle).filter(Vehicle.license_plate == license_plate).first()
    if vehicle:
        return vehicle
    vehicle = Vehicle(
        license_plate=license_plate,
        vehicle_type=kwargs.get("vehicle_type", "car"),
        vehicle_color=kwargs.get("vehicle_color", "black"),
        vehicle_brand=kwargs.get("vehicle_brand", "Roll Royce"),
        vehicle_model=kwargs.get("vehicle_model", "Roll Royce Ghost"),
        year_of_manufacture=kwargs.get("year_of_manufacture", 2025),
        owner_id=owner_id,
        owner_name=kwargs.get("owner_name"),
        owner_identification=kwargs.get("owner_identification"),
        owner_address=kwargs.get("owner_address"),
        owner_phone=kwargs.get("owner_phone"),
        owner_email=kwargs.get("owner_email"),
        registration_date=kwargs.get("registration_date", date.today() - timedelta(days=365)),
        expiration_date=kwargs.get("expiration_date", date.today() + timedelta(days=365 * 2)),
        status="active",
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


def get_or_create_driving_license(db: Session, license_number: str, user_id: int, **kwargs) -> DrivingLicense:
    dl = db.query(DrivingLicense).filter(DrivingLicense.license_number == license_number).first()
    if dl:
        return dl
    dl = DrivingLicense(
        license_number=license_number,
        user_id=user_id,
        license_class=kwargs.get("license_class", "B2"),
        full_name=kwargs.get("full_name"),
        date_of_birth=kwargs.get("date_of_birth", date(1990, 1, 1)),
        address=kwargs.get("address", "Hanoi"),
        issue_date=kwargs.get("issue_date", date.today() - timedelta(days=365 * 2)),
        expiry_date=kwargs.get("expiry_date", date.today() + timedelta(days=365 * 3)),
        issue_place=kwargs.get("issue_place", "Hanoi"),
        total_points=12,
        current_points=12,
        status="active",
    )
    db.add(dl)
    db.commit()
    db.refresh(dl)
    return dl


def create_violation(db: Session, **kwargs) -> Violation:
    violation = Violation(
        license_plate=kwargs["license_plate"],
        vehicle_type=kwargs.get("vehicle_type", "car"),
        vehicle_color=kwargs.get("vehicle_color", "black"),
        vehicle_brand=kwargs.get("vehicle_brand", "Roll Royce"),
        driving_license_id=kwargs.get("driving_license_id"),
        violation_type=kwargs.get("violation_type", "overspeed"),
        violation_description=kwargs.get("violation_description", "Exceeding speed limit"),
        points_deducted=kwargs.get("points_deducted", 3),
        fine_amount=kwargs.get("fine_amount", Decimal("500000")),
        legal_reference=kwargs.get("legal_reference", "168/2024/NĐ-CP"),
        location_name=kwargs.get("location_name", "Pham Hung"),
        latitude=kwargs.get("latitude"),
        longitude=kwargs.get("longitude"),
        camera_id=kwargs.get("camera_id"), # Giả định Camera ID này đã tồn tại
        detected_at=kwargs.get("detected_at", datetime.now(timezone.utc) - timedelta(days=1)),
        confidence_score=kwargs.get("confidence_score", Decimal("0.9321")),
        ai_metadata=kwargs.get("ai_metadata", {"model": "yolov8", "version": "1.0"}),
        evidence_images=kwargs.get("evidence_images", ["https://res.cloudinary.com/dxxiercxx/image/upload/v1763965030/Gemini_Generated_Image_p8m9thp8m9thp8m9_um8nqa.png"]),
        evidence_gif=kwargs.get("evidence_gif"),
        status=kwargs.get("status", "pending"),
        priority=kwargs.get("priority", "medium"),
        reviewed_by=kwargs.get("reviewed_by"),
        reviewed_at=kwargs.get("reviewed_at"),
        review_notes=kwargs.get("review_notes"),
    )
    
    if "violation_rule_id" in kwargs:
        violation.violation_rule_id = kwargs["violation_rule_id"]
        
    db.add(violation)
    db.commit()
    db.refresh(violation)
    return violation


def create_payment_for_violation(db: Session, violation: Violation, user_id: int, vehicle_id: int, paid: bool) -> Payment:
    amount = violation.fine_amount or Decimal("500000")
    payment = Payment(
        violation_id=violation.id,
        vehicle_id=vehicle_id,
        user_id=user_id,
        payment_type=PaymentType.FINE_PAYMENT,
        amount=amount,
        original_fine=amount,
        status=PaymentStatus.PAID.value if paid else PaymentStatus.PENDING.value,
        payment_method=PaymentMethod.QR_CODE if paid else PaymentMethod.BANK_TRANSFER,
        payment_gateway="MockGateway",
        receipt_number=f"RCPT-{violation.id:06d}",
        payer_name="Seed Citizen",
        payer_identification="012345678901",
        description="Seed payment",
        due_date=date.today() + timedelta(days=7),
        paid_at=datetime.now(timezone.utc) if paid else None,
        is_auto_deduct=False,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def seed_notification_templates(db: Session) -> None:
    templates = [
        {
            "template_code": "TEMP_VIOLATION_ALERT",
            "name": "Thông báo vi phạm",
            "notification_type": NotificationType.VIOLATION_ALERT,
            "subject_template": "[VPH] Thông báo vi phạm #{violation_id}",
            "sms_template": "Xe {license_plate} vi phạm {violation_type}. Tiền phạt: {amount}đ.",
            "default_channel": ["sms", "web"],
            "available_variables": ["violation_id", "license_plate", "violation_type", "amount"],
            "allowed_entities": ["violation"],
        },
        {
            "template_code": "TEMP_PAYMENT_REMINDER",
            "name": "Nhắc nhở thanh toán",
            "notification_type": NotificationType.PAYMENT_REMINDER,
            "subject_template": "[VPH] Nhắc thanh toán #{violation_id}",
            "sms_template": "Bạn còn tiền phạt {amount}đ cho vi phạm #{violation_id}, hạn {due_date}.",
            "default_channel": ["sms", "web"],
            "available_variables": ["violation_id", "amount", "due_date"],
            "allowed_entities": ["payment", "violation"],
        },
    ]
    for t in templates:
        exists = db.query(NotificationTemplate).filter(NotificationTemplate.template_code == t["template_code"]).first()
        if exists:
            continue
        tpl = NotificationTemplate(
            name=t["name"],
            template_code=t["template_code"],
            notification_type=t["notification_type"],
            subject_template=t.get("subject_template"),
            email_template=t.get("email_template"),
            sms_template=t.get("sms_template"),
            push_template=t.get("push_template"),
            web_template=t.get("web_template"),
            default_channel=t.get("default_channel"),
            available_variables=t.get("available_variables"),
            allowed_entities=t.get("allowed_entities"),
            is_active=True,
            version="1.0",
        )
        db.add(tpl)
    db.commit()


def seed_system_configs(db: Session) -> None:
    configs = [
        ("ai.confidence_threshold", "0.75", "float", "Ngưỡng tin cậy AI mặc định"),
        ("payment.late_penalty_rate", "0.10", "float", "Phạt chậm nộp 10%"),
        ("notification.default_language", "vi", "string", "Ngôn ngữ mặc định"),
    ]
    for key, value, ctype, desc in configs:
        exists = db.query(SystemConfig).filter(SystemConfig.config_key == key).first()
        if exists:
            continue
        cfg = SystemConfig(
            config_key=key,
            config_value=value,
            config_type=ctype,
            description=desc,
            is_active=1,
        )
        db.add(cfg)
    db.commit()


# ---------------- MAIN LOGIC ----------------

def seed_core_data() -> None:
    db = SessionLocal()
    try:
        # 1. Tạo User (role: 'admin', 'officer', or 'citizen')
        target_user = get_or_create_user(
            db, 
            username="thongcris18", 
            role="citizen",  # Changed from Role.USER to "citizen"
            full_name="Chu Thành Thông",
            identification_number="012345678901"
        )
        
        # 2. Tạo Vehicle
        vehicle = get_or_create_vehicle(
            db,
            license_plate="37A-018.04",
            owner_id=target_user.id,
            owner_name=target_user.full_name,
            owner_phone="0912345678",
            owner_email=target_user.email,
        )

        # 3. Tạo Driving License (Quan trọng: Phải tạo trước khi tạo violation)
        driving_license = get_or_create_driving_license(
            db, 
            license_number="NA-1990-000001",
            user_id=target_user.id,
            full_name=target_user.full_name
        )

        # 4. Lấy Rules (Giả định Rules đã được seed ở bước trước)
        rule_codes = [
            "RED_LIGHT",
            "SPEED_10_20",
            "WRONG_LANE",
            "STOP_NO_PARKING",
            "WRONG_DIRECTION",
        ]
        rules = {
            r.code: r
            for r in db.query(ViolationRule).filter(ViolationRule.code.in_(rule_codes)).all()
        }

        # 5. Danh sách vi phạm cần tạo
        violation_definitions = [
            {
                "rule_code": "RED_LIGHT",
                "violation_type": "red_light",
                "description": "Vượt đèn đỏ tại ngã tư Trần Phú - Lý Tự Trọng",
                "camera_id": "CAM_01", 
                "status": "approved",
                "priority": "high",
                "detected_at": datetime.now(timezone.utc) - timedelta(days=5, hours=3),
                "paid": True,
            },
            {
                "rule_code": "SPEED_10_20",
                "violation_type": "overspeed",
                "description": "Chạy quá tốc độ 15km/h trên đường Võ Nguyên Giáp",
                "camera_id": "CAM_01",
                "status": "approved",
                "priority": "medium",
                "detected_at": datetime.now(timezone.utc) - timedelta(days=3, hours=6),
                "paid": True,
            },
            {
                "rule_code": "WRONG_LANE",
                "violation_type": "wrong_lane",
                "description": "Đi không đúng làn đường trên cầu Rồng",
                "camera_id": "CAM_01",
                "status": "pending",
                "priority": "high",
                "detected_at": datetime.now(timezone.utc) - timedelta(days=2, hours=1),
                "paid": False,
            },
            {
                "rule_code": "STOP_NO_PARKING",
                "violation_type": "illegal_parking",
                "description": "Dừng đỗ tại khu vực cấm dừng trước bệnh viện",
                "camera_id": "CAM_01",
                "status": "reviewing",
                "priority": "medium",
                "detected_at": datetime.now(timezone.utc) - timedelta(days=1, hours=2),
                "paid": False,
            },
            {
                "rule_code": "WRONG_DIRECTION",
                "violation_type": "wrong_direction",
                "description": "Đi ngược chiều tại đường một chiều Nguyễn Du",
                "camera_id": "CAM_01",
                "status": "pending",
                "priority": "high",
                "detected_at": datetime.now(timezone.utc) - timedelta(hours=6),
                "paid": False,
            },
        ]

        # 6. Loop tạo vi phạm và thanh toán
        for definition in violation_definitions:
            rule = rules.get(definition["rule_code"])
            if not rule:
                print(f"⚠️ Không tìm thấy rule {definition['rule_code']} trong DB. Hãy chắc chắn bạn đã seed Rules trước.")
                continue

            fine_amount = rule.fine_min_car or Decimal("500000")
            points = rule.points_car or 0

            violation = create_violation(
                db,
                license_plate=vehicle.license_plate,
                driving_license_id=driving_license.id, 
                violation_type=definition["violation_type"],
                violation_description=definition["description"],
                points_deducted=points,
                fine_amount=fine_amount,
                legal_reference=rule.law_reference,
                detected_at=definition["detected_at"],
                status=definition["status"],
                priority=definition["priority"],
                camera_id=definition["camera_id"],
                vehicle_type="car",
                vehicle_color="black",
                vehicle_brand="Roll Royce",
                violation_rule_id=rule.id 
            )

            if not getattr(violation, "violation_rule_id", None):
                 violation.violation_rule_id = rule.id
                 db.commit()

            create_payment_for_violation(
                db,
                violation,
                user_id=target_user.id,
                vehicle_id=vehicle.id,
                paid=definition["paid"],
            )

        # 7. Seed notification templates and configs
        seed_notification_templates(db)
        seed_system_configs(db)
        
        print("✅ Seeding Core Data hoàn tất!")
        
    except Exception as e:
        print(f"❌ Lỗi Seeding: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_core_data()