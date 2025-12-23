import argparse
import json
import sys
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy.orm import Session

# Import models (Assumed paths from your prompt)
from app.core.database import SessionLocal
from app.models.camera import Camera
from app.models.driving_license import DrivingLicense
from app.models.notification_template import NotificationTemplate, NotificationType
from app.models.payment import Payment, PaymentMethod, PaymentStatus, PaymentType
from app.models.system_config import SystemConfig
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.violation import Violation
from app.models.violation_rule import ViolationRule


# ---------------- HELPER: DATE PARSING ----------------
def parse_datetime(dt_str: str):
    """Parses ISO 8601 string to datetime. Returns None if invalid."""
    if not dt_str:
        return None
    try:
        # Handles "2023-10-05T14:30:00" or "2023-10-05"
        return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    except ValueError:
        return None


def parse_date(d_str: str):
    """Parses YYYY-MM-DD string to date object."""
    dt = parse_datetime(d_str)
    return dt.date() if dt else None


# ---------------- HELPER FUNCTIONS (Refined) ----------------


def get_or_create_user(db: Session, data: dict) -> User:
    username = data.get("username")
    user = db.query(User).filter(User.username == username).first()
    if user:
        return user

    user = User(
        username=username,
        full_name=data.get("full_name"),
        email=data.get("email"),
        password_hash=data.get("password_hash", "seeded_hash"),
        role=data.get("role", "citizen"),
        is_active=data.get("is_active", True),
        phone_number=data.get("phone_number"),
        identification_number=data.get("identification_number"),
        department=data.get("department"),
        badge_number=data.get("badge_number"),
        created_at=datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_or_create_vehicle(db: Session, data: dict, owner_id: int) -> Vehicle:
    plate = data.get("license_plate")
    vehicle = db.query(Vehicle).filter(Vehicle.license_plate == plate).first()
    if vehicle:
        return vehicle

    vehicle = Vehicle(
        license_plate=plate,
        vehicle_type=data.get("vehicle_type", "car"),
        vehicle_color=data.get("vehicle_color"),
        vehicle_brand=data.get("vehicle_brand"),
        vehicle_model=data.get("vehicle_model"),
        year_of_manufacture=data.get("year_of_manufacture"),
        owner_id=owner_id,
        owner_name=data.get("owner_name"),
        owner_identification=data.get("owner_identification"),
        owner_phone=data.get("owner_phone"),
        owner_email=data.get("owner_email"),
        registration_date=parse_date(data.get("registration_date")),
        expiration_date=parse_date(data.get("expiration_date")),
        status=data.get("status", "active"),
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


def get_or_create_license(db: Session, data: dict, user_id: int) -> DrivingLicense:
    lnum = data.get("license_number")
    dl = db.query(DrivingLicense).filter(DrivingLicense.license_number == lnum).first()
    if dl:
        return dl

    dl = DrivingLicense(
        license_number=lnum,
        user_id=user_id,
        license_class=data.get("license_class", "B2"),
        full_name=data.get("full_name"),
        date_of_birth=parse_date(data.get("date_of_birth")),
        address=data.get("address"),
        issue_date=parse_date(data.get("issue_date")),
        expiry_date=parse_date(data.get("expiry_date")),
        issue_place=data.get("issue_place"),
        total_points=data.get("total_points", 12),
        current_points=data.get("current_points", 12),
        status="active",
    )
    db.add(dl)
    db.commit()
    db.refresh(dl)
    return dl


def get_or_create_camera(db: Session, data: dict) -> Camera:
    cid = data.get("camera_id")
    cam = db.query(Camera).filter(Camera.camera_id == cid).first()
    if cam:
        return cam

    cam = Camera(
        camera_id=cid,
        name=data.get("name"),
        location_name=data.get("location_name"),
        latitude=Decimal(str(data.get("latitude", 0))),
        longitude=Decimal(str(data.get("longitude", 0))),
        address=data.get("address"),
        camera_type=data.get("camera_type", "fixed"),
        status=data.get("status", "active"),
        created_at=datetime.utcnow(),
    )
    db.add(cam)
    db.commit()
    db.refresh(cam)
    return cam


def create_violation_transaction(db: Session, data: dict, rules_map: dict):
    """Creates Violation and optional Payment."""

    # 1. Resolve Relationships
    rule_code = data.get("rule_code")
    rule = rules_map.get(rule_code) if rule_code else None

    # Find Vehicle
    vehicle = (
        db.query(Vehicle)
        .filter(Vehicle.license_plate == data.get("license_plate"))
        .first()
    )
    if not vehicle:
        print(f"⚠️ Vehicle {data.get('license_plate')} not found. Skipping.")
        return

    # Find Driver License (Optional logic: lookup by number provided in JSON)
    dl_number = data.get("driving_license_number")
    dl = (
        db.query(DrivingLicense)
        .filter(DrivingLicense.license_number == dl_number)
        .first()
        if dl_number
        else None
    )

    # Calculate Fine and Points
    if data.get("fine_amount"):
        fine = Decimal(str(data.get("fine_amount")))
    elif rule:
        fine = rule.fine_min_car
    else:
        fine = Decimal("0")

    if data.get("points_deducted") is not None:
        points = data.get("points_deducted")
    elif rule:
        points = rule.points_car
    else:
        points = 0

    # Get legal reference
    legal_ref = data.get("legal_reference") or (rule.law_reference if rule else None)

    # 2. Create Violation
    violation = Violation(
        license_plate=vehicle.license_plate,
        vehicle_type=vehicle.vehicle_type,
        vehicle_brand=vehicle.vehicle_brand,
        vehicle_color=vehicle.vehicle_color,
        driving_license_id=dl.id if dl else None,
        violation_rule_id=rule.id if rule else None,
        violation_type=data.get("violation_type"),
        violation_description=data.get("violation_description"),
        points_deducted=points,
        fine_amount=fine,
        legal_reference=legal_ref,
        location_name=data.get("location_name"),
        camera_id=data.get("camera_id"),  # String ID referencing Camera.camera_id
        detected_at=parse_datetime(data.get("detected_at")),
        evidence_images=data.get("evidence_images", []),
        status=data.get("status", "pending"),
        priority=data.get("priority", "medium"),
        created_at=datetime.utcnow(),
    )
    db.add(violation)
    db.commit()
    db.refresh(violation)

    # 3. Handle Payment
    payment_info = data.get("payment")
    if payment_info and payment_info.get("is_paid"):
        payment = Payment(
            violation_id=violation.id,
            vehicle_id=vehicle.id,
            user_id=vehicle.owner_id,  # Assumes owner pays
            payment_type=PaymentType.FINE_PAYMENT,
            amount=fine,
            original_fine=fine,
            status=PaymentStatus.PAID.value,
            payment_method=PaymentMethod.QR_CODE,
            payment_gateway="MockGateway",
            receipt_number=f"RCPT-{violation.id:06d}",
            payer_name=vehicle.owner_name,
            paid_at=datetime.utcnow(),
            due_date=parse_date(payment_info.get("due_date")) or date.today(),
        )
        db.add(payment)
        db.commit()
        print(f"   💰 Paid violation {violation.id}")

    print(f"   ✅ Created violation {violation.id} for {vehicle.license_plate}")


# ---------------- MAIN SEEDER LOGIC ----------------


def seed_from_json(file_path: str):
    print(f"📂 Reading data from {file_path}...")
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        print("❌ File not found.")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"❌ JSON Error: {e}")
        sys.exit(1)

    db = SessionLocal()
    try:
        # 1. System Configs
        print("--- Seeding Configs ---")
        for conf in data.get("system_configs", []):
            if (
                not db.query(SystemConfig)
                .filter(SystemConfig.config_key == conf["config_key"])
                .first()
            ):
                db.add(SystemConfig(**conf))
        db.commit()

        # 2. Notification Templates
        print("--- Seeding Templates ---")
        for tpl in data.get("notification_templates", []):
            if (
                not db.query(NotificationTemplate)
                .filter(NotificationTemplate.template_code == tpl["template_code"])
                .first()
            ):
                db.add(NotificationTemplate(**tpl))
        db.commit()

        # 3. Violation Rules
        print("--- Seeding Rules ---")
        for rule_data in data.get("violation_rules", []):
            if (
                not db.query(ViolationRule)
                .filter(ViolationRule.code == rule_data["code"])
                .first()
            ):
                # Convert floats/ints to Decimals where needed
                for key in [
                    "fine_min_car",
                    "fine_max_car",
                    "fine_min_bike",
                    "fine_max_bike",
                ]:
                    if key in rule_data:
                        rule_data[key] = Decimal(str(rule_data[key]))
                db.add(ViolationRule(**rule_data))
        db.commit()

        # Cache rules for lookup
        rules_map = {r.code: r for r in db.query(ViolationRule).all()}

        # 4. Cameras
        print("--- Seeding Cameras ---")
        for cam_data in data.get("cameras", []):
            get_or_create_camera(db, cam_data)

        # 5. Users
        print("--- Seeding Users ---")
        for user_data in data.get("users", []):
            user = get_or_create_user(db, user_data)

            # Vehicles nested in User (if any)
            for v_data in user_data.get("vehicles", []):
                # Ensure owner info matches user if not provided
                if "owner_name" not in v_data:
                    v_data["owner_name"] = user.full_name
                if "owner_email" not in v_data:
                    v_data["owner_email"] = user.email
                get_or_create_vehicle(db, v_data, user.id)

            # Licenses nested in User (if any)
            for l_data in user_data.get("licenses", []):
                if "full_name" not in l_data:
                    l_data["full_name"] = user.full_name
                get_or_create_license(db, l_data, user.id)

        # 6. Root-level Vehicles (linked by owner_identification)
        print("--- Seeding Vehicles ---")
        for v_data in data.get("vehicles", []):
            owner_id_num = v_data.get("owner_identification")
            if owner_id_num:
                owner = (
                    db.query(User)
                    .filter(User.identification_number == owner_id_num)
                    .first()
                )
                if owner:
                    get_or_create_vehicle(db, v_data, owner.id)
                else:
                    print(
                        f"⚠️ Owner with ID {owner_id_num} not found for vehicle {v_data.get('license_plate')}. Skipping."
                    )
            else:
                print(
                    f"⚠️ No owner_identification for vehicle {v_data.get('license_plate')}. Skipping."
                )

        # 7. Root-level Driving Licenses (linked by identification or name)
        print("--- Seeding Driving Licenses ---")
        for l_data in data.get("driving_licenses", []):
            # Try to find user by full_name or identification_number
            full_name = l_data.get("full_name")
            user = None
            if full_name:
                user = db.query(User).filter(User.full_name == full_name).first()

            if user:
                get_or_create_license(db, l_data, user.id)
            else:
                print(
                    f"⚠️ User not found for license {l_data.get('license_number')}. Skipping."
                )

        # 8. Violations (Dependent on Vehicles, Rules, Cameras)
        print("--- Seeding Violations ---")
        for v_data in data.get("violations", []):
            create_violation_transaction(db, v_data, rules_map)

        print("\n✅ SEEDING COMPLETE SUCCESSFULLY!")

    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed database from JSON file")
    parser.add_argument(
        "--file", type=str, default="seed_data.json", help="Path to JSON file"
    )
    args = parser.parse_args()

    seed_from_json(args.file)
