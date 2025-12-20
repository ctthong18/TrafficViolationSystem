"""create vehicles table

Revision ID: 007
Revises: 006
Create Date: 2024-12-09

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '007'
down_revision = '006'
branch_labels = None
depends_on = None


def upgrade():
    # Create vehicles table
    op.create_table(
        'vehicles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('license_plate', sa.String(length=20), nullable=False),
        sa.Column('vehicle_type', sa.String(length=50), nullable=False),
        sa.Column('vehicle_color', sa.String(length=50), nullable=True),
        sa.Column('vehicle_brand', sa.String(length=100), nullable=True),
        sa.Column('vehicle_model', sa.String(length=100), nullable=True),
        sa.Column('year_of_manufacture', sa.Integer(), nullable=True),
        
        # Owner information
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.Column('owner_name', sa.String(length=255), nullable=True),
        sa.Column('owner_identification', sa.String(length=50), nullable=True),
        sa.Column('owner_address', sa.Text(), nullable=True),
        sa.Column('owner_phone', sa.String(length=20), nullable=True),
        sa.Column('owner_email', sa.String(length=255), nullable=True),
        
        # Registration info
        sa.Column('registration_date', sa.Date(), nullable=True),
        sa.Column('expiration_date', sa.Date(), nullable=True),
        
        # Violation history (cached)
        sa.Column('total_violations', sa.Integer(), default=0),
        sa.Column('unpaid_violations', sa.Integer(), default=0),
        sa.Column('total_fines', sa.DECIMAL(15, 2), default=0),
        
        # Status
        sa.Column('status', sa.String(length=50), server_default='active'),
        
        # Timestamps
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('license_plate')
    )
    
    # Create indexes
    op.create_index('ix_vehicles_id', 'vehicles', ['id'])
    op.create_index('ix_vehicles_license_plate', 'vehicles', ['license_plate'])
    op.create_index('ix_vehicles_owner_phone', 'vehicles', ['owner_phone'])
    op.create_index('ix_vehicles_owner_id', 'vehicles', ['owner_id'])


def downgrade():
    op.drop_index('ix_vehicles_owner_id', table_name='vehicles')
    op.drop_index('ix_vehicles_owner_phone', table_name='vehicles')
    op.drop_index('ix_vehicles_license_plate', table_name='vehicles')
    op.drop_index('ix_vehicles_id', table_name='vehicles')
    op.drop_table('vehicles')
