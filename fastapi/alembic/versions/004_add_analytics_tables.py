"""add analytics tables

Revision ID: 004
Revises: 003
Create Date: 2024-12-09

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade():
    # Create daily_stats table
    op.create_table(
        'daily_stats',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('stat_date', sa.Date(), nullable=False),
        sa.Column('total_violations', sa.Integer(), server_default='0'),
        sa.Column('approved_violations', sa.Integer(), server_default='0'),
        sa.Column('rejected_violations', sa.Integer(), server_default='0'),
        sa.Column('pending_violations', sa.Integer(), server_default='0'),
        sa.Column('violation_type_counts', postgresql.JSONB(astext_type=sa.Text())),
        sa.Column('confidence_score_avg', sa.DECIMAL(precision=5, scale=4)),
        sa.Column('total_revenue', sa.DECIMAL(precision=15, scale=2), server_default='0'),
        sa.Column('collected_revenue', sa.DECIMAL(precision=15, scale=2), server_default='0'),
        sa.Column('pending_revenue', sa.DECIMAL(precision=15, scale=2), server_default='0'),
        sa.Column('new_users', sa.Integer(), server_default='0'),
        sa.Column('total_complaints', sa.Integer(), server_default='0'),
        sa.Column('resolved_complaints', sa.Integer(), server_default='0'),
        sa.Column('approval_rate', sa.DECIMAL(precision=5, scale=2)),
        sa.Column('collection_rate', sa.DECIMAL(precision=5, scale=2)),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_daily_stats_id', 'daily_stats', ['id'])
    op.create_index('ix_daily_stats_stat_date', 'daily_stats', ['stat_date'], unique=True)
    
    # Create action_recommendations table
    op.create_table(
        'action_recommendations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('recommendation_type', sa.String(length=100), nullable=False),
        sa.Column('priority_level', sa.String(length=20), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('rationale', postgresql.JSONB(astext_type=sa.Text())),
        sa.Column('expected_impact', sa.String(length=100)),
        sa.Column('implementation_cost', sa.DECIMAL(precision=15, scale=2)),
        sa.Column('status', sa.String(length=50), server_default='pending'),
        sa.Column('assigned_to', sa.Integer()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['assigned_to'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_action_recommendations_id', 'action_recommendations', ['id'])
    
    # Create location_hotspots table
    op.create_table(
        'location_hotspots',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('location_name', sa.String(length=255), nullable=False),
        sa.Column('latitude', sa.DECIMAL(precision=10, scale=8)),
        sa.Column('longitude', sa.DECIMAL(precision=11, scale=8)),
        sa.Column('period_type', sa.String(length=20), nullable=False),
        sa.Column('period_date', sa.Date(), nullable=False),
        sa.Column('total_violations', sa.Integer(), server_default='0'),
        sa.Column('violation_breakdown', postgresql.JSONB(astext_type=sa.Text())),
        sa.Column('revenue_generated', sa.DECIMAL(precision=15, scale=2), server_default='0'),
        sa.Column('risk_score', sa.DECIMAL(precision=5, scale=2)),
        sa.Column('trend_direction', sa.String(length=10)),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_location_hotspots_id', 'location_hotspots', ['id'])
    op.create_index('ix_location_hotspots_location_name', 'location_hotspots', ['location_name'])
    op.create_index('ix_location_hotspots_period_date', 'location_hotspots', ['period_date'])
    
    # Create model_performance table
    op.create_table(
        'model_performance',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('model_name', sa.String(length=100), nullable=False),
        sa.Column('evaluation_date', sa.Date(), nullable=False),
        sa.Column('precision_score', sa.DECIMAL(precision=5, scale=4)),
        sa.Column('recall_score', sa.DECIMAL(precision=5, scale=4)),
        sa.Column('f1_score', sa.DECIMAL(precision=5, scale=4)),
        sa.Column('accuracy', sa.DECIMAL(precision=5, scale=4)),
        sa.Column('avg_processing_time_ms', sa.Integer()),
        sa.Column('total_predictions', sa.Integer()),
        sa.Column('performance_by_type', postgresql.JSONB(astext_type=sa.Text())),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_model_performance_id', 'model_performance', ['id'])
    op.create_index('ix_model_performance_model_name', 'model_performance', ['model_name'])
    op.create_index('ix_model_performance_evaluation_date', 'model_performance', ['evaluation_date'])


def downgrade():
    # Drop tables in reverse order
    op.drop_index('ix_model_performance_evaluation_date', table_name='model_performance')
    op.drop_index('ix_model_performance_model_name', table_name='model_performance')
    op.drop_index('ix_model_performance_id', table_name='model_performance')
    op.drop_table('model_performance')
    
    op.drop_index('ix_location_hotspots_period_date', table_name='location_hotspots')
    op.drop_index('ix_location_hotspots_location_name', table_name='location_hotspots')
    op.drop_index('ix_location_hotspots_id', table_name='location_hotspots')
    op.drop_table('location_hotspots')
    
    op.drop_index('ix_action_recommendations_id', table_name='action_recommendations')
    op.drop_table('action_recommendations')
    
    op.drop_index('ix_daily_stats_stat_date', table_name='daily_stats')
    op.drop_index('ix_daily_stats_id', table_name='daily_stats')
    op.drop_table('daily_stats')
