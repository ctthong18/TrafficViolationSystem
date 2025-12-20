"""add additional analytics tables

Revision ID: 005
Revises: 004
Create Date: 2024-12-09

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade():
    # Create time_series_trends table
    op.create_table(
        'time_series_trends',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('trend_type', sa.String(length=50), nullable=False),
        sa.Column('period_date', sa.Date(), nullable=False),
        sa.Column('period_value', sa.Integer()),
        sa.Column('metric_name', sa.String(length=100), nullable=False),
        sa.Column('metric_value', sa.DECIMAL(precision=15, scale=2)),
        sa.Column('previous_value', sa.DECIMAL(precision=15, scale=2)),
        sa.Column('growth_rate', sa.DECIMAL(precision=8, scale=2)),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_time_series_trends_id', 'time_series_trends', ['id'])
    op.create_index('ix_time_series_trends_trend_type', 'time_series_trends', ['trend_type'])
    op.create_index('ix_time_series_trends_period_date', 'time_series_trends', ['period_date'])
    
    # Create confidence_analytics table
    op.create_table(
        'confidence_analytics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('analysis_date', sa.Date(), nullable=False),
        sa.Column('score_range', sa.String(length=20), nullable=False),
        sa.Column('violation_count', sa.Integer(), server_default='0'),
        sa.Column('approval_rate', sa.DECIMAL(precision=5, scale=2)),
        sa.Column('avg_processing_time', sa.Integer()),
        sa.Column('false_positive_rate', sa.DECIMAL(precision=5, scale=2)),
        sa.Column('true_positive_rate', sa.DECIMAL(precision=5, scale=2)),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_confidence_analytics_id', 'confidence_analytics', ['id'])
    op.create_index('ix_confidence_analytics_analysis_date', 'confidence_analytics', ['analysis_date'])
    
    # Create violation_forecasts table
    op.create_table(
        'violation_forecasts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('forecast_date', sa.Date(), nullable=False),
        sa.Column('forecast_type', sa.String(length=50), nullable=False),
        sa.Column('predicted_violations', sa.Integer()),
        sa.Column('prediction_confidence', sa.DECIMAL(precision=5, scale=4)),
        sa.Column('upper_bound', sa.Integer()),
        sa.Column('lower_bound', sa.Integer()),
        sa.Column('influencing_factors', postgresql.JSONB(astext_type=sa.Text())),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_violation_forecasts_id', 'violation_forecasts', ['id'])
    op.create_index('ix_violation_forecasts_forecast_date', 'violation_forecasts', ['forecast_date'])


def downgrade():
    # Drop tables in reverse order
    op.drop_index('ix_violation_forecasts_forecast_date', table_name='violation_forecasts')
    op.drop_index('ix_violation_forecasts_id', table_name='violation_forecasts')
    op.drop_table('violation_forecasts')
    
    op.drop_index('ix_confidence_analytics_analysis_date', table_name='confidence_analytics')
    op.drop_index('ix_confidence_analytics_id', table_name='confidence_analytics')
    op.drop_table('confidence_analytics')
    
    op.drop_index('ix_time_series_trends_period_date', table_name='time_series_trends')
    op.drop_index('ix_time_series_trends_trend_type', table_name='time_series_trends')
    op.drop_index('ix_time_series_trends_id', table_name='time_series_trends')
    op.drop_table('time_series_trends')
