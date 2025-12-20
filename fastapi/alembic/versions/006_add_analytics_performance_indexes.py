"""add analytics performance indexes

Revision ID: 006
Revises: 005
Create Date: 2024-12-09

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '006'
down_revision = '005'
branch_labels = None
depends_on = None


def upgrade():
    # Add composite indexes for common query patterns
    
    # Daily stats - frequently queried by date range
    op.create_index(
        'ix_daily_stats_date_violations',
        'daily_stats',
        ['stat_date', 'total_violations']
    )
    
    # Action recommendations - frequently filtered by status and priority
    op.create_index(
        'ix_action_recommendations_status_priority',
        'action_recommendations',
        ['status', 'priority_level']
    )
    op.create_index(
        'ix_action_recommendations_type_status',
        'action_recommendations',
        ['recommendation_type', 'status']
    )
    
    # Location hotspots - frequently queried by period and location
    op.create_index(
        'ix_location_hotspots_period_location',
        'location_hotspots',
        ['period_type', 'period_date', 'location_name']
    )
    op.create_index(
        'ix_location_hotspots_risk_score',
        'location_hotspots',
        ['risk_score'],
        postgresql_using='btree',
        postgresql_ops={'risk_score': 'DESC'}
    )
    
    # Model performance - frequently queried by model and date
    op.create_index(
        'ix_model_performance_model_date',
        'model_performance',
        ['model_name', 'evaluation_date']
    )
    
    # Time series trends - frequently queried by type and date range
    op.create_index(
        'ix_time_series_trends_type_date',
        'time_series_trends',
        ['trend_type', 'period_date']
    )
    
    # Confidence analytics - frequently queried by date and score range
    op.create_index(
        'ix_confidence_analytics_date_range',
        'confidence_analytics',
        ['analysis_date', 'score_range']
    )
    
    # Violation forecasts - frequently queried by date and type
    op.create_index(
        'ix_violation_forecasts_date_type',
        'violation_forecasts',
        ['forecast_date', 'forecast_type']
    )


def downgrade():
    # Drop composite indexes
    op.drop_index('ix_violation_forecasts_date_type', table_name='violation_forecasts')
    op.drop_index('ix_confidence_analytics_date_range', table_name='confidence_analytics')
    op.drop_index('ix_time_series_trends_type_date', table_name='time_series_trends')
    op.drop_index('ix_model_performance_model_date', table_name='model_performance')
    op.drop_index('ix_location_hotspots_risk_score', table_name='location_hotspots')
    op.drop_index('ix_location_hotspots_period_location', table_name='location_hotspots')
    op.drop_index('ix_action_recommendations_type_status', table_name='action_recommendations')
    op.drop_index('ix_action_recommendations_status_priority', table_name='action_recommendations')
    op.drop_index('ix_daily_stats_date_violations', table_name='daily_stats')
