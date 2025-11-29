"""add audit logs table

Revision ID: 003
Revises: 002
Create Date: 2025-01-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    # Create audit_logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('action', sa.Enum(
            'CREATE', 'READ', 'UPDATE', 'DELETE', 'UPLOAD', 'DOWNLOAD',
            'REVIEW', 'APPROVE', 'REJECT', 'LOGIN', 'LOGOUT', 'FAILED_LOGIN',
            name='auditaction'
        ), nullable=False),
        sa.Column('resource', sa.Enum(
            'VIDEO', 'DETECTION', 'VIOLATION', 'USER', 'CAMERA', 'AI_CONFIG', 'SYSTEM',
            name='auditresource'
        ), nullable=False),
        sa.Column('resource_id', sa.Integer(), nullable=True),
        sa.Column('details', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.String(length=500), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='success'),
        sa.Column('timestamp', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for better query performance
    op.create_index('ix_audit_logs_user_id', 'audit_logs', ['user_id'])
    op.create_index('ix_audit_logs_action', 'audit_logs', ['action'])
    op.create_index('ix_audit_logs_resource', 'audit_logs', ['resource'])
    op.create_index('ix_audit_logs_resource_id', 'audit_logs', ['resource_id'])
    op.create_index('ix_audit_logs_status', 'audit_logs', ['status'])
    op.create_index('ix_audit_logs_timestamp', 'audit_logs', ['timestamp'])
    
    # Create composite index for common queries
    op.create_index(
        'ix_audit_logs_user_action_timestamp',
        'audit_logs',
        ['user_id', 'action', 'timestamp']
    )


def downgrade():
    # Drop indexes
    op.drop_index('ix_audit_logs_user_action_timestamp', table_name='audit_logs')
    op.drop_index('ix_audit_logs_timestamp', table_name='audit_logs')
    op.drop_index('ix_audit_logs_status', table_name='audit_logs')
    op.drop_index('ix_audit_logs_resource_id', table_name='audit_logs')
    op.drop_index('ix_audit_logs_resource', table_name='audit_logs')
    op.drop_index('ix_audit_logs_action', table_name='audit_logs')
    op.drop_index('ix_audit_logs_user_id', table_name='audit_logs')
    
    # Drop table
    op.drop_table('audit_logs')
    
    # Drop enums
    op.execute('DROP TYPE auditaction')
    op.execute('DROP TYPE auditresource')
