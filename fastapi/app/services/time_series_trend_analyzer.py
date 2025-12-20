"""
Time Series Trend Analyzer for AI Traffic Detection System.

This module analyzes time series data to detect seasonal patterns,
forecast violation trends, and identify anomalies in traffic data.
"""

import logging
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta, timezone
from dataclasses import dataclass
from collections import defaultdict
import statistics

logger = logging.getLogger(__name__)


@dataclass
class TimeSeries:
    """Time series data structure."""
    timestamps: List[datetime]
    values: List[float]
    metric_name: str


@dataclass
class ViolationMetrics:
    """Violation metrics for a time period."""
    timestamp: datetime
    violation_count: int
    violation_types: Dict[str, int]
    average_severity: float


@dataclass
class SeasonalAnalysis:
    """Seasonal pattern analysis results."""
    has_seasonal_pattern: bool
    pattern_type: str  # "hourly", "daily", "weekly", "monthly"
    peak_periods: List[str]
    low_periods: List[str]
    pattern_strength: float  # 0.0 to 1.0
    seasonal_factors: Dict[str, float]
    description: str
    timestamp: datetime


@dataclass
class ForecastResult:
    """Violation trend forecast results."""
    forecast_period: str
    predicted_value: float
    confidence_interval: Tuple[float, float]
    trend_direction: str  # "increasing", "decreasing", "stable"
    trend_strength: float  # 0.0 to 1.0
    forecast_method: str
    timestamp: datetime


@dataclass
class Anomaly:
    """Anomaly detection result."""
    timestamp: datetime
    actual_value: float
    expected_value: float
    deviation: float
    severity: str  # "low", "medium", "high"
    anomaly_type: str  # "spike", "drop", "outlier"
    description: str


@dataclass
class GrowthAnalysis:
    """Growth rate analysis results."""
    period: str
    growth_rate: float  # percentage
    absolute_change: float
    trend_direction: str
    is_significant: bool
    comparison_periods: List[str]
    timestamp: datetime


class TimeSeriesTrendAnalyzer:
    """
    Analyze time series data for trends, patterns, and anomalies.
    
    Provides seasonal pattern detection, violation forecasting,
    anomaly detection, and growth rate analysis.
    """
    
    def __init__(self):
        """Initialize the trend analyzer."""
        self.historical_data: Dict[str, TimeSeries] = {}
        
        # Thresholds for analysis
        self.thresholds = {
            'seasonal_strength_min': 0.3,  # Minimum strength to detect pattern
            'anomaly_std_multiplier': 2.5,  # Standard deviations for anomaly
            'significant_growth_threshold': 0.1,  # 10% change is significant
            'trend_strength_min': 0.2,  # Minimum for trend detection
        }
    
    def detect_seasonal_patterns(
        self,
        time_series: TimeSeries
    ) -> SeasonalAnalysis:
        """
        Detect seasonal patterns in time series data.
        
        Args:
            time_series: Time series data to analyze
        
        Returns:
            Seasonal pattern analysis
        """
        if len(time_series.values) < 24:  # Need at least 24 data points
            return SeasonalAnalysis(
                has_seasonal_pattern=False,
                pattern_type="insufficient_data",
                peak_periods=[],
                low_periods=[],
                pattern_strength=0.0,
                seasonal_factors={},
                description="Insufficient data for seasonal analysis",
                timestamp=datetime.now(timezone.utc)
            )
        
        # Analyze hourly patterns
        hourly_data = defaultdict(list)
        for ts, value in zip(time_series.timestamps, time_series.values):
            hour = ts.hour
            hourly_data[hour].append(value)
        
        # Calculate average for each hour
        hourly_averages = {
            hour: statistics.mean(values)
            for hour, values in hourly_data.items()
        }
        
        if not hourly_averages:
            return SeasonalAnalysis(
                has_seasonal_pattern=False,
                pattern_type="no_pattern",
                peak_periods=[],
                low_periods=[],
                pattern_strength=0.0,
                seasonal_factors={},
                description="No seasonal pattern detected",
                timestamp=datetime.now(timezone.utc)
            )
        
        # Calculate overall statistics
        overall_mean = statistics.mean(time_series.values)
        overall_std = statistics.stdev(time_series.values) if len(time_series.values) > 1 else 0.0
        
        # Calculate seasonal factors (ratio to mean)
        seasonal_factors = {
            str(hour): avg / overall_mean if overall_mean > 0 else 1.0
            for hour, avg in hourly_averages.items()
        }
        
        # Identify peaks and lows
        sorted_hours = sorted(hourly_averages.items(), key=lambda x: x[1], reverse=True)
        peak_hours = [str(h) for h, _ in sorted_hours[:3]]  # Top 3 hours
        low_hours = [str(h) for h, _ in sorted_hours[-3:]]  # Bottom 3 hours
        
        # Calculate pattern strength (coefficient of variation)
        if overall_mean > 0:
            pattern_strength = overall_std / overall_mean
            pattern_strength = min(pattern_strength, 1.0)  # Cap at 1.0
        else:
            pattern_strength = 0.0
        
        has_pattern = pattern_strength >= self.thresholds['seasonal_strength_min']
        
        # Generate description
        if has_pattern:
            description = (
                f"Hourly seasonal pattern detected with {pattern_strength:.1%} strength. "
                f"Peak hours: {', '.join(peak_hours)}. "
                f"Low hours: {', '.join(low_hours)}."
            )
        else:
            description = "No significant seasonal pattern detected in the data."
        
        analysis = SeasonalAnalysis(
            has_seasonal_pattern=has_pattern,
            pattern_type="hourly" if has_pattern else "none",
            peak_periods=peak_hours,
            low_periods=low_hours,
            pattern_strength=pattern_strength,
            seasonal_factors=seasonal_factors,
            description=description,
            timestamp=datetime.now(timezone.utc)
        )
        
        logger.info(
            f"Seasonal analysis: pattern={has_pattern}, "
            f"strength={pattern_strength:.3f}"
        )
        
        return analysis
    
    def forecast_violation_trends(
        self,
        historical_data: List[ViolationMetrics],
        forecast_periods: int = 7
    ) -> List[ForecastResult]:
        """
        Forecast violation trends using simple moving average.
        
        Args:
            historical_data: Historical violation metrics
            forecast_periods: Number of periods to forecast
        
        Returns:
            List of forecast results
        """
        if len(historical_data) < 3:
            logger.warning("Insufficient data for forecasting")
            return []
        
        # Extract values
        values = [m.violation_count for m in historical_data]
        
        # Calculate moving average (last 7 periods)
        window_size = min(7, len(values))
        recent_values = values[-window_size:]
        moving_avg = statistics.mean(recent_values)
        
        # Calculate trend
        if len(values) >= 2:
            # Simple linear trend
            first_half = statistics.mean(values[:len(values)//2])
            second_half = statistics.mean(values[len(values)//2:])
            trend = second_half - first_half
            
            if abs(trend) > moving_avg * self.thresholds['trend_strength_min']:
                if trend > 0:
                    trend_direction = "increasing"
                    trend_strength = min(abs(trend) / moving_avg, 1.0)
                else:
                    trend_direction = "decreasing"
                    trend_strength = min(abs(trend) / moving_avg, 1.0)
            else:
                trend_direction = "stable"
                trend_strength = 0.0
        else:
            trend = 0.0
            trend_direction = "stable"
            trend_strength = 0.0
        
        # Calculate standard deviation for confidence interval
        std_dev = statistics.stdev(recent_values) if len(recent_values) > 1 else 0.0
        
        # Generate forecasts
        forecasts = []
        last_timestamp = historical_data[-1].timestamp
        
        for i in range(1, forecast_periods + 1):
            # Simple forecast: moving average + trend
            predicted_value = moving_avg + (trend * i / len(values))
            predicted_value = max(0, predicted_value)  # Can't be negative
            
            # Confidence interval (±2 standard deviations)
            lower_bound = max(0, predicted_value - 2 * std_dev)
            upper_bound = predicted_value + 2 * std_dev
            
            # Forecast timestamp (assuming daily data)
            forecast_timestamp = last_timestamp + timedelta(days=i)
            
            forecast = ForecastResult(
                forecast_period=f"Day +{i}",
                predicted_value=predicted_value,
                confidence_interval=(lower_bound, upper_bound),
                trend_direction=trend_direction,
                trend_strength=trend_strength,
                forecast_method="moving_average",
                timestamp=forecast_timestamp
            )
            
            forecasts.append(forecast)
        
        logger.info(
            f"Generated {len(forecasts)} forecasts. "
            f"Trend: {trend_direction} (strength: {trend_strength:.3f})"
        )
        
        return forecasts
    
    def identify_anomalies(
        self,
        metrics: TimeSeries
    ) -> List[Anomaly]:
        """
        Identify anomalies in time series data.
        
        Args:
            metrics: Time series metrics to analyze
        
        Returns:
            List of detected anomalies
        """
        if len(metrics.values) < 10:
            logger.warning("Insufficient data for anomaly detection")
            return []
        
        # Calculate statistics
        mean_value = statistics.mean(metrics.values)
        std_dev = statistics.stdev(metrics.values)
        
        # Define anomaly threshold
        threshold = self.thresholds['anomaly_std_multiplier'] * std_dev
        
        anomalies = []
        
        for i, (timestamp, value) in enumerate(zip(metrics.timestamps, metrics.values)):
            deviation = abs(value - mean_value)
            
            # Check if anomaly
            if deviation > threshold:
                # Determine severity
                if deviation > threshold * 2:
                    severity = "high"
                elif deviation > threshold * 1.5:
                    severity = "medium"
                else:
                    severity = "low"
                
                # Determine type
                if value > mean_value:
                    anomaly_type = "spike"
                    description = f"Unusual spike detected: {value:.1f} (expected ~{mean_value:.1f})"
                else:
                    anomaly_type = "drop"
                    description = f"Unusual drop detected: {value:.1f} (expected ~{mean_value:.1f})"
                
                anomaly = Anomaly(
                    timestamp=timestamp,
                    actual_value=value,
                    expected_value=mean_value,
                    deviation=deviation,
                    severity=severity,
                    anomaly_type=anomaly_type,
                    description=description
                )
                
                anomalies.append(anomaly)
        
        logger.info(f"Detected {len(anomalies)} anomalies in time series")
        
        return anomalies
    
    def calculate_growth_rates(
        self,
        metrics: TimeSeries,
        comparison_period_days: int = 7
    ) -> GrowthAnalysis:
        """
        Calculate growth rates over time.
        
        Args:
            metrics: Time series metrics
            comparison_period_days: Days to compare
        
        Returns:
            Growth analysis results
        """
        if len(metrics.values) < 2:
            return GrowthAnalysis(
                period="insufficient_data",
                growth_rate=0.0,
                absolute_change=0.0,
                trend_direction="unknown",
                is_significant=False,
                comparison_periods=[],
                timestamp=datetime.now(timezone.utc)
            )
        
        # Split data into periods
        mid_point = len(metrics.values) // 2
        first_period = metrics.values[:mid_point]
        second_period = metrics.values[mid_point:]
        
        # Calculate averages
        first_avg = statistics.mean(first_period)
        second_avg = statistics.mean(second_period)
        
        # Calculate growth
        absolute_change = second_avg - first_avg
        
        if first_avg > 0:
            growth_rate = (absolute_change / first_avg) * 100  # Percentage
        else:
            growth_rate = 0.0
        
        # Determine trend direction
        if abs(growth_rate) < self.thresholds['significant_growth_threshold'] * 100:
            trend_direction = "stable"
            is_significant = False
        elif growth_rate > 0:
            trend_direction = "increasing"
            is_significant = True
        else:
            trend_direction = "decreasing"
            is_significant = True
        
        # Format periods
        first_period_str = f"{metrics.timestamps[0].strftime('%Y-%m-%d')} to {metrics.timestamps[mid_point-1].strftime('%Y-%m-%d')}"
        second_period_str = f"{metrics.timestamps[mid_point].strftime('%Y-%m-%d')} to {metrics.timestamps[-1].strftime('%Y-%m-%d')}"
        
        analysis = GrowthAnalysis(
            period=f"{comparison_period_days} days",
            growth_rate=growth_rate,
            absolute_change=absolute_change,
            trend_direction=trend_direction,
            is_significant=is_significant,
            comparison_periods=[first_period_str, second_period_str],
            timestamp=datetime.now(timezone.utc)
        )
        
        logger.info(
            f"Growth analysis: {growth_rate:+.1f}% change, "
            f"trend: {trend_direction}"
        )
        
        return analysis
    
    def add_time_series(self, name: str, time_series: TimeSeries) -> None:
        """
        Add time series to historical data.
        
        Args:
            name: Name identifier for the time series
            time_series: Time series data
        """
        self.historical_data[name] = time_series
        logger.info(f"Added time series '{name}' with {len(time_series.values)} points")
    
    def get_time_series(self, name: str) -> Optional[TimeSeries]:
        """
        Get time series by name.
        
        Args:
            name: Name identifier
        
        Returns:
            Time series data or None
        """
        return self.historical_data.get(name)
    
    def analyze_all(
        self,
        time_series: TimeSeries
    ) -> Dict[str, Any]:
        """
        Perform comprehensive analysis on time series.
        
        Args:
            time_series: Time series to analyze
        
        Returns:
            Dictionary with all analysis results
        """
        results = {
            'seasonal_analysis': self.detect_seasonal_patterns(time_series),
            'anomalies': self.identify_anomalies(time_series),
            'growth_analysis': self.calculate_growth_rates(time_series),
            'timestamp': datetime.now(timezone.utc)
        }
        
        logger.info("Comprehensive time series analysis completed")
        
        return results


# Global instance
time_series_trend_analyzer = TimeSeriesTrendAnalyzer()
