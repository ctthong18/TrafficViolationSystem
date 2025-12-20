"""
Script to run analytics database migrations

This script applies the analytics-related database migrations to create
the necessary tables and indexes for the real-time analytics system.

Usage:
    python run_analytics_migrations.py
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a shell command and handle errors."""
    print(f"\n{'='*60}")
    print(f"{description}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(
            command,
            shell=True,
            check=True,
            capture_output=True,
            text=True
        )
        print(result.stdout)
        if result.stderr:
            print("Warnings:", result.stderr)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        print(f"Output: {e.stdout}")
        print(f"Error output: {e.stderr}")
        return False

def main():
    """Main function to run migrations."""
    print("Analytics Database Migration Script")
    print("=" * 60)
    
    # Change to fastapi directory
    os.chdir('fastapi')
    
    # Check current migration status
    if not run_command(
        "alembic current",
        "Checking current migration status"
    ):
        print("\nFailed to check migration status")
        return 1
    
    # Show pending migrations
    if not run_command(
        "alembic history",
        "Showing migration history"
    ):
        print("\nFailed to show migration history")
        return 1
    
    # Run migrations
    print("\n" + "="*60)
    print("Running analytics migrations...")
    print("="*60)
    
    migrations = [
        ("004", "Creating core analytics tables (daily_stats, action_recommendations, location_hotspots, model_performance)"),
        ("005", "Creating additional analytics tables (time_series_trends, confidence_analytics, violation_forecasts)"),
        ("006", "Adding performance indexes for analytics queries")
    ]
    
    for revision, description in migrations:
        print(f"\n→ Migration {revision}: {description}")
        if not run_command(
            f"alembic upgrade {revision}",
            f"Applying migration {revision}"
        ):
            print(f"\nFailed to apply migration {revision}")
            print("You may need to apply migrations manually using:")
            print(f"  cd fastapi && alembic upgrade {revision}")
            return 1
    
    # Verify final state
    if not run_command(
        "alembic current",
        "Verifying final migration state"
    ):
        print("\nFailed to verify migration state")
        return 1
    
    print("\n" + "="*60)
    print("✓ All analytics migrations completed successfully!")
    print("="*60)
    print("\nThe following tables have been created:")
    print("  - daily_stats")
    print("  - action_recommendations")
    print("  - location_hotspots")
    print("  - model_performance")
    print("  - time_series_trends")
    print("  - confidence_analytics")
    print("  - violation_forecasts")
    print("\nPerformance indexes have been added for optimal query performance.")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
