"""add ai model config table

Revision ID: 002
Revises: 001
Create Date: 2025-01-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create ai_model_configs table
    op.create_table(
        'ai_model_configs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('confidence_threshold', sa.Float(), nullable=False),
        sa.Column('iou_threshold', sa.Float(), nullable=False),
        sa.Column('detection_frequency', sa.Integer(), nullable=False),
        sa.Column('violation_types', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ai_model_configs_id'), 'ai_model_configs', ['id'], unique=False)
    op.create_index(op.f('ix_ai_model_configs_is_active'), 'ai_model_configs', ['is_active'], unique=False)
    op.create_index(op.f('ix_ai_model_configs_created_at'), 'ai_model_configs', ['created_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_ai_model_configs_created_at'), table_name='ai_model_configs')
    op.drop_index(op.f('ix_ai_model_configs_is_active'), table_name='ai_model_configs')
    op.drop_index(op.f('ix_ai_model_configs_id'), table_name='ai_model_configs')
    op.drop_table('ai_model_configs')
