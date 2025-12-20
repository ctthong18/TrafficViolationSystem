"""
Action Recommendation Engine for AI Traffic Detection System.

This module provides intelligent recommendations based on violation patterns,
camera performance, and traffic hotspot analysis.
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)


class RecommendationType(Enum):
    """Types of recommendations."""
    CAMERA_ADJUSTMENT = "camera_adjustment"
    ENFORCEMENT = "enforcement"
    RESOURCE_ALLOCATION = "resource_allocation"
    SYSTEM_OPTIMIZATION = "system_optimization"


class Priority(Enum):
    """Recommendation priority levels."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


@dataclass
class ActionRecommendation:
    """Action recommendation data structure."""
    recommendation_type: str
    priority: str
    description: str
    expected_impact: str
    implementation_effort: str
    confidence_score: float
    supporting_data: Dict[str, Any]
    created_at: datetime


class ActionRecommendationEngine:
    """
    Engine for generating actionable recommendations based on
    violation patterns, camera performance, and traffic analysis.
    """
    
    def __init__(self):
        """Initialize the recommendation engine."""
        self.recommendation_history: List[ActionRecommendation] = []
        
        # Thresholds for recommendations
        self.thresholds = {
            'high_violation_rate': 10,  # violations per hour
            'low_detection_accuracy': 0.7,  # 70%
            'high_processing_time': 600,  # ms
            'camera_uptime_low': 0.9,  # 90%
            'hotspot_violation_count': 5  # violations in area
        }
    
    def analyze_violation_patterns(
        self,
        violations: List[Dict[str, Any]],
        time_window_hours: int = 24
    ) -> List[ActionRecommendation]:
        """
        Analyze violation patterns and generate recommendations.
        
        Args:
            violations: List of violation records
            time_window_hours: Time window for analysis
        
        Returns:
            List of action recommendations
        """
        recommendations = []
        
        if not violations:
            return recommendations
        
        # Calculate violation rate
        violation_rate = len(violations) / time_window_hours
        
        # High violation rate recommendation
        if violation_rate > self.thresholds['high_violation_rate']:
            recommendations.append(ActionRecommendation(
                recommendation_type=RecommendationType.ENFORCEMENT.value,
                priority=Priority.HIGH.value,
                description=f"High violation rate detected: {violation_rate:.1f} violations/hour",
                expected_impact="Reduce violations by 30-40% with increased enforcement",
                implementation_effort="Medium - requires additional enforcement personnel",
                confidence_score=0.85,
                supporting_data={
                    'violation_rate': violation_rate,
                    'threshold': self.thresholds['high_violation_rate'],
                    'time_window_hours': time_window_hours,
                    'total_violations': len(violations)
                },
                created_at=datetime.utcnow()
            ))
        
        # Analyze violation types
        violation_types = {}
        for violation in violations:
            v_type = violation.get('violation_type', 'unknown')
            violation_types[v_type] = violation_types.get(v_type, 0) + 1
        
        # Most common violation type
        if violation_types:
            most_common = max(violation_types.items(), key=lambda x: x[1])
            if most_common[1] > len(violations) * 0.5:  # More than 50%
                recommendations.append(ActionRecommendation(
                    recommendation_type=RecommendationType.ENFORCEMENT.value,
                    priority=Priority.MEDIUM.value,
                    description=f"Dominant violation type: {most_common[0]} ({most_common[1]} occurrences)",
                    expected_impact="Targeted enforcement can reduce this specific violation by 40-50%",
                    implementation_effort="Low - focused enforcement campaign",
                    confidence_score=0.78,
                    supporting_data={
                        'violation_type': most_common[0],
                        'count': most_common[1],
                        'percentage': (most_common[1] / len(violations)) * 100,
                        'all_types': violation_types
                    },
                    created_at=datetime.utcnow()
                ))
        
        # Analyze temporal patterns
        hourly_violations = {}
        for violation in violations:
            timestamp = violation.get('timestamp', 0)
            hour = datetime.fromtimestamp(timestamp).hour if timestamp else 0
            hourly_violations[hour] = hourly_violations.get(hour, 0) + 1
        
        if hourly_violations:
            peak_hour = max(hourly_violations.items(), key=lambda x: x[1])
            if peak_hour[1] > len(violations) * 0.3:  # More than 30% in one hour
                recommendations.append(ActionRecommendation(
                    recommendation_type=RecommendationType.RESOURCE_ALLOCATION.value,
                    priority=Priority.MEDIUM.value,
                    description=f"Peak violation hour: {peak_hour[0]}:00 with {peak_hour[1]} violations",
                    expected_impact="Optimize resource allocation during peak hours",
                    implementation_effort="Low - adjust shift schedules",
                    confidence_score=0.82,
                    supporting_data={
                        'peak_hour': peak_hour[0],
                        'violation_count': peak_hour[1],
                        'hourly_distribution': hourly_violations
                    },
                    created_at=datetime.utcnow()
                ))
        
        self.recommendation_history.extend(recommendations)
        return recommendations
    
    def suggest_camera_adjustments(
        self,
        camera_performance: Dict[str, Any]
    ) -> List[ActionRecommendation]:
        """
        Suggest camera adjustments based on performance metrics.
        
        Args:
            camera_performance: Camera performance data
        
        Returns:
            List of camera adjustment recommendations
        """
        recommendations = []
        
        camera_id = camera_performance.get('camera_id', 'unknown')
        detection_accuracy = camera_performance.get('detection_accuracy', 1.0)
        processing_time = camera_performance.get('avg_processing_time_ms', 0)
        uptime = camera_performance.get('uptime_percentage', 1.0)
        
        # Low detection accuracy
        if detection_accuracy < self.thresholds['low_detection_accuracy']:
            recommendations.append(ActionRecommendation(
                recommendation_type=RecommendationType.CAMERA_ADJUSTMENT.value,
                priority=Priority.HIGH.value,
                description=f"Camera {camera_id} has low detection accuracy: {detection_accuracy:.1%}",
                expected_impact="Improve detection accuracy by 15-20% with recalibration",
                implementation_effort="Medium - requires camera recalibration",
                confidence_score=0.88,
                supporting_data={
                    'camera_id': camera_id,
                    'current_accuracy': detection_accuracy,
                    'threshold': self.thresholds['low_detection_accuracy'],
                    'recommended_actions': [
                        'Check camera angle and positioning',
                        'Clean camera lens',
                        'Adjust lighting conditions',
                        'Recalibrate detection zones'
                    ]
                },
                created_at=datetime.utcnow()
            ))
        
        # High processing time
        if processing_time > self.thresholds['high_processing_time']:
            recommendations.append(ActionRecommendation(
                recommendation_type=RecommendationType.SYSTEM_OPTIMIZATION.value,
                priority=Priority.MEDIUM.value,
                description=f"Camera {camera_id} has high processing time: {processing_time:.0f}ms",
                expected_impact="Reduce latency by 30-40% with optimization",
                implementation_effort="Low - adjust detection parameters",
                confidence_score=0.75,
                supporting_data={
                    'camera_id': camera_id,
                    'current_processing_time': processing_time,
                    'threshold': self.thresholds['high_processing_time'],
                    'recommended_actions': [
                        'Reduce frame processing rate',
                        'Lower detection resolution',
                        'Optimize confidence threshold',
                        'Enable GPU acceleration'
                    ]
                },
                created_at=datetime.utcnow()
            ))
        
        # Low uptime
        if uptime < self.thresholds['camera_uptime_low']:
            recommendations.append(ActionRecommendation(
                recommendation_type=RecommendationType.CAMERA_ADJUSTMENT.value,
                priority=Priority.HIGH.value,
                description=f"Camera {camera_id} has low uptime: {uptime:.1%}",
                expected_impact="Improve system reliability and data coverage",
                implementation_effort="High - requires hardware inspection",
                confidence_score=0.92,
                supporting_data={
                    'camera_id': camera_id,
                    'current_uptime': uptime,
                    'threshold': self.thresholds['camera_uptime_low'],
                    'recommended_actions': [
                        'Check network connectivity',
                        'Inspect power supply',
                        'Review system logs for errors',
                        'Consider hardware replacement'
                    ]
                },
                created_at=datetime.utcnow()
            ))
        
        self.recommendation_history.extend(recommendations)
        return recommendations
    
    def recommend_enforcement_actions(
        self,
        hotspot_data: List[Dict[str, Any]]
    ) -> List[ActionRecommendation]:
        """
        Recommend enforcement actions based on hotspot analysis.
        
        Args:
            hotspot_data: List of violation hotspot data
        
        Returns:
            List of enforcement recommendations
        """
        recommendations = []
        
        if not hotspot_data:
            return recommendations
        
        # Sort hotspots by violation count
        sorted_hotspots = sorted(
            hotspot_data,
            key=lambda x: x.get('violation_count', 0),
            reverse=True
        )
        
        # Top hotspots
        for i, hotspot in enumerate(sorted_hotspots[:3]):  # Top 3 hotspots
            location = hotspot.get('location', 'Unknown')
            violation_count = hotspot.get('violation_count', 0)
            risk_level = hotspot.get('risk_level', 'medium')
            
            if violation_count >= self.thresholds['hotspot_violation_count']:
                priority = Priority.HIGH if risk_level == 'high' else Priority.MEDIUM
                
                recommendations.append(ActionRecommendation(
                    recommendation_type=RecommendationType.ENFORCEMENT.value,
                    priority=priority.value,
                    description=f"High-risk hotspot at {location} with {violation_count} violations",
                    expected_impact=f"Reduce violations at this location by 50-60%",
                    implementation_effort="Medium - deploy enforcement team",
                    confidence_score=0.87,
                    supporting_data={
                        'location': location,
                        'violation_count': violation_count,
                        'risk_level': risk_level,
                        'rank': i + 1,
                        'recommended_actions': [
                            'Deploy traffic enforcement officers',
                            'Install warning signs',
                            'Increase camera coverage',
                            'Implement traffic calming measures'
                        ]
                    },
                    created_at=datetime.utcnow()
                ))
        
        # Overall hotspot strategy
        if len(sorted_hotspots) > 5:
            recommendations.append(ActionRecommendation(
                recommendation_type=RecommendationType.RESOURCE_ALLOCATION.value,
                priority=Priority.MEDIUM.value,
                description=f"Multiple hotspots detected ({len(sorted_hotspots)} locations)",
                expected_impact="Systematic approach to reduce violations across all hotspots",
                implementation_effort="High - requires comprehensive strategy",
                confidence_score=0.80,
                supporting_data={
                    'total_hotspots': len(sorted_hotspots),
                    'total_violations': sum(h.get('violation_count', 0) for h in sorted_hotspots),
                    'recommended_actions': [
                        'Develop hotspot prioritization matrix',
                        'Allocate resources based on risk levels',
                        'Implement rotating enforcement schedule',
                        'Monitor effectiveness and adjust strategy'
                    ]
                },
                created_at=datetime.utcnow()
            ))
        
        self.recommendation_history.extend(recommendations)
        return recommendations
    
    def generate_resource_allocation_suggestions(
        self,
        traffic_patterns: Dict[str, Any]
    ) -> List[ActionRecommendation]:
        """
        Generate resource allocation suggestions based on traffic patterns.
        
        Args:
            traffic_patterns: Traffic pattern analysis data
        
        Returns:
            List of resource allocation recommendations
        """
        recommendations = []
        
        peak_hours = traffic_patterns.get('peak_hours', [])
        peak_locations = traffic_patterns.get('peak_locations', [])
        seasonal_patterns = traffic_patterns.get('seasonal_patterns', {})
        
        # Peak hours resource allocation
        if peak_hours:
            recommendations.append(ActionRecommendation(
                recommendation_type=RecommendationType.RESOURCE_ALLOCATION.value,
                priority=Priority.MEDIUM.value,
                description=f"Optimize staffing for peak hours: {', '.join(map(str, peak_hours))}",
                expected_impact="Improve response time and violation detection during peak periods",
                implementation_effort="Low - adjust shift schedules",
                confidence_score=0.83,
                supporting_data={
                    'peak_hours': peak_hours,
                    'recommended_actions': [
                        'Increase staff during peak hours',
                        'Pre-position enforcement teams',
                        'Enable additional camera monitoring',
                        'Prepare rapid response units'
                    ]
                },
                created_at=datetime.utcnow()
            ))
        
        # Peak locations resource allocation
        if peak_locations:
            recommendations.append(ActionRecommendation(
                recommendation_type=RecommendationType.RESOURCE_ALLOCATION.value,
                priority=Priority.MEDIUM.value,
                description=f"Focus resources on high-traffic locations",
                expected_impact="Maximize enforcement effectiveness and violation reduction",
                implementation_effort="Medium - requires coordination",
                confidence_score=0.79,
                supporting_data={
                    'peak_locations': peak_locations,
                    'recommended_actions': [
                        'Deploy mobile enforcement units',
                        'Increase camera density in peak areas',
                        'Coordinate with local traffic management',
                        'Implement dynamic resource allocation'
                    ]
                },
                created_at=datetime.utcnow()
            ))
        
        self.recommendation_history.extend(recommendations)
        return recommendations
    
    def get_all_recommendations(
        self,
        priority_filter: Optional[str] = None,
        type_filter: Optional[str] = None,
        limit: int = 10
    ) -> List[ActionRecommendation]:
        """
        Get all recommendations with optional filtering.
        
        Args:
            priority_filter: Filter by priority (high, medium, low)
            type_filter: Filter by recommendation type
            limit: Maximum number of recommendations to return
        
        Returns:
            List of filtered recommendations
        """
        filtered = self.recommendation_history
        
        if priority_filter:
            filtered = [r for r in filtered if r.priority == priority_filter]
        
        if type_filter:
            filtered = [r for r in filtered if r.recommendation_type == type_filter]
        
        # Sort by priority and confidence score
        priority_order = {'high': 0, 'medium': 1, 'low': 2}
        filtered.sort(
            key=lambda r: (priority_order.get(r.priority, 3), -r.confidence_score)
        )
        
        return filtered[:limit]
    
    def clear_old_recommendations(self, days: int = 7) -> int:
        """
        Clear recommendations older than specified days.
        
        Args:
            days: Number of days to keep recommendations
        
        Returns:
            Number of recommendations cleared
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        original_count = len(self.recommendation_history)
        self.recommendation_history = [
            r for r in self.recommendation_history
            if r.created_at > cutoff_date
        ]
        
        cleared_count = original_count - len(self.recommendation_history)
        logger.info(f"Cleared {cleared_count} old recommendations")
        
        return cleared_count


# Global instance
action_recommendation_engine = ActionRecommendationEngine()
