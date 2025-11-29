"""add video_id to violations

Revision ID: 002
Revises: 001
Create Date: 2025-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add video_id column to violations table
    op.add_column('violations', sa.Column('video_id', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_violations_video_id'), 'violations', ['video_id'], unique=False)
    op.create_foreign_key('fk_violations_video_id', 'violations', 'camera_videos', ['video_id'], ['id'])


def downgrade() -> None:
    # Remove video_id column from violations table
    op.drop_constraint('fk_violations_video_id', 'violations', type_='foreignkey')
    op.drop_index(op.f('ix_violations_video_id'), table_name='violations')
    op.drop_column('violations', 'video_id')
