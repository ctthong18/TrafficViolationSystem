"""
Script to fix payment enum values in database
Run this after updating the Payment model
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.core.config import settings

def fix_payment_enums():
    """Fix payment enum values to ensure they match the Python enum definitions"""
    
    # Create engine
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        # Start transaction
        trans = conn.begin()
        
        try:
            # Check current status values
            result = conn.execute(text("SELECT DISTINCT status FROM payments"))
            current_statuses = [row[0] for row in result]
            print(f"Current status values: {current_statuses}")
            
            # Check current payment_method values
            result = conn.execute(text("SELECT DISTINCT payment_method FROM payments WHERE payment_method IS NOT NULL"))
            current_methods = [row[0] for row in result]
            print(f"Current payment_method values: {current_methods}")
            
            # Check current payment_type values
            result = conn.execute(text("SELECT DISTINCT payment_type FROM payments"))
            current_types = [row[0] for row in result]
            print(f"Current payment_type values: {current_types}")
            
            # Fix status values: convert uppercase to lowercase
            status_mapping = {
                'PENDING': 'pending',
                'PAID': 'paid',
                'FAILED': 'failed',
                'REFUNDED': 'refunded',
                'CANCELLED': 'cancelled',
                'CREATED': 'created'
            }
            
            for old_status, new_status in status_mapping.items():
                result = conn.execute(
                    text("UPDATE payments SET status = :new_status WHERE status = :old_status"),
                    {"old_status": old_status, "new_status": new_status}
                )
                if result.rowcount > 0:
                    print(f"  ✓ Updated {result.rowcount} payments from '{old_status}' to '{new_status}'")
            
            # Fix payment_method values if needed
            method_mapping = {
                'BANK_TRANSFER': 'bank_transfer',
                'WALLET': 'wallet',
                'CREDIT_CARD': 'credit_card',
                'E_WALLET': 'e_wallet',
                'CASH': 'cash',
                'BANKING': 'banking',
                'QR_CODE': 'qr_code'
            }
            
            for old_method, new_method in method_mapping.items():
                result = conn.execute(
                    text("UPDATE payments SET payment_method = :new_method WHERE payment_method = :old_method"),
                    {"old_method": old_method, "new_method": new_method}
                )
                if result.rowcount > 0:
                    print(f"  ✓ Updated {result.rowcount} payments from '{old_method}' to '{new_method}'")
            
            # Fix payment_type values if needed
            type_mapping = {
                'FINE_PAYMENT': 'fine_payment',
                'WALLET_DEPOSIT': 'wallet_deposit',
                'WALLET_WITHDRAW': 'wallet_withdraw',
                'REFUND': 'refund'
            }
            
            for old_type, new_type in type_mapping.items():
                result = conn.execute(
                    text("UPDATE payments SET payment_type = :new_type WHERE payment_type = :old_type"),
                    {"old_type": old_type, "new_type": new_type}
                )
                if result.rowcount > 0:
                    print(f"  ✓ Updated {result.rowcount} payments from '{old_type}' to '{new_type}'")
            
            # Commit transaction
            trans.commit()
            print("\n✅ Payment enum fix completed successfully!")
            
        except Exception as e:
            trans.rollback()
            print(f"\n❌ Error: {e}")
            raise

if __name__ == "__main__":
    print("Checking payment enum values in database...\n")
    fix_payment_enums()
