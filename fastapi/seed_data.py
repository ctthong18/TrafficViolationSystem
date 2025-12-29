import argparse
import os
import sys
import json
from datetime import datetime

import psycopg2
from passlib.hash import bcrypt
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy_utils import create_database, database_exists

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Handle Windows encoding issues
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from app.core.config import settings

# Import models
from app.models.system_config import SystemConfig
from app.models.notification_template import NotificationTemplate
from app.models.camera import Camera
from app.models.user import Role, User
from app.models.vehicle import Vehicle
from app.models.driving_license import DrivingLicense
from app.models.violation import Violation, ViolationStatus
from app.models.violation_rule import ViolationRule
from app.models.base import Base


def create_admin_user(db):
    """
    Creates the super admin user.
    This is hardcoded because it is essential for system access
    and usually not part of dynamic JSON seeding.
    """
    print("\n[INFO] Checking Admin User...")
    try:
        admin = db.query(User).filter(User.username == "admin").first()
        if admin:
            print("   -> Admin user already exists.")
            return

        print("   -> Creating default admin...")
        raw_password = "admin123"
        # Bcrypt truncation safety
        pw_bytes = raw_password.encode("utf-8")
        if len(pw_bytes) > 72:
            pw_bytes = pw_bytes[:72]
            raw_password = pw_bytes.decode("utf-8", "ignore")

        password_hash = bcrypt.hash(raw_password)
        admin = User(
            username="admin",
            email="admin@gmail.com",
            password_hash=password_hash,
            full_name="System Administrator",
            identification_number="000000000000",
            role=Role.ADMIN.value,
            permissions={"all": True},
            is_active=True,
            created_at=datetime.utcnow(),
        )
        db.add(admin)
        db.commit()
        print("   [OK] Admin created (User: admin / Pass: admin123)")
    except Exception as e:
        db.rollback()
        print(f"   [ERROR] Error creating admin: {e}")


def seed_from_json(db, file_path):
    """
    Seeds the database with data from a JSON file.
    """
    if not os.path.exists(file_path):
        print(f"   ⚠️  Seed file '{file_path}' not found. Skipping.")
        return

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # 1. System Configs
        print("   -> Seeding System Configs...")
        for config_data in data.get("system_configs", []):
            existing = db.query(SystemConfig).filter(SystemConfig.config_key == config_data["config_key"]).first()
            if not existing:
                db.add(SystemConfig(**config_data))
        db.commit()

        # 2. Notification Templates
        print("   -> Seeding Notification Templates...")
        for template_data in data.get("notification_templates", []):
            # Map JSON 'notification_code' to model 'template_code'
            code = template_data.get("notification_code")
            existing = db.query(NotificationTemplate).filter(NotificationTemplate.template_code == code).first()
            if not existing:
                # Prepare data for model
                model_data = template_data.copy()
                if "notification_code" in model_data:
                    model_data["template_code"] = model_data.pop("notification_code")
                
                # If notification_type is missing, use the code
                if "notification_type" not in model_data:
                    model_data["notification_type"] = code
                
                db.add(NotificationTemplate(**model_data))
        db.commit()

        # 3. Cameras
        print("   -> Seeding Cameras...")
        for cam_data in data.get("cameras", []):
            existing = db.query(Camera).filter(Camera.camera_id == cam_data["camera_id"]).first()
            if not existing:
                # Hash password if exists
                if "password" in cam_data:
                    raw_password = cam_data.pop("password")
                    cam_data["password_hash"] = bcrypt.hash(raw_password)
                
                db.add(Camera(**cam_data))
        db.commit()

        # 4. Users
        print("   -> Seeding Users...")
        for u_data in data.get("users", []):
            existing = db.query(User).filter(User.username == u_data["username"]).first()
            if not existing:
                db.add(User(**u_data))
        db.commit()

        # 5. Vehicles
        print("   -> Seeding Vehicles...")
        for v_data in data.get("vehicles", []):
            existing = db.query(Vehicle).filter(Vehicle.license_plate == v_data["license_plate"]).first()
            if not existing:
                owner = db.query(User).filter(User.identification_number == v_data["owner_identification"]).first()
                if owner:
                    v_data["owner_id"] = owner.id
                
                # Convert date strings
                if v_data.get("registration_date"):
                    v_data["registration_date"] = datetime.strptime(v_data["registration_date"], "%Y-%m-%d").date()
                if v_data.get("expiration_date"):
                    v_data["expiration_date"] = datetime.strptime(v_data["expiration_date"], "%Y-%m-%d").date()
                    
                db.add(Vehicle(**v_data))
        db.commit()

        # 6. Driving Licenses
        print("   -> Seeding Driving Licenses...")
        for l_data in data.get("driving_licenses", []):
            existing = db.query(DrivingLicense).filter(DrivingLicense.license_number == l_data["license_number"]).first()
            if not existing:
                user = db.query(User).filter(User.full_name == l_data["full_name"]).first()
                if user:
                    l_data["user_id"] = user.id
                
                # Convert date strings
                for date_field in ["date_of_birth", "issue_date", "expiry_date"]:
                    if l_data.get(date_field):
                        l_data[date_field] = datetime.strptime(l_data[date_field], "%Y-%m-%d").date()
                
                db.add(DrivingLicense(**l_data))
        db.commit()

        # 7. Violations
        print("   -> Seeding Violations...")
        for vio_data in data.get("violations", []):
            detected_at = datetime.fromisoformat(vio_data["detected_at"])
            existing = db.query(Violation).filter(
                Violation.license_plate == vio_data["license_plate"],
                Violation.detected_at == detected_at
            ).first()
            if not existing:
                # Find driving license for the owner of the vehicle
                vehicle = db.query(Vehicle).filter(Vehicle.license_plate == vio_data["license_plate"]).first()
                if vehicle:
                    license = db.query(DrivingLicense).filter(DrivingLicense.user_id == vehicle.owner_id).first()
                    if license:
                        vio_data["driving_license_id"] = license.id
                
                # Map CONFIRMED status to APPROVED (matching our enum)
                if vio_data.get("status") == "CONFIRMED":
                    vio_data["status"] = "APPROVED"
                
                # Try to link to a rule by matching the description or code
                rule = db.query(ViolationRule).filter(
                    (ViolationRule.description == vio_data["violation_type"]) |
                    (ViolationRule.code == vio_data["violation_type"])
                ).first()
                if rule:
                    vio_data["violation_rule_id"] = rule.id

                vio_data["detected_at"] = detected_at
                
                db.add(Violation(**vio_data))
        db.commit()
        print("   [OK] JSON data seeded successfully.")

    except Exception as e:
        db.rollback()
        print(f"   [ERROR] Seeding failed: {e}")


def seed_core_rules(db):
    """
    Seeds essential violation rules if they don't exist.
    """
    print("   -> Checking Core Violation Rules...")
    rules = [
        {
            "code": "RED_LIGHT",
            "description": "Vượt đèn đỏ",
            "fine_min_car": 4000000,
            "fine_max_car": 6000000,
            "points_car": 3,
            "fine_min_bike": 800000,
            "fine_max_bike": 1000000,
            "points_bike": 2,
        },
        {
            "code": "SPEED_10_20",
            "description": "Vượt quá tốc độ từ 10-20 km/h",
            "fine_min_car": 4000000,
            "fine_max_car": 6000000,
            "points_car": 3,
            "fine_min_bike": 800000,
            "fine_max_bike": 1000000,
            "points_bike": 2,
        },
        {
            "code": "WRONG_LANE",
            "description": "Đi sai làn đường quy định",
            "fine_min_car": 3000000,
            "fine_max_car": 5000000,
            "points_car": 2,
            "fine_min_bike": 400000,
            "fine_max_bike": 600000,
            "points_bike": 1,
        },
        {
            "code": "STOP_NO_PARKING",
            "description": "Dừng, đỗ xe tại nơi có biển cấm",
            "fine_min_car": 800000,
            "fine_max_car": 1000000,
            "points_car": 0,
            "fine_min_bike": 300000,
            "fine_max_bike": 400000,
            "points_bike": 0,
        },
        {
            "code": "WRONG_DIRECTION",
            "description": "Đi ngược chiều của đường một chiều",
            "fine_min_car": 4000000,
            "fine_max_car": 6000000,
            "points_car": 3,
            "fine_min_bike": 1000000,
            "fine_max_bike": 2000000,
            "points_bike": 2,
        },
    ]

    for rule_data in rules:
        existing = db.query(ViolationRule).filter(ViolationRule.code == rule_data["code"]).first()
        if not existing:
            db.add(ViolationRule(**rule_data))
    db.commit()
    print("   [OK] Core rules checked/seeded.")


def main():
    # 1. Parse Arguments
    parser = argparse.ArgumentParser(
        description="Initialize Traffic Violation Database"
    )
    parser.add_argument(
        "--seed-file", type=str, default="seed_data.json", help="Path to JSON seed file"
    )
    args = parser.parse_args()

    print("Starting Database Setup")
    print("=" * 60)

    db_url = settings.DATABASE_URL

    # 2. Check Connection
    print(f"\n[CONN] Testing PostgreSQL connection...")
    try:
        conn = psycopg2.connect(db_url)
        conn.close()
        print("   [OK] Connection successful!")
    except Exception as e:
        print(f"   [ERROR] Connection failed: {e}")
        return

    # 3. Create Database
    print("\n[DB] Checking Database...")
    engine = create_engine(db_url, echo=False)
    if not database_exists(engine.url):
        create_database(engine.url)
        print("   [OK] Database created.")
    else:
        print("   -> Database already exists.")


    # 5. Initialize Session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    # 6. Create Static Admin
    create_admin_user(db)

    # 6b. Seed Core Rules
    seed_core_rules(db)

    # 7. Run JSON Seeder
    print(f"\n[SEED] Seeding Data from '{args.seed_file}'...")
    if os.path.exists(args.seed_file):
        seed_from_json(db, args.seed_file)
    else:
        print(f"   [WARN] Seed file '{args.seed_file}' not found. Skipping data seeding.")
        print("       (Run with --seed-file path/to/file.json to specify location)")

    db.close()
    print("\nSetup Complete!")


if __name__ == "__main__":
    main()
