import argparse
import os
import sys
from datetime import datetime

import psycopg2
from passlib.hash import bcrypt
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy_utils import create_database, database_exists

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings

# Import all models to ensure Base.metadata finds them
from app.models import (
    action_recommendations,
    audit_log,
    camera,
    complaint,
    complaint_activity,
    complaint_appeal,
    confidence_analytics,
    daily_stats,
    denunciation,
    denunciation_activity,
    driving_license,
    location_hotspots,
    model_performance,
    notification,
    notification_template,
    payment,
    system_config,
    time_series_trends,
    user,
    vehicle,
    violation,
    violation_forecasts,
)
from app.models.base import Base
from app.models.user import Role, User

# --- IMPORT THE NEW SEEDER ---
# Assuming you saved the previous solution as app/core/seeder.py

from app.core.seeder import seed_data


def create_admin_user(db):
    """
    Creates the super admin user.
    This is hardcoded because it is essential for system access
    and usually not part of dynamic JSON seeding.
    """
    print("\n👤 Checking Admin User...")
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
        print("   ✅ Admin created (User: admin / Pass: admin123)")
    except Exception as e:
        db.rollback()
        print(f"   ❌ Error creating admin: {e}")


def main():
    # 1. Parse Arguments
    parser = argparse.ArgumentParser(
        description="Initialize Traffic Violation Database"
    )
    parser.add_argument(
        "--seed-file", type=str, default="seed_data.json", help="Path to JSON seed file"
    )
    args = parser.parse_args()

    print("🚀 Starting Database Setup")
    print("=" * 60)

    db_url = settings.DATABASE_URL

    # 2. Check Connection
    print(f"\n🔌 Testing PostgreSQL connection...")
    try:
        conn = psycopg2.connect(db_url)
        conn.close()
        print("   ✅ Connection successful!")
    except Exception as e:
        print(f"   ❌ Connection failed: {e}")
        return

    # 3. Create Database
    print("\n🗄️  Checking Database...")
    engine = create_engine(db_url, echo=False)
    if not database_exists(engine.url):
        create_database(engine.url)
        print("   ✅ Database created.")
    else:
        print("   -> Database already exists.")

    # 4. Create Tables
    print("\n🏗️  Creating Tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("   ✅ All tables created.")
    except Exception as e:
        print(f"   ❌ Error creating tables: {e}")
        return

    # 5. Initialize Session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    # 6. Create Static Admin
    create_admin_user(db)

    # 7. Run JSON Seeder
    print(f"\n🌱 Seeding Data from '{args.seed_file}'...")
    if os.path.exists(args.seed_file):
        try:
            # Call the function from the previous step
            seed_from_json(args.seed_file)
        except Exception as e:
            print(f"   ❌ Seeding failed: {e}")
    else:
        print(f"   ⚠️  Seed file '{args.seed_file}' not found. Skipping data seeding.")
        print("       (Run with --seed-file path/to/file.json to specify location)")

    db.close()
    print("\n✨ Setup Complete!")


if __name__ == "__main__":
    main()
