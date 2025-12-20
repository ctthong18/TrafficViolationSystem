"""
Real-time Analytics API Endpoints

Provides real-time analytics including action recommendations, model performance,
time series trends, and location hotspots for the AI traffic detection system.

Requirements: 5.2, 8.1, 8.2, 8.3
"""

import logging
from typing import Optional, List
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from app.core.database import get_db
from app.api.dependencies import get_current_user, require_roles
from app.models.user import User
from app.models.CameraVideo import CameraVideo
from app.models.camera import Camera
from app.services.action_recommendation_engine import (
    action_recommendation_engine,
    ActionRecommendation
)
from app.services.model_performance_monitor import (
    model_performance_monitor,
    Detection,
    ModelMetrics
)
from app.services.time_series_trend_analyzer import (
    time_series_trend_analyzer,
    TimeSeries,
    ViolationMetrics
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/realtime-metrics")
def get_realtime_metrics(
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db),
):
    """
    Get real-time system metrics.
    
    Returns current system performance including:
    - Active violations count
    - Vehicles per minute
    - Average processing time
    - Model confidence
    
    Requirements: 5.2, 8.1
    """
    logger.info(f"User {current_user.id} fetching real-time metrics")
    
    # Get metrics from last 5 minutes
    five_minutes_ago = datetime.utcnow() - timedelta(minutes=5)
    
    # Active violations (recent detections)
    active_violations = db.query(AIDetection).filter(
        AIDetection.created_at >= five_minutes_ago,
        AIDetection.detection_type == "violation"
    ).count()
    
    # Vehicles detected
    vehicles_detected = db.query(AIDetection).filter(
        AIDetection.created_at >= five_minutes_ago
    ).count()
    
    # Calculate vehicles per minute
    vehicles_per_minute = vehicles_detected / 5.0
    
    # Average processing time (from recent videos)
    avg_processing_time = db.query(
        func.avg(CameraVideo.duration)
    ).filter(
        CameraVideo.created_at >= five_minutes_ago
    ).scalar() or 0.0
    
    # Average model confidence
    avg_confidence = db.query(
        func.avg(AIDetection.confidence_score)
    ).filter(
        AIDetection.created_at >= five_minutes_ago
    ).scalar() or 0.0
    
    return {
        "current_metrics": {
            "active_violations": active_violations,
            "vehicles_per_minute": round(vehicles_per_minute, 2),
            "average_processing_time": round(float(avg_processing_time or 0), 2),
            "model_confidence": round(float(avg_confidence or 0), 3)
        },
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/action-recommendations")
def get_action_recommendations(
    priority: Optional[str] = Query(None, description="Filter by priority: high, medium, low"),
    recommendation_type: Optional[str] = Query(None, description="Filter by type"),
    limit: int = Query(10, ge=1, le=50, description="Maximum recommendations to return"),
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db),
):
    """
    Get action recommendations based on system analysis.
    
    Returns prioritized recommendations for:
    - Camera adjustments
    - Enforcement actions
    - Resource allocation
    - System optimization
    
    Requirements: 5.2, 8.1
    """
    logger.info(f"User {current_user.id} fetching action recommendations")
    
    # Get recent violations for analysis
    one_day_ago = datetime.utcnow() - timedelta(days=1)
    recent_violations = db.query(AIDetection).filter(
        AIDetection.created_at >= one_day_ago,
        AIDetection.detection_type == "violation"
    ).all()
    
    # Convert to dict format for analysis
    violation_data = [
        {
            'violation_type': det.detection_data.get('violation_type', 'unknown') if det.detection_data else 'unknown',
            'timestamp': det.created_at.timestamp(),
            'confidence': det.confidence_score
        }
        for det in recent_violations
    ]
    
    # Generate recommendations from violation patterns
    recommendations = action_recommendation_engine.analyze_violation_patterns(
        violation_data,
        time_window_hours=24
    )
    
    # Get camera performance data
    cameras = db.query(Camera).all()
    for camera in cameras:
        # Calculate camera performance metrics
        camera_videos = db.query(CameraVideo).filter(
            CameraVideo.camera_id == camera.id,
            CameraVideo.created_at >= one_day_ago
        ).all()
        
        if camera_videos:
            total_detections = sum(v.violation_count or 0 for v in camera_videos)
            avg_processing_time = sum(v.duration or 0 for v in camera_videos) / len(camera_videos)
            
            camera_performance = {
                'camera_id': camera.id,
                'detection_accuracy': 0.85,  # Placeholder - would calculate from actual data
                'avg_processing_time_ms': avg_processing_time * 1000,
                'uptime_percentage': 0.95  # Placeholder
            }
            
            # Generate camera-specific recommendations
            camera_recs = action_recommendation_engine.suggest_camera_adjustments(camera_performance)
            recommendations.extend(camera_recs)
    
    # Get all recommendations with filters
    all_recommendations = action_recommendation_engine.get_all_recommendations(
        priority_filter=priority,
        type_filter=recommendation_type,
        limit=limit
    )
    
    # Convert to response format
    response_data = [
        {
            "recommendation_type": rec.recommendation_type,
            "priority": rec.priority,
            "description": rec.description,
            "expected_impact": rec.expected_impact,
            "implementation_effort": rec.implementation_effort,
            "confidence_score": rec.confidence_score,
            "supporting_data": rec.supporting_data,
            "created_at": rec.created_at.isoformat()
        }
        for rec in all_recommendations
    ]
    
    return {
        "recommendations": response_data,
        "total_count": len(response_data),
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/model-performance")
def get_model_performance(
    hours: int = Query(24, ge=1, le=168, description="Hours of history to analyze"),
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db),
):
    """
    Get model performance metrics and health status.
    
    Returns:
    - Accuracy metrics
    - Processing speed
    - Confidence distribution
    - Model health report
    - Drift analysis
    
    Requirements: 5.1, 5.4, 8.2
    """
    logger.info(f"User {current_user.id} fetching model performance")
    
    # Get recent detections
    time_window = datetime.utcnow() - timedelta(hours=hours)
    recent_detections = db.query(AIDetection).filter(
        AIDetection.created_at >= time_window
    ).all()
    
    if not recent_detections:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No detection data available for the specified time period"
        )
    
    # Convert to Detection objects
    detection_objects = [
        Detection(
            detection_id=str(det.id),
            confidence=det.confidence_score,
            detection_type=det.detection_type,
            timestamp=det.created_at,
            is_correct=det.review_status == "approved" if det.reviewed else None
        )
        for det in recent_detections
    ]
    
    # Analyze confidence distribution
    confidence_analysis = model_performance_monitor.analyze_confidence_distributions(
        detection_objects
    )
    
    # Get recent metrics
    recent_metrics = model_performance_monitor.get_recent_metrics(hours=hours)
    
    # Generate health report if we have metrics history
    if recent_metrics:
        health_report = model_performance_monitor.generate_model_health_report(recent_metrics)
        
        health_data = {
            "overall_health": health_report.overall_health,
            "health_score": round(health_report.health_score, 2),
            "accuracy_status": health_report.accuracy_status,
            "performance_status": health_report.performance_status,
            "drift_status": health_report.drift_status,
            "confidence_status": health_report.confidence_status,
            "recommendations": health_report.recommendations
        }
    else:
        health_data = {
            "overall_health": "unknown",
            "health_score": 0.0,
            "message": "Insufficient data for health assessment"
        }
    
    return {
        "confidence_analysis": {
            "mean_confidence": round(confidence_analysis.mean_confidence, 3),
            "median_confidence": round(confidence_analysis.median_confidence, 3),
            "std_deviation": round(confidence_analysis.std_deviation, 3),
            "confidence_ranges": confidence_analysis.confidence_ranges,
            "low_confidence_count": confidence_analysis.low_confidence_count,
            "high_confidence_count": confidence_analysis.high_confidence_count,
            "total_detections": confidence_analysis.total_detections
        },
        "health_report": health_data,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/time-series-trends")
def get_time_series_trends(
    metric: str = Query("violations", description="Metric to analyze: violations, detections, confidence"),
    period_days: int = Query(30, ge=7, le=90, description="Days of history to analyze"),
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db),
):
    """
    Get time series trend analysis.
    
    Returns:
    - Seasonal patterns
    - Trend forecasts
    - Anomaly detection
    - Growth rate analysis
    
    Requirements: 5.2, 8.2
    """
    logger.info(f"User {current_user.id} fetching time series trends for {metric}")
    
    # Get historical data
    start_date = datetime.utcnow() - timedelta(days=period_days)
    
    # Query data based on metric type
    if metric == "violations":
        daily_data = db.query(
            func.date(AIDetection.created_at).label('date'),
            func.count(AIDetection.id).label('count')
        ).filter(
            AIDetection.created_at >= start_date,
            AIDetection.detection_type == "violation"
        ).group_by(
            func.date(AIDetection.created_at)
        ).order_by(
            func.date(AIDetection.created_at)
        ).all()
    else:
        daily_data = db.query(
            func.date(AIDetection.created_at).label('date'),
            func.count(AIDetection.id).label('count')
        ).filter(
            AIDetection.created_at >= start_date
        ).group_by(
            func.date(AIDetection.created_at)
        ).order_by(
            func.date(AIDetection.created_at)
        ).all()
    
    if not daily_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No data available for metric '{metric}' in the specified period"
        )
    
    # Convert to TimeSeries
    timestamps = [datetime.combine(d.date, datetime.min.time()) for d in daily_data]
    values = [float(d.count) for d in daily_data]
    
    time_series = TimeSeries(
        timestamps=timestamps,
        values=values,
        metric_name=metric
    )
    
    # Perform comprehensive analysis
    seasonal_analysis = time_series_trend_analyzer.detect_seasonal_patterns(time_series)
    anomalies = time_series_trend_analyzer.identify_anomalies(time_series)
    growth_analysis = time_series_trend_analyzer.calculate_growth_rates(time_series)
    
    # Generate forecast
    violation_metrics = [
        ViolationMetrics(
            timestamp=ts,
            violation_count=int(val),
            violation_types={},
            average_severity=0.5
        )
        for ts, val in zip(timestamps, values)
    ]
    
    forecasts = time_series_trend_analyzer.forecast_violation_trends(
        violation_metrics,
        forecast_periods=7
    )
    
    return {
        "seasonal_analysis": {
            "has_seasonal_pattern": seasonal_analysis.has_seasonal_pattern,
            "pattern_type": seasonal_analysis.pattern_type,
            "peak_periods": seasonal_analysis.peak_periods,
            "low_periods": seasonal_analysis.low_periods,
            "pattern_strength": round(seasonal_analysis.pattern_strength, 3),
            "description": seasonal_analysis.description
        },
        "anomalies": [
            {
                "timestamp": a.timestamp.isoformat(),
                "actual_value": a.actual_value,
                "expected_value": a.expected_value,
                "deviation": round(a.deviation, 2),
                "severity": a.severity,
                "anomaly_type": a.anomaly_type,
                "description": a.description
            }
            for a in anomalies
        ],
        "growth_analysis": {
            "period": growth_analysis.period,
            "growth_rate": round(growth_analysis.growth_rate, 2),
            "absolute_change": round(growth_analysis.absolute_change, 2),
            "trend_direction": growth_analysis.trend_direction,
            "is_significant": growth_analysis.is_significant
        },
        "forecasts": [
            {
                "forecast_period": f.forecast_period,
                "predicted_value": round(f.predicted_value, 2),
                "confidence_interval": [round(f.confidence_interval[0], 2), round(f.confidence_interval[1], 2)],
                "trend_direction": f.trend_direction,
                "trend_strength": round(f.trend_strength, 3)
            }
            for f in forecasts
        ],
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/location-hotspots")
def get_location_hotspots(
    days: int = Query(7, ge=1, le=30, description="Days of history to analyze"),
    min_violations: int = Query(5, ge=1, description="Minimum violations to qualify as hotspot"),
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db),
):
    """
    Get violation hotspot analysis by location.
    
    Returns:
    - High-risk locations
    - Violation density
    - Risk scores
    - Recommended actions
    
    Requirements: 5.2, 8.2
    """
    logger.info(f"User {current_user.id} fetching location hotspots")
    
    # Get violations by camera location
    start_date = datetime.utcnow() - timedelta(days=days)
    
    hotspot_data = db.query(
        Camera.id.label('camera_id'),
        Camera.name.label('camera_name'),
        Camera.location_name.label('location'),
        Camera.latitude,
        Camera.longitude,
        func.count(AIDetection.id).label('violation_count'),
        func.avg(AIDetection.confidence_score).label('avg_confidence')
    ).join(
        CameraVideo, Camera.id == CameraVideo.camera_id
    ).join(
        AIDetection, CameraVideo.id == AIDetection.video_id
    ).filter(
        AIDetection.created_at >= start_date,
        AIDetection.detection_type == "violation"
    ).group_by(
        Camera.id, Camera.name, Camera.location_name, Camera.latitude, Camera.longitude
    ).having(
        func.count(AIDetection.id) >= min_violations
    ).order_by(
        func.count(AIDetection.id).desc()
    ).all()
    
    # Calculate risk scores and generate recommendations
    hotspots = []
    hotspot_recommendations = []
    
    for hotspot in hotspot_data:
        # Calculate risk score (0-100)
        violation_count = hotspot.violation_count
        avg_confidence = float(hotspot.avg_confidence or 0)
        
        # Risk score based on violation count and confidence
        risk_score = min(100, (violation_count / days) * 10 + avg_confidence * 20)
        
        # Determine risk level
        if risk_score >= 75:
            risk_level = "high"
        elif risk_score >= 50:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        hotspot_dict = {
            "camera_id": hotspot.camera_id,
            "camera_name": hotspot.camera_name,
            "location": hotspot.location,
            "coordinates": {
                "latitude": float(hotspot.latitude) if hotspot.latitude else None,
                "longitude": float(hotspot.longitude) if hotspot.longitude else None
            },
            "violation_count": violation_count,
            "violations_per_day": round(violation_count / days, 2),
            "risk_score": round(risk_score, 2),
            "risk_level": risk_level,
            "avg_confidence": round(avg_confidence, 3)
        }
        
        hotspots.append(hotspot_dict)
    
    # Generate enforcement recommendations for hotspots
    if hotspots:
        hotspot_data_for_engine = [
            {
                'location': h['location'],
                'violation_count': h['violation_count'],
                'risk_level': h['risk_level']
            }
            for h in hotspots
        ]
        
        recommendations = action_recommendation_engine.recommend_enforcement_actions(
            hotspot_data_for_engine
        )
        
        hotspot_recommendations = [
            {
                "description": rec.description,
                "priority": rec.priority,
                "expected_impact": rec.expected_impact,
                "recommended_actions": rec.supporting_data.get('recommended_actions', [])
            }
            for rec in recommendations
        ]
    
    return {
        "hotspots": hotspots,
        "total_hotspots": len(hotspots),
        "recommendations": hotspot_recommendations,
        "analysis_period_days": days,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/comparative-analysis")
def get_comparative_analysis(
    period1_start: str = Query(..., description="Period 1 start date (YYYY-MM-DD)"),
    period1_end: str = Query(..., description="Period 1 end date (YYYY-MM-DD)"),
    period2_start: str = Query(..., description="Period 2 start date (YYYY-MM-DD)"),
    period2_end: str = Query(..., description="Period 2 end date (YYYY-MM-DD)"),
    current_user: User = Depends(require_roles(["admin", "officer"])),
    db: Session = Depends(get_db),
):
    """
    Compare system performance between two time periods.
    
    Returns:
    - Violation count comparison
    - Detection accuracy comparison
    - Processing performance comparison
    - Trend analysis
    
    Requirements: 5.2, 8.3
    """
    logger.info(f"User {current_user.id} fetching comparative analysis")
    
    try:
        p1_start = datetime.strptime(period1_start, "%Y-%m-%d")
        p1_end = datetime.strptime(period1_end, "%Y-%m-%d") + timedelta(days=1)
        p2_start = datetime.strptime(period2_start, "%Y-%m-%d")
        p2_end = datetime.strptime(period2_end, "%Y-%m-%d") + timedelta(days=1)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    # Period 1 metrics
    p1_violations = db.query(AIDetection).filter(
        AIDetection.created_at >= p1_start,
        AIDetection.created_at < p1_end,
        AIDetection.detection_type == "violation"
    ).count()
    
    p1_detections = db.query(AIDetection).filter(
        AIDetection.created_at >= p1_start,
        AIDetection.created_at < p1_end
    ).count()
    
    p1_avg_confidence = db.query(
        func.avg(AIDetection.confidence_score)
    ).filter(
        AIDetection.created_at >= p1_start,
        AIDetection.created_at < p1_end
    ).scalar() or 0.0
    
    # Period 2 metrics
    p2_violations = db.query(AIDetection).filter(
        AIDetection.created_at >= p2_start,
        AIDetection.created_at < p2_end,
        AIDetection.detection_type == "violation"
    ).count()
    
    p2_detections = db.query(AIDetection).filter(
        AIDetection.created_at >= p2_start,
        AIDetection.created_at < p2_end
    ).count()
    
    p2_avg_confidence = db.query(
        func.avg(AIDetection.confidence_score)
    ).filter(
        AIDetection.created_at >= p2_start,
        AIDetection.created_at < p2_end
    ).scalar() or 0.0
    
    # Calculate changes
    violation_change = p2_violations - p1_violations
    violation_change_pct = (violation_change / p1_violations * 100) if p1_violations > 0 else 0.0
    
    detection_change = p2_detections - p1_detections
    detection_change_pct = (detection_change / p1_detections * 100) if p1_detections > 0 else 0.0
    
    confidence_change = float(p2_avg_confidence) - float(p1_avg_confidence)
    confidence_change_pct = (confidence_change / float(p1_avg_confidence) * 100) if p1_avg_confidence > 0 else 0.0
    
    return {
        "period1": {
            "start_date": period1_start,
            "end_date": period1_end,
            "violations": p1_violations,
            "total_detections": p1_detections,
            "avg_confidence": round(float(p1_avg_confidence), 3)
        },
        "period2": {
            "start_date": period2_start,
            "end_date": period2_end,
            "violations": p2_violations,
            "total_detections": p2_detections,
            "avg_confidence": round(float(p2_avg_confidence), 3)
        },
        "comparison": {
            "violation_change": violation_change,
            "violation_change_percentage": round(violation_change_pct, 2),
            "detection_change": detection_change,
            "detection_change_percentage": round(detection_change_pct, 2),
            "confidence_change": round(confidence_change, 3),
            "confidence_change_percentage": round(confidence_change_pct, 2)
        },
        "timestamp": datetime.utcnow().isoformat()
    }
