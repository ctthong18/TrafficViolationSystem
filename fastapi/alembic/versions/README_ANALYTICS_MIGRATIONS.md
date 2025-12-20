# Analytics Database Migrations

This directory contains Alembic migrations for the real-time analytics system.

## Migration Files

### 004_add_analytics_tables.py
Creates core analytics tables:
- `daily_stats` - Daily aggregated statistics
- `action_recommendations` - System recommendations
- `location_hotspots` - Violation hotspot analysis
- `model_performance` - AI model performance tracking

### 005_add_additional_analytics_tables.py
Creates additional analytics tables:
- `time_series_trends` - Trend analysis over time
- `confidence_analytics` - Confidence score analysis
- `violation_forecasts` - Violation predictions

### 006_add_analytics_performance_indexes.py
Adds composite indexes for optimal query performance on all analytics tables.

## Running Migrations

### Option 1: Using the Utility Script (Recommended)
```bash
cd fastapi
python run_analytics_migrations.py
```

### Option 2: Manual Migration
```bash
cd fastapi

# Check current status
alembic current

# Apply migrations one by one
alembic upgrade 004
alembic upgrade 005
alembic upgrade 006

# Or upgrade to latest
alembic upgrade head
```

### Option 3: Upgrade to Specific Revision
```bash
cd fastapi
alembic upgrade 004  # Only core tables
alembic upgrade 005  # Core + additional tables
alembic upgrade 006  # All tables + indexes
```

## Rollback Migrations

If you need to rollback:

```bash
cd fastapi

# Rollback one migration
alembic downgrade -1

# Rollback to specific revision
alembic downgrade 003  # Before analytics tables

# Rollback all analytics migrations
alembic downgrade 003
```

## Verifying Migrations

### Check Migration Status
```bash
cd fastapi
alembic current
alembic history
```

### Verify Tables in Database
```sql
-- List all analytics tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'daily_stats',
    'action_recommendations',
    'location_hotspots',
    'model_performance',
    'time_series_trends',
    'confidence_analytics',
    'violation_forecasts'
);

-- Check table structure
\d daily_stats
\d action_recommendations
\d location_hotspots
\d model_performance
```

### Verify Indexes
```sql
-- List all indexes on analytics tables
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND (
    tablename LIKE '%stats%' 
    OR tablename LIKE '%analytics%' 
    OR tablename LIKE '%performance%'
    OR tablename LIKE '%hotspot%'
    OR tablename LIKE '%recommendation%'
    OR tablename LIKE '%forecast%'
    OR tablename LIKE '%trend%'
)
ORDER BY tablename, indexname;
```

## Troubleshooting

### Migration Already Applied
If you see "Target database is not up to date":
```bash
alembic stamp head
```

### Migration Conflicts
If migrations conflict:
```bash
# Check current state
alembic current

# Show pending migrations
alembic history

# Resolve conflicts manually or rollback
alembic downgrade <revision>
```

### Database Connection Issues
Ensure your `.env` file has correct database credentials:
```
DATABASE_URL=postgresql://user:password@host:port/database
```

## Migration Dependencies

These migrations depend on:
- Migration 003 (audit logs) or earlier
- PostgreSQL database with JSONB support
- SQLAlchemy models in `app/models/`

## Testing Migrations

### Test in Development
```bash
# Create test database
createdb traffic_violation_test

# Update .env to use test database
DATABASE_URL=postgresql://user:password@localhost/traffic_violation_test

# Run migrations
alembic upgrade head

# Verify
psql traffic_violation_test -c "\dt"
```

### Test Rollback
```bash
# Rollback
alembic downgrade 003

# Verify tables removed
psql traffic_violation_test -c "\dt"

# Re-apply
alembic upgrade head
```

## Best Practices

1. **Always backup** before running migrations in production
2. **Test migrations** in development/staging first
3. **Review migration SQL** before applying:
   ```bash
   alembic upgrade 004 --sql
   ```
4. **Monitor performance** after adding indexes
5. **Keep migrations small** and focused
6. **Document changes** in migration docstrings

## Support

For issues or questions:
1. Check migration logs: `alembic.log`
2. Review migration files for details
3. Consult `TASK_9_COMPLETION_SUMMARY.md`
4. Check database logs for errors
