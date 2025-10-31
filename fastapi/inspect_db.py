from sqlalchemy import create_engine, inspect
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
inspector = inspect(engine)

print("DATABASE SCHEMA INFORMATION")
print("=" * 50)

for table_name in inspector.get_table_names():
    print(f"\n Table: {table_name}")
    columns = inspector.get_columns(table_name)
    for col in columns:
        print(f"  - {col['name']} ({col['type']}) nullable={col['nullable']}")
